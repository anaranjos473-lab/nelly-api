package com.nelly.driver.data.repository

import android.content.Context
import android.media.MediaPlayer
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.ValueEventListener
import com.nelly.driver.R
import com.nelly.driver.data.local.PedidoDao
import com.nelly.driver.data.remote.OrderAcceptClient
import com.nelly.driver.model.PedidoEntity
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

class PedidoRepository(
    private val pedidoDao: PedidoDao,
    private val pedidosRef: DatabaseReference,
    context: Context,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val orderAcceptClient: OrderAcceptClient = OrderAcceptClient()
) {
    private val appContext = context.applicationContext
    private val syncScope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private var listener: ValueEventListener? = null
    private val idsPrevios = mutableSetOf<String>()
    private var cargaInicialCompletada = false

    fun observarPedidos(): Flow<List<PedidoEntity>> = pedidoDao.obtenerTodosLosPedidos()

    fun observarPedidosPorEstado(estado: String): Flow<List<PedidoEntity>> =
        pedidoDao.obtenerPedidosPorEstado(estado)

    fun iniciarSincronizacion(onError: (mensaje: String, throwable: Throwable?) -> Unit = { _, _ -> }) {
        if (listener != null) {
            return
        }

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
                }
            }

            override fun onCancelled(error: DatabaseError) {
                onError("RTDB listener cancelado", error.toException())
            }
        }

        pedidosRef.addValueEventListener(listener!!)
    }

    fun detenerSincronizacion() {
        val current = listener ?: return
        pedidosRef.removeEventListener(current)
        listener = null
        idsPrevios.clear()
        cargaInicialCompletada = false
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

        val estado = child("estado_pedido").getValue(String::class.java)
            ?: child("estado").getValue(String::class.java)
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

    private fun normalizarEstado(estadoRaw: String?): String {
        return when (estadoRaw?.trim()?.lowercase()) {
            "pendiente", "preparando", "cocina" -> "PREPARANDO"
            "listo", "listo_para_reparto", "esperando_repartidor", "despacho" -> "LISTO"
            "en_camino", "en_reparto", "reparto" -> "EN_CAMINO"
            "entregado", "finalizado" -> "ENTREGADO"
            null, "" -> "PREPARANDO"
            else -> estadoRaw.trim().uppercase()
        }
    }

    private fun esEstadoDisponibleParaDriver(estado: String): Boolean {
        return estado == "LISTO"
    }
}
