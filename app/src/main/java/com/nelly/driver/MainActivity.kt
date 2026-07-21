package com.example.nellydriver

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.nelly.driver.R
import com.nelly.driver.di.PedidoSyncModule
import com.nelly.driver.ui.pedidos.PedidoViewModel
import com.nelly.driver.ui.pedidos.PedidoViewModelFactory
import com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity(), OnMapReadyCallback {
    private var googleMap: GoogleMap? = null
    private lateinit var viewModel: PedidoViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        viewModel = ViewModelProvider(
            this,
            PedidoViewModelFactory(PedidoSyncModule.providePedidoRepository(applicationContext))
        )[PedidoViewModel::class.java]

        val saldo = intent.getStringExtra(EXTRA_SALDO) ?: "408.00"
        findViewById<TextView>(R.id.txtSaldoValor).text = "MXN$saldo"

        findViewById<Button>(R.id.btnAbrirRadar).setOnClickListener {
            startActivity(Intent(this, PedidosDisponiblesActivity::class.java))
        }

        findViewById<Button>(R.id.btnRecentrar).setOnClickListener {
            recenterMap()
        }

        val fragment = supportFragmentManager.findFragmentById(R.id.map_fragment) as? SupportMapFragment
            ?: SupportMapFragment.newInstance().also {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.map_fragment, it)
                    .commitNow()
        }
        fragment.getMapAsync(this)

        iniciarObservacionEstado()
        solicitarPermisosUbicacion()
    }

    private fun iniciarObservacionEstado() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.syncEventos.collectLatest { evento ->
                        val titulo = findViewById<TextView>(R.id.txtTituloRadar)
                        val estado = findViewById<Button>(R.id.btnEstadoOperacion)
                        when (evento) {
                            "NETWORK_RESTORED" -> {
                                titulo.text = "RADAR ONYX: SISTEMA PRO ACTIVO"
                                estado.text = "SIN PEDIDOS DISPONIBLES"
                            }
                            "ROOM_SYNC_STARTED" -> {
                                titulo.text = "RADAR ONYX: SINCRONIZANDO"
                                estado.text = "SINCRONIZANDO"
                            }
                            "ROOM_SYNC_FINISHED" -> {
                                titulo.text = "RADAR ONYX: SINCRONIZACION OK"
                            }
                            "ERROR_SYNC" -> {
                                titulo.text = "RADAR ONYX: ERROR DE SINCRONIZACION"
                                estado.text = "ERROR"
                            }
                        }
                    }
                }
                launch {
                    viewModel.pedidoActivoId.collectLatest { pedidoActivoId ->
                        val estado = findViewById<Button>(R.id.btnEstadoOperacion)
                        val titulo = findViewById<TextView>(R.id.txtTituloRadar)
                        if (pedidoActivoId.isNullOrBlank()) {
                            estado.text = "SIN PEDIDOS DISPONIBLES"
                            titulo.text = "RADAR ONYX: SISTEMA PRO ACTIVO"
                        } else {
                            estado.text = "PEDIDO ACTIVO"
                            titulo.text = "RADAR ONYX: PEDIDO ACTIVO"
                        }
                    }
                }
            }
        }
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        val centro = LatLng(16.75, -93.116)
        map.uiSettings.isZoomControlsEnabled = false
        map.uiSettings.isMapToolbarEnabled = false
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(centro, 13.5f))
        map.addMarker(
            MarkerOptions()
                .position(centro)
                .title("Centro Operativo Nelly")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ORANGE))
        )
        runCatching {
            map.setMapStyle(
                com.google.android.gms.maps.model.MapStyleOptions.loadRawResourceStyle(
                    this,
                    R.raw.map_style_night
                )
            )
        }
        habilitarUbicacionSiEsPosible()
    }

    private fun solicitarPermisosUbicacion() {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!fine && !coarse) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
                REQUEST_LOCATION
            )
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_LOCATION) {
            habilitarUbicacionSiEsPosible()
        }
    }

    private fun habilitarUbicacionSiEsPosible() {
        val map = googleMap ?: return
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (fine || coarse) {
            runCatching { map.isMyLocationEnabled = true }
        }
    }

    private fun recenterMap() {
        val map = googleMap
        if (map == null) {
            Toast.makeText(this, "Mapa todavía cargando", Toast.LENGTH_SHORT).show()
            return
        }
        val centro = LatLng(16.75, -93.116)
        map.animateCamera(CameraUpdateFactory.newLatLngZoom(centro, 13.5f))
        Toast.makeText(this, "Radar centrado", Toast.LENGTH_SHORT).show()
    }

    companion object {
        const val EXTRA_SALDO = "extra_saldo"
        private const val REQUEST_LOCATION = 7101
    }
}
