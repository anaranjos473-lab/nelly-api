package com.example.nellydriver.data.local

import androidx.room.*

@Dao
interface PedidoDao {
    @Query("SELECT * FROM pedidos_locales WHERE synced = 0")
    suspend fun getUnsyncedPedidos(): List<PedidoEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPedido(pedido: PedidoEntity)

    @Query("UPDATE pedidos_locales SET synced = 1 WHERE id = :pedidoId")
    suspend fun markAsSynced(pedidoId: String)
}
