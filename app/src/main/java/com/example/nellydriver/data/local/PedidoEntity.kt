package com.example.nellydriver.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "pedidos_locales")
data class PedidoEntity(
    @PrimaryKey val id: String,
    val estado: String,
    val evidenciaUrl: String? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val synced: Boolean = false
)
