package com.nelly.driver.ui.pedidos.adapter

import android.graphics.Color
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.nelly.driver.R
import com.nelly.driver.model.PedidoEntity

class PedidoAdapter(
    private val onAceptarClick: (PedidoEntity) -> Unit
) : ListAdapter<PedidoEntity, PedidoAdapter.PedidoViewHolder>(DiffCallback) {

    private companion object {
        const val TAG_ICV02_ADAPTER = "ICV02_ACTIVITY"
    }

    private var bloqueadoPorDeuda: Boolean = false

    fun setBloqueadoPorDeuda(value: Boolean) {
        if (bloqueadoPorDeuda == value) {
            return
        }
        bloqueadoPorDeuda = value
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PedidoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_pedido_disponible, parent, false)
        return PedidoViewHolder(view)
    }

    override fun onBindViewHolder(holder: PedidoViewHolder, position: Int) {
        holder.bind(getItem(position), bloqueadoPorDeuda, onAceptarClick)
    }

    class PedidoViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val txtId: TextView = itemView.findViewById(R.id.txtPedidoId)
        private val txtCliente: TextView = itemView.findViewById(R.id.txtCliente)
        private val txtMonto: TextView = itemView.findViewById(R.id.txtMonto)
        private val txtEstado: TextView = itemView.findViewById(R.id.txtEstado)
        private val btnAceptar: Button = itemView.findViewById(R.id.btnAceptar)

        fun bind(pedido: PedidoEntity, bloqueadoPorDeuda: Boolean, onAceptarClick: (PedidoEntity) -> Unit) {
            txtId.text = "Pedido #${pedido.id.take(8)}"
            txtCliente.text = if (pedido.clienteNombre.isBlank()) "Cliente Nelly" else pedido.clienteNombre
            txtMonto.text = String.format("$%.2f", pedido.montoTotal)
            txtEstado.text = pedido.estado
            Log.i(
                TAG_ICV02_ADAPTER,
                "bind pedidoId=${pedido.id} estado=${pedido.estado} bloqueadoPorDeuda=$bloqueadoPorDeuda btnClickable=${!bloqueadoPorDeuda}"
            )
            if (bloqueadoPorDeuda) {
                btnAceptar.isEnabled = false
                btnAceptar.text = "BLOQUEADO"
                btnAceptar.setBackgroundColor(Color.parseColor("#9CA3AF"))
                btnAceptar.setOnClickListener(null)
            } else {
                btnAceptar.isEnabled = true
                btnAceptar.text = "ACEPTAR"
                btnAceptar.setBackgroundColor(Color.parseColor("#16A34A"))
                btnAceptar.setOnClickListener {
                    Log.i(TAG_ICV02_ADAPTER, "onClick aceptar pedidoId=${pedido.id} estado=${pedido.estado}")
                    onAceptarClick(pedido)
                }
            }
        }
    }

    object DiffCallback : DiffUtil.ItemCallback<PedidoEntity>() {
        override fun areItemsTheSame(oldItem: PedidoEntity, newItem: PedidoEntity): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: PedidoEntity, newItem: PedidoEntity): Boolean {
            return oldItem == newItem
        }
    }
}
