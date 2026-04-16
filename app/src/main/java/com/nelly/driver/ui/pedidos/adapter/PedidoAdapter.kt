package com.nelly.driver.ui.pedidos.adapter

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

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PedidoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_pedido_disponible, parent, false)
        return PedidoViewHolder(view)
    }

    override fun onBindViewHolder(holder: PedidoViewHolder, position: Int) {
        holder.bind(getItem(position), onAceptarClick)
    }

    class PedidoViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val txtId: TextView = itemView.findViewById(R.id.txtPedidoId)
        private val txtCliente: TextView = itemView.findViewById(R.id.txtCliente)
        private val txtMonto: TextView = itemView.findViewById(R.id.txtMonto)
        private val txtEstado: TextView = itemView.findViewById(R.id.txtEstado)
        private val btnAceptar: Button = itemView.findViewById(R.id.btnAceptar)

        fun bind(pedido: PedidoEntity, onAceptarClick: (PedidoEntity) -> Unit) {
            txtId.text = "Pedido #${pedido.id.take(8)}"
            txtCliente.text = if (pedido.clienteNombre.isBlank()) "Cliente Nelly" else pedido.clienteNombre
            txtMonto.text = String.format("$%.2f", pedido.montoTotal)
            txtEstado.text = pedido.estado
            btnAceptar.setOnClickListener { onAceptarClick(pedido) }
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
