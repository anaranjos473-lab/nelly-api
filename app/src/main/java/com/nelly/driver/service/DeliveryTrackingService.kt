package com.nelly.driver.service

import android.Manifest
import android.app.Service
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.content.ContextCompat
import com.nelly.driver.BuildConfig
import com.nelly.driver.data.remote.LocationUpdateClient

class DeliveryTrackingService : Service() {

    private val client = LocationUpdateClient()
    private val handler = Handler(Looper.getMainLooper())
    private var pedidoIdActivo: String? = null
    private lateinit var locationManager: LocationManager

    private val trackingRunnable = object : Runnable {
        override fun run() {
            val location = obtenerUbicacionActual()

            if (location != null) {
                client.updateLocation(location.latitude, location.longitude, pedidoIdActivo) { result ->
                    if (result.ok) {
                        if (BuildConfig.DEBUG) {
                            Log.d(TAG, "Ubicacion actualizada correctamente")
                        }
                    } else {
                        Log.e(TAG, "Error actualizando ubicacion en backend: status=${result.statusCode}")
                    }
                }
            } else {
                Log.w(TAG, "No hay ubicacion disponible para reportar")
            }

            handler.postDelayed(this, TRACKING_INTERVAL_MS)
        }
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        pedidoIdActivo = intent?.getStringExtra(EXTRA_PEDIDO_ID)

        handler.removeCallbacks(trackingRunnable)
        handler.post(trackingRunnable)

        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(trackingRunnable)
        pedidoIdActivo = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun obtenerUbicacionActual(): Location? {
        if (!tienePermisoUbicacion()) {
            Log.w(TAG, "Permiso de ubicacion no concedido")
            return null
        }

        val gps = runCatching {
            locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
        }.getOrNull()

        val network = runCatching {
            locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
        }.getOrNull()

        return when {
            gps == null -> network
            network == null -> gps
            gps.time >= network.time -> gps
            else -> network
        }
    }

    private fun tienePermisoUbicacion(): Boolean {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }

    companion object {
        const val EXTRA_PEDIDO_ID = "PEDIDO_ID"
        private const val TAG = "NellyTracking"
        private const val TRACKING_INTERVAL_MS = 30_000L
    }
}
