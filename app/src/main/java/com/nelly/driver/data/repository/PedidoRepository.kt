package com.nelly.driver.data.repository

import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.ValueEventListener
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
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) {
    private val syncScope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private var listener: ValueEventListener? = null

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
