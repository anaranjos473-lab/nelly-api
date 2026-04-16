package com.nelly.driver.data.repository

import android.content.Context
import android.media.MediaPlayer
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.MutableData
import com.google.firebase.database.Transaction
import com.google.firebase.database.ValueEventListener
import com.nelly.driver.R
import com.nelly.driver.data.local.PedidoDao
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
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val appContext = context.applicationContext
    private val rootRef: DatabaseReference = pedidosRef.root
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
                val pedidos = snapshot.children.mapNotNull { child -> child.toPedidoEntity() }
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
        val pedidoRef = pedidosRef.child(pedidoId)
        pedidoRef.runTransaction(object : Transaction.Handler {
            override fun doTransaction(currentData: MutableData): Transaction.Result {
                val actual = currentData.value as? Map<*, *> ?: return Transaction.abort()
                val estadoActual = actual["estado"]?.toString()?.lowercase() ?: ""
                val repartidorActual = actual["repartidor"]?.toString()

                val puedeTomar = estadoActual == "esperando_repartidor" || repartidorActual == repartidorUid
                if (!puedeTomar) {
                    return Transaction.abort()
                }

                val actualizado = HashMap<String, Any?>()
                actual.forEach { (k, v) ->
                    if (k is String) {
                        actualizado[k] = v
                    }
                }

                actualizado["id"] = actualizado["id"] ?: pedidoId
                actualizado["id_pedido"] = actualizado["id_pedido"] ?: pedidoId
                actualizado["estado"] = "en_camino"
                actualizado["repartidor"] = repartidorUid
                actualizado["aceptado_en"] = System.currentTimeMillis()
                currentData.value = actualizado
                return Transaction.success(currentData)
            }

            override fun onComplete(
                error: DatabaseError?,
                committed: Boolean,
                currentData: DataSnapshot?
            ) {
                if (error != null) {
                    onResult(false, "No se pudo aceptar pedido: ${error.message}")
                    return
                }

                if (!committed || currentData == null || !currentData.exists()) {
                    onResult(false, "El pedido ya fue tomado por otro repartidor")
                    return
                }

                val actual = currentData.value as? Map<*, *>
                val payload = HashMap<String, Any?>()
                actual?.forEach { (k, v) ->
                    if (k is String) {
                        payload[k] = v
                    }
                }
                payload["id"] = payload["id"] ?: pedidoId
                payload["id_pedido"] = payload["id_pedido"] ?: pedidoId

                val updates = hashMapOf<String, Any?>(
                    "pedidos_en_camino/$pedidoId" to payload,
                    "pedidos_para_reparto/$pedidoId" to null
                )

                rootRef.updateChildren(updates) { moveError, _ ->
                    if (moveError != null) {
                        onResult(false, "Pedido aceptado pero no se movio a seguimiento: ${moveError.message}")
                    } else {
                        onResult(true, "Pedido aceptado y movido a seguimiento")
                    }
                }
            }
        })
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
            estado = estado,
            timestamp = timestamp
        )
    }
}
