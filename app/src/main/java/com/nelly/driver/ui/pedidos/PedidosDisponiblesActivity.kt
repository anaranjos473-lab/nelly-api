package com.nelly.driver.ui.pedidos

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.nelly.driver.R
import com.nelly.driver.data.remote.IncidentReportClient
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
    private lateinit var btnSosIncidente: Button
    private val incidentReportClient = IncidentReportClient()
    private var incidenteActivo: Boolean = false
    private var reporteEnCurso: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_pedidos_disponibles)
        validarVersionEcosistema()

        txtEstadoSync = findViewById(R.id.txtEstadoSync)
        txtVacio = findViewById(R.id.txtVacio)
        btnSosIncidente = findViewById(R.id.btnSosIncidente)
        configurarBotonIncidente()

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
                txtEstadoSync.text = "Estado: $estado"
            }
        }
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

    private fun configurarBotonIncidente() {
        renderEstadoBotonIncidente()

        btnSosIncidente.setOnClickListener {
            if (reporteEnCurso) {
                return@setOnClickListener
            }

            if (!incidenteActivo) {
                mostrarDialogoActivarIncidente()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("Resolver incidente")
                    .setMessage("Se marcara como RESUELTO tu incidente activo. Deseas continuar?")
                    .setNegativeButton("Cancelar", null)
                    .setPositiveButton("Resolver") { _, _ ->
                        enviarReporteIncidente(activo = false, descripcion = null)
                    }
                    .show()
            }
        }
    }

    private fun mostrarDialogoActivarIncidente() {
        val input = EditText(this).apply {
            hint = "Describe el incidente (ej. llanta ponchada)"
            setText("llanta ponchada")
        }

        AlertDialog.Builder(this)
            .setTitle("Reportar SOS")
            .setMessage("Esto activara la alerta de incidente para admin.")
            .setView(input)
            .setNegativeButton("Cancelar", null)
            .setPositiveButton("Activar SOS") { _, _ ->
                val descripcion = input.text?.toString()?.trim().orEmpty()
                enviarReporteIncidente(activo = true, descripcion = descripcion)
            }
            .show()
    }

    private fun enviarReporteIncidente(activo: Boolean, descripcion: String?) {
        reporteEnCurso = true
        renderEstadoBotonIncidente()

        incidentReportClient.reportIncident(activo = activo, descripcion = descripcion) { result ->
            reporteEnCurso = false

            if (result.ok) {
                incidenteActivo = activo
                txtEstadoSync.text = if (activo) {
                    "Estado: INCIDENTE REPORTADO"
                } else {
                    "Estado: INCIDENTE RESUELTO"
                }

                val mensaje = if (activo) {
                    "SOS enviado correctamente"
                } else {
                    "Incidente marcado como resuelto"
                }
                Toast.makeText(this, mensaje, Toast.LENGTH_SHORT).show()
            } else {
                val detalle = result.body.ifBlank { "Error de red o backend" }
                Toast.makeText(this, "No se pudo reportar incidente: $detalle", Toast.LENGTH_LONG).show()
            }

            renderEstadoBotonIncidente()
        }
    }

    private fun renderEstadoBotonIncidente() {
        btnSosIncidente.isEnabled = !reporteEnCurso
        btnSosIncidente.text = when {
            reporteEnCurso -> "ENVIANDO..."
            incidenteActivo -> "RESOLVER SOS"
            else -> "REPORTAR SOS"
        }
    }
}
