package com.nelly.driver.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nelly.driver.model.PedidoEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PedidoDao {

    // Inserta o actualiza un pedido para mantener sincronizacion local con la nube.
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertarPedido(pedido: PedidoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertarPedidos(pedidos: List<PedidoEntity>)

    @Query("SELECT * FROM pedidos ORDER BY timestamp DESC")
    fun obtenerTodosLosPedidos(): Flow<List<PedidoEntity>>

    @Query("SELECT * FROM pedidos WHERE estado_pedido = :estado")
    fun obtenerPedidosPorEstado(estado: String): Flow<List<PedidoEntity>>

    @Query("SELECT * FROM pedidos WHERE id_pedido = :id LIMIT 1")
    suspend fun obtenerPedidoPorId(id: String): PedidoEntity?

    @Delete
    suspend fun eliminarPedido(pedido: PedidoEntity)

    @Query("DELETE FROM pedidos WHERE id_pedido = :id")
    suspend fun eliminarPedidoPorId(id: String)

    @Query("DELETE FROM pedidos")
    suspend fun borrarTodaLaTabla()
}
