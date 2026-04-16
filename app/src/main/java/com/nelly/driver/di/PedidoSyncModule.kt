package com.nelly.driver.di

import android.content.Context
import com.google.firebase.database.FirebaseDatabase
import com.nelly.driver.data.local.AppDatabase
import com.nelly.driver.data.repository.PedidoRepository

object PedidoSyncModule {

    fun providePedidoRepository(context: Context): PedidoRepository {
        val dao = AppDatabase.getInstance(context).pedidoDao()
        val pedidosRef = FirebaseDatabase.getInstance().getReference("pedidos_para_reparto")
        return PedidoRepository(dao, pedidosRef, context)
    }
}
