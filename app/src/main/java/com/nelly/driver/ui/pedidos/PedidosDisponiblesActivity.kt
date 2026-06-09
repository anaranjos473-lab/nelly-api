package com.nelly.driver.ui.pedidos

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.nelly.driver.R
import com.nelly.driver.di.PedidoSyncModule
import com.nelly.driver.service.DeliveryTrackingService
import com.nelly.driver.ui.pedidos.adapter.PedidoAdapter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch

class PedidosDisponiblesActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "PedidosDisponibles"
        private const val ECOSYSTEM_VERSION = "4.0.0-PRO"
    }

    private val uiScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private lateinit var viewModel: PedidoViewModel
    private lateinit var pedidoAdapter: PedidoAdapter
    private lateinit var txtEstadoSync: TextView
    private lateinit var txtVacio: TextView
    private var currentSyncState = "IDLE"
    private var currentSyncEvent = "IDLE"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_pedidos_disponibles)
        validarVersionEcosistema()

        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            Log.i(TAG, "SESSION_RECOVERED: ${currentUser.uid}")
        } else {
            Log.i(TAG, "SESSION_NOT_RECOVERED")
        }

        txtEstadoSync = findViewById(R.id.txtEstadoSync)
        txtVacio = findViewById(R.id.txtVacio)

        val recyclerView: RecyclerView = findViewById(R.id.recyclerPedidos)
        recyclerView.layoutManager = LinearLayoutManager(this)

        pedidoAdapter = PedidoAdapter { pedido ->
            val uid = FirebaseAuth.getInstance().currentUser?.uid
            if (uid.isNullOrBlank()) {
                Toast.makeText(this, "Debes iniciar sesion para aceptar pedidos", Toast.LENGTH_SHORT).show()
                return@PedidoAdapter
            }

            viewModel.aceptarPedido(pedido.id, uid) { ok, mensaje ->
                val text = if (ok) "Pedido aceptado" else mensaje
                runOnUiThread {
                    if (ok) {
                        val trackingIntent = Intent(this, DeliveryTrackingService::class.java).apply {
                            putExtra(DeliveryTrackingService.EXTRA_PEDIDO_ID, pedido.id)
                        }
                        startService(trackingIntent)
                    }
                    Toast.makeText(this, text, Toast.LENGTH_SHORT).show()
                }
            }
        }
        recyclerView.adapter = pedidoAdapter

        val repository = PedidoSyncModule.providePedidoRepository(applicationContext)
        val factory = PedidoViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[PedidoViewModel::class.java]

        observarPedidos()
        observarEstadoSync()
        observarEventosSync()
        observarBloqueoDeuda()
    }

    override fun onStart() {
        super.onStart()
        viewModel.iniciarSincronizacion()
    }

    override fun onStop() {
        viewModel.detenerSincronizacion()
        super.onStop()
    }

    override fun onDestroy() {
        uiScope.cancel()
        super.onDestroy()
    }

    private fun observarPedidos() {
        uiScope.launch {
            viewModel.pedidos.collect { pedidos ->
                pedidoAdapter.submitList(pedidos)
                txtVacio.visibility = if (pedidos.isEmpty()) View.VISIBLE else View.GONE
            }
        }
    }

    private fun observarEstadoSync() {
        uiScope.launch {
            viewModel.syncEstado.collect { estado ->
                currentSyncState = estado
                actualizarEstadoSync()
            }
        }
    }

    private fun observarEventosSync() {
        uiScope.launch {
            viewModel.syncEventos.collect { evento ->
                currentSyncEvent = evento
                actualizarEstadoSync()
            }
        }
    }

    private fun actualizarEstadoSync() {
        txtEstadoSync.text = "Estado: $currentSyncState • Evento: $currentSyncEvent"
    }

    private fun observarBloqueoDeuda() {
        uiScope.launch {
            viewModel.bloqueoDeuda.collect { bloqueado ->
                pedidoAdapter.setBloqueadoPorDeuda(bloqueado)
                if (bloqueado) {
                    txtEstadoSync.text = "Estado: BLOQUEADO POR DEUDA"
                }
            }
        }
    }

    private fun validarVersionEcosistema() {
        val versionSistema = intent.getStringExtra("ecosystem_version") ?: ECOSYSTEM_VERSION
        if (versionSistema != ECOSYSTEM_VERSION) {
            Log.e(TAG, "Version del ecosistema invalida: $versionSistema")
            Toast.makeText(this, "Version incompatible del ecosistema", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        Log.i(TAG, "Version del ecosistema validada: $versionSistema")
    }
}
