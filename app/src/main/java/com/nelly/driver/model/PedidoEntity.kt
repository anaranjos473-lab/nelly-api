package com.nelly.driver.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.firebase.database.IgnoreExtraProperties
import com.google.firebase.database.PropertyName

@IgnoreExtraProperties
@Entity(tableName = "pedidos")
data class PedidoEntity(
    @PrimaryKey
    @ColumnInfo(name = "id_pedido")
    @get:PropertyName("id_pedido")
    @set:PropertyName("id_pedido")
    var id: String = "",

    @ColumnInfo(name = "cliente_nombre")
    @get:PropertyName("cliente_nombre")
    @set:PropertyName("cliente_nombre")
    var clienteNombre: String = "",

    @ColumnInfo(name = "monto_total")
    @get:PropertyName("monto_total")
    @set:PropertyName("monto_total")
    var montoTotal: Double = 0.0,

    @ColumnInfo(name = "estado_pedido")
    @get:PropertyName("estado_pedido")
    @set:PropertyName("estado_pedido")
    var estado: String = "PENDIENTE",

    @ColumnInfo(name = "timestamp")
    @get:PropertyName("timestamp")
    @set:PropertyName("timestamp")
    var timestamp: Long = System.currentTimeMillis()
) {
    // Constructor vacio requerido por Firebase Realtime Database.
    constructor() : this("", "", 0.0, "PENDIENTE", 0L)
}
