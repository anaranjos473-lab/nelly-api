package com.nelly.driver.ui.pedidos

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
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
        private const val TAG_APP_START = "NellyAppStart"
        private const val ECOSYSTEM_VERSION = "4.0.0-PRO"
        private const val REQUEST_LOCATION_STARTUP = 4101
        private const val REQUEST_LOCATION_ACCEPT = 4102
    }

    private val uiScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private lateinit var viewModel: PedidoViewModel
    private lateinit var pedidoAdapter: PedidoAdapter
    private lateinit var btnCompletarEntrega: Button
    private lateinit var txtEstadoSync: TextView
    private lateinit var txtVacio: TextView
    private var currentSyncState = "IDLE"
    private var currentSyncEvent = "IDLE"
    private var pantallaCerrada = false
    private var pedidoTrackingPendiente: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (pantallaCerrada) {
            finish()
            return
        }
        setContentView(R.layout.activity_pedidos_disponibles)
        validarVersionEcosistema()
        Log.i(TAG_APP_START, "APP START")

        txtEstadoSync = findViewById(R.id.txtEstadoSync)
        txtVacio = findViewById(R.id.txtVacio)
        btnCompletarEntrega = findViewById(R.id.btnCompletarEntrega)

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
                        iniciarTrackingConPermiso(pedido.id)
                    }
                    Toast.makeText(this, text, Toast.LENGTH_SHORT).show()
                }
            }
        }
        recyclerView.adapter = pedidoAdapter

        val repository = PedidoSyncModule.providePedidoRepository(applicationContext)
        Log.i(TAG_APP_START, "Firebase/RTDB inicializado")
        val factory = PedidoViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[PedidoViewModel::class.java]

        observarPedidos()
        observarEstadoSync()
        observarEventosSync()
        observarBloqueoDeuda()
        observarPedidoActivo()
        configurarCompletarEntrega()
        viewModel.limpiarPedidoActivoLocal()
        stopService(Intent(this, DeliveryTrackingService::class.java))
        solicitarPermisosDeArranque()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        val permisosOk = tienePermisoUbicacion()
        Log.i(TAG_APP_START, "Permisos ubicacion: ${if (permisosOk) "OK" else "DENEGADOS"}")

        when (requestCode) {
            REQUEST_LOCATION_STARTUP -> resolverEstadoOperativo()
            REQUEST_LOCATION_ACCEPT -> {
                val pedidoId = pedidoTrackingPendiente
                pedidoTrackingPendiente = null
                if (permisosOk && !pedidoId.isNullOrBlank()) {
                    iniciarServicioTracking(pedidoId)
                } else {
                    Toast.makeText(this, "Se requiere ubicacion para iniciar seguimiento", Toast.LENGTH_LONG).show()
                }
            }
        }
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

    override fun onBackPressed() {
        pantallaCerrada = true
        stopService(Intent(this, DeliveryTrackingService::class.java))
        super.onBackPressed()
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

    private fun observarPedidoActivo() {
        uiScope.launch {
            viewModel.pedidoActivoId.collect { pedidoId ->
                btnCompletarEntrega.visibility = if (pedidoId.isNullOrBlank()) View.GONE else View.VISIBLE
                btnCompletarEntrega.tag = pedidoId
            }
        }
    }

    private fun configurarCompletarEntrega() {
        btnCompletarEntrega.setOnClickListener {
            val pedidoId = btnCompletarEntrega.tag as? String
            if (pedidoId.isNullOrBlank()) {
                Toast.makeText(this, "No hay pedido activo", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            btnCompletarEntrega.isEnabled = false
            viewModel.completarPedido(pedidoId) { ok, mensaje ->
                runOnUiThread {
                    btnCompletarEntrega.isEnabled = true
                    if (ok) {
                        pantallaCerrada = true
                        stopService(Intent(this, DeliveryTrackingService::class.java))
                        viewModel.limpiarPedidoActivoLocal()
                        finish()
                    }
                    Toast.makeText(this, mensaje, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun solicitarPermisosDeArranque() {
        if (tienePermisoUbicacion()) {
            Log.i(TAG_APP_START, "Permisos ubicacion: OK")
            resolverEstadoOperativo()
            return
        }

        Log.i(TAG_APP_START, "Solicitando permisos ubicacion")
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            REQUEST_LOCATION_STARTUP
        )
    }

    private fun resolverEstadoOperativo() {
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            Log.i(TAG, "SESSION_RECOVERED: ${currentUser.uid}")
        } else {
            Log.i(TAG, "SESSION_NOT_RECOVERED")
        }

        viewModel.resolverEstadoOperativo(currentUser?.uid) { estado ->
            runOnUiThread {
                if (estado.destino == com.nelly.driver.data.repository.PedidoRepository.Destino.TRACKING && !estado.pedidoId.isNullOrBlank()) {
                    iniciarTrackingConPermiso(estado.pedidoId)
                } else {
                    stopService(Intent(this, DeliveryTrackingService::class.java))
                }
            }
        }
    }

    private fun iniciarTrackingConPermiso(pedidoId: String) {
        if (tienePermisoUbicacion()) {
            iniciarServicioTracking(pedidoId)
            return
        }

        pedidoTrackingPendiente = pedidoId
        Log.i(TAG_APP_START, "Tracking pendiente por permisos: $pedidoId")
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            REQUEST_LOCATION_ACCEPT
        )
    }

    private fun iniciarServicioTracking(pedidoId: String) {
        val trackingIntent = Intent(this, DeliveryTrackingService::class.java).apply {
            putExtra(DeliveryTrackingService.EXTRA_PEDIDO_ID, pedidoId)
        }
        startService(trackingIntent)
    }

    private fun tienePermisoUbicacion(): Boolean {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
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
