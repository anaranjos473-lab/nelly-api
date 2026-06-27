package com.nelly.driver.data.repository

import android.content.Context
import android.media.MediaPlayer
import android.util.Log
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.nelly.driver.R
import com.nelly.driver.data.local.PedidoDao
import com.nelly.driver.data.remote.OrderCompleteClient
import com.nelly.driver.data.remote.OrderAcceptClient
import com.nelly.driver.model.PedidoEntity
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class PedidoRepository(
    private val pedidoDao: PedidoDao,
    private val pedidosRef: DatabaseReference,
    context: Context,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val orderAcceptClient: OrderAcceptClient = OrderAcceptClient(),
    private val orderCompleteClient: OrderCompleteClient = OrderCompleteClient()
) {
    private val appContext = context.applicationContext
    private val syncScope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private var listener: ValueEventListener? = null
    private var connectedListener: ValueEventListener? = null
    private val idsPrevios = mutableSetOf<String>()
    private var cargaInicialCompletada = false
    private val _syncEventos = MutableStateFlow("IDLE")
    val syncEventos: StateFlow<String> = _syncEventos.asStateFlow()
    private val _pedidoActivoId = MutableStateFlow<String?>(null)
    val pedidoActivoId: StateFlow<String?> = _pedidoActivoId.asStateFlow()
    private val conexionRef: DatabaseReference = FirebaseDatabase.getInstance().getReference(".info/connected")

    data class EstadoOperativo(
        val pedidoId: String?,
        val estadoPedido: String?,
        val destino: Destino
    )

    enum class Destino {
        TRACKING,
        PEDIDOS_DISPONIBLES
    }

    fun observarPedidos(): Flow<List<PedidoEntity>> = pedidoDao.obtenerTodosLosPedidos()

    fun observarPedidosPorEstado(estado: String): Flow<List<PedidoEntity>> =
        pedidoDao.obtenerPedidosPorEstado(estado)

    fun limpiarPedidoActivoLocal() {
        _pedidoActivoId.value = null
    }

    fun resolverEstadoOperativo(
        repartidorUid: String?,
        onResult: (EstadoOperativo) -> Unit
    ) {
        val uid = repartidorUid?.trim().orEmpty()
        Log.i(TAG_APP_START, "APP START")
        Log.i(TAG_APP_START, "Pedido Room/local: ignorado para navegacion")
        if (uid.isBlank()) {
            Log.i(TAG_APP_START, "Sesion: SIN_UID")
            _pedidoActivoId.value = null
            onResult(EstadoOperativo(null, null, Destino.PEDIDOS_DISPONIBLES))
            return
        }

        Log.i(TAG_APP_START, "Sesion OK: $uid")
        FirebaseDatabase.getInstance()
            .getReference("repartidores/$uid/pedido_activo")
            .addListenerForSingleValueEvent(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val pedidoActivoRtdb = snapshot.getValue(String::class.java)?.trim().orEmpty()
                    Log.i(TAG_APP_START, "Pedido RTDB repartidor/$uid/pedido_activo: ${pedidoActivoRtdb.ifBlank { "null" }}")
                    if (pedidoActivoRtdb.isBlank()) {
                        _pedidoActivoId.value = null
                        Log.i(TAG_APP_START, "Destino: PEDIDOS_DISPONIBLES")
                        onResult(EstadoOperativo(null, null, Destino.PEDIDOS_DISPONIBLES))
                        return
                    }

                    validarPedidoActivoRemoto(pedidoActivoRtdb, uid, onResult)
                }

                override fun onCancelled(error: DatabaseError) {
                    Log.e(TAG_APP_START, "Error consultando pedido activo RTDB: ${error.message}")
                    _pedidoActivoId.value = null
                    Log.i(TAG_APP_START, "Destino: PEDIDOS_DISPONIBLES")
                    onResult(EstadoOperativo(null, null, Destino.PEDIDOS_DISPONIBLES))
                }
            })
    }

    private fun validarPedidoActivoRemoto(
        pedidoId: String,
        repartidorUid: String,
        onResult: (EstadoOperativo) -> Unit
    ) {
        val pedidoRef = FirebaseDatabase.getInstance().getReference("pedidos/$pedidoId")
        pedidoRef.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (!snapshot.exists()) {
                    _pedidoActivoId.value = null
                    Log.i(TAG_APP_START, "Pedido RTDB detalle: inexistente")
                    Log.i(TAG_APP_START, "Destino: PEDIDOS_DISPONIBLES")
                    onResult(EstadoOperativo(null, null, Destino.PEDIDOS_DISPONIBLES))
                    return
                }

                val estado = snapshot.child("estado_pedido").getValue(String::class.java)
                    ?: snapshot.child("estado").getValue(String::class.java)
                    ?: snapshot.child("logistica").child("estado").getValue(String::class.java)
                val normalized = normalizarEstado(estado)
                val repartidorAsignado = obtenerRepartidorAsignado(snapshot)
                Log.i(TAG_APP_START, "Pedido RTDB detalle: id=$pedidoId estado=$normalized repartidor=${repartidorAsignado ?: "null"}")
                if (normalized == "ENTREGADO" || normalized == "CANCELADO") {
                    _pedidoActivoId.value = null
                    Log.i(TAG_APP_START, "Destino: PEDIDOS_DISPONIBLES")
                    onResult(EstadoOperativo(null, normalized, Destino.PEDIDOS_DISPONIBLES))
                    return
                }
                if (!repartidorAsignado.isNullOrBlank() && repartidorAsignado != repartidorUid) {
                    _pedidoActivoId.value = null
                    Log.i(TAG_APP_START, "Destino: PEDIDOS_DISPONIBLES")
                    onResult(EstadoOperativo(null, normalized, Destino.PEDIDOS_DISPONIBLES))
                    return
                }

                _pedidoActivoId.value = pedidoId
                Log.i(TAG_APP_START, "Destino: TRACKING")
                onResult(EstadoOperativo(pedidoId, normalized, Destino.TRACKING))
            }

            override fun onCancelled(error: DatabaseError) {
                Log.e(TAG_APP_START, "Error validando pedido activo RTDB: ${error.message}")
                _pedidoActivoId.value = null
                Log.i(TAG_APP_START, "Destino: PEDIDOS_DISPONIBLES")
                onResult(EstadoOperativo(null, null, Destino.PEDIDOS_DISPONIBLES))
            }
        })
    }

    fun iniciarSincronizacion(onError: (mensaje: String, throwable: Throwable?) -> Unit = { _, _ -> }) {
        if (listener != null) {
            return
        }

        startConnectionListener()
        _syncEventos.value = "ROOM_SYNC_STARTED"

        listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val pedidos = snapshot.children
                    .mapNotNull { child -> child.toPedidoEntity() }
                    .filter { pedido -> esEstadoDisponibleParaDriver(pedido.estado) }
                val idsActuales = pedidos.map { it.id }.toSet()

                if (cargaInicialCompletada) {
                    val nuevos = idsActuales - idsPrevios
                    if (nuevos.isNotEmpty()) {
                        reproducirNotificacionPedido()
                    }
                } else {
                    cargaInicialCompletada = true
                }

                idsPrevios.clear()
                idsPrevios.addAll(idsActuales)

                syncScope.launch {
                    pedidoDao.borrarTodaLaTabla()
                    if (pedidos.isNotEmpty()) {
                        pedidoDao.insertarPedidos(pedidos)
                    }
                    _syncEventos.value = "ROOM_SYNC_FINISHED"
                }
            }

            override fun onCancelled(error: DatabaseError) {
                _syncEventos.value = "ERROR_SYNC"
                onError("RTDB listener cancelado", error.toException())
            }
        }

        pedidosRef.keepSynced(true)
        pedidosRef.addValueEventListener(listener!!)
    }

    fun detenerSincronizacion() {
        val current = listener ?: return
        pedidosRef.removeEventListener(current)
        pedidosRef.keepSynced(false)
        stopConnectionListener()
        listener = null
        idsPrevios.clear()
        cargaInicialCompletada = false
        _syncEventos.value = "STOPPED"
    }

    private fun startConnectionListener() {
        if (connectedListener != null) {
            return
        }

        connectedListener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val connected = snapshot.getValue(Boolean::class.java) == true
                _syncEventos.value = if (connected) "NETWORK_RESTORED" else "NETWORK_LOST"
            }

            override fun onCancelled(error: DatabaseError) {
                // Connection info listener is advisory; keep sync state unchanged.
            }
        }

        conexionRef.addValueEventListener(connectedListener!!)
    }

    private fun stopConnectionListener() {
        val current = connectedListener ?: return
        conexionRef.removeEventListener(current)
        connectedListener = null
    }

    private fun reproducirNotificacionPedido() {
        val player = MediaPlayer.create(appContext, R.raw.notificacion_pedido) ?: return
        player.setOnCompletionListener { it.release() }
        player.setOnErrorListener { mp, _, _ ->
            mp.release()
            true
        }
        player.start()
    }

    fun aceptarPedido(
        pedidoId: String,
        repartidorUid: String,
        onResult: (ok: Boolean, mensaje: String) -> Unit
    ) {
        if (repartidorUid.isBlank()) {
            onResult(false, "Sesion invalida. Cierra sesion y vuelve a entrar")
            return
        }

        orderAcceptClient.acceptOrder(pedidoId) { response ->
            if (response.ok) {
                _pedidoActivoId.value = pedidoId
                syncScope.launch {
                    pedidoDao.borrarTodaLaTabla()
                }
                onResult(true, "Pedido aceptado y movido a seguimiento")
                return@acceptOrder
            }

            // Errores funcionales ya validados por backend (deuda, estado, auth, request).
            if (response.statusCode == 400 || response.statusCode == 401 || response.statusCode == 403 || response.statusCode == 409) {
                val msg = extraerMensajeErrorBackend(response.body)
                onResult(false, msg)
                return@acceptOrder
            }

            onResult(false, "Servicio de aceptacion no disponible. Intenta nuevamente en unos segundos")
        }
    }

    fun completarPedido(
        pedidoId: String,
        onResult: (ok: Boolean, mensaje: String) -> Unit
    ) {
        if (pedidoId.isBlank()) {
            onResult(false, "No hay pedido activo para completar")
            return
        }

        orderCompleteClient.completeOrder(pedidoId) { response ->
            if (response.ok) {
                _pedidoActivoId.value = null
                syncScope.launch {
                    pedidoDao.borrarTodaLaTabla()
                }
                onResult(true, "Entrega completada")
                return@completeOrder
            }

            val mensaje = if (response.statusCode in listOf(400, 401, 403, 404, 409)) {
                extraerMensajeErrorBackend(response.body)
            } else {
                "Servicio de cierre no disponible. Intenta nuevamente en unos segundos"
            }
            onResult(false, mensaje)
        }
    }

    private fun extraerMensajeErrorBackend(body: String): String {
        if (body.isBlank()) {
            return "No fue posible aceptar el pedido"
        }

        val normalized = body.lowercase()
        if (normalized.contains("limite de deuda")) {
            return "Limite de deuda alcanzado. Favor de liquidar comisiones."
        }
        if (normalized.contains("ya fue tomado")) {
            return "El pedido ya fue tomado por otro repartidor"
        }
        if (normalized.contains("token")) {
            return "Sesion invalida. Cierra sesion y vuelve a entrar"
        }

        return body
    }


    private fun DataSnapshot.toPedidoEntity(): PedidoEntity? {
        val id = child("id_pedido").getValue(String::class.java)
            ?: child("id").getValue(String::class.java)
            ?: key
            ?: return null

        val clienteNombre = child("cliente_nombre").getValue(String::class.java)
            ?: child("cliente").getValue(String::class.java)
            ?: ""

        val montoTotal = child("monto_total").getValue(Double::class.java)
            ?: child("monto").getValue(Double::class.java)
            ?: child("total").getValue(Double::class.java)
            ?: 0.0

        val estadoLogistica = child("logistica").child("estado").getValue(String::class.java)
        val estado = child("estado_pedido").getValue(String::class.java)
            ?: child("estado").getValue(String::class.java)
            ?: estadoLogistica
            ?: "PENDIENTE"

        val timestamp = child("timestamp").getValue(Long::class.java)
            ?: System.currentTimeMillis()

        return PedidoEntity(
            id = id,
            clienteNombre = clienteNombre,
            montoTotal = montoTotal,
            estado = normalizarEstado(estado),
            timestamp = timestamp
        )
    }

    private fun obtenerRepartidorAsignado(snapshot: DataSnapshot): String? {
        return snapshot.child("repartidor_id").getValue(String::class.java)
            ?: snapshot.child("repartidorId").getValue(String::class.java)
            ?: snapshot.child("conductorId").getValue(String::class.java)
            ?: snapshot.child("driverUid").getValue(String::class.java)
            ?: snapshot.child("uid_repartidor").getValue(String::class.java)
    }

    private fun normalizarEstado(estadoRaw: String?): String {
        return when (estadoRaw?.trim()?.lowercase()) {
            "pendiente", "preparando", "cocina" -> "PENDIENTE"
            "listo", "pendiente_aceptacion", "listo_para_reparto", "esperando_repartidor", "despacho", "disponible", "disponible_para_reparto", "libre" -> "LISTO"
            "en_camino", "en_curso", "en_reparto", "reparto", "llegue_a_tienda", "pedido_abordo", "llegue_a_cliente" -> "EN_CURSO"
            "entregado", "finalizado" -> "ENTREGADO"
            "cancelado", "cancelada" -> "CANCELADO"
            null, "" -> "PENDIENTE"
            else -> estadoRaw.trim().uppercase()
        }
    }

    private fun esEstadoDisponibleParaDriver(estado: String): Boolean {
        return estado == "LISTO"
    }

    private companion object {
        const val TAG_APP_START = "NellyAppStart"
    }
}
