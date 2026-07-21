package com.nelly.driver.ui.pedidos

import android.Manifest
import android.content.Intent
import android.content.SharedPreferences
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
import com.google.firebase.auth.FirebaseUser
import com.nelly.driver.R
import com.nelly.driver.BuildConfig
import com.nelly.driver.di.PedidoSyncModule
import com.nelly.driver.service.DeliveryTrackingService
import com.nelly.driver.ui.pedidos.adapter.PedidoAdapter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

private const val TAG_ICV02_COMPLETE = "ICV02_COMPLETE"
private const val TAG_ICV02_ACTIVITY = "ICV02_ACTIVITY"
private const val TAG_ICV02_VM = "ICV02_VM"
private const val TAG_ICV02_SERVICE = "ICV02_SERVICE"

class PedidosDisponiblesActivity : AppCompatActivity() {
    private companion object {
        private const val TAG = "PedidosDisponibles"
        private const val TAG_APP_START = "NellyAppStart"
        private const val ECOSYSTEM_VERSION = "4.0.0-PRO"
        private const val REQUEST_LOCATION_STARTUP = 4101
        private const val REQUEST_LOCATION_ACCEPT = 4102
        private const val PREFS_AUTH = "nelly_driver_auth"
        private const val PREF_UID = "driver_uid"
        private const val PREFS_CIERRE = "nelly_driver_cierre"
        private const val PREF_ULTIMO_CIERRE_EXITO_MS = "ultimo_cierre_exito_ms"
        private const val BLOQUEO_REAPERTURA_MS = 10_000L
        private const val DEFAULT_DRIVER_UID = "8mo8182LJsgV7vKMSpiCekFKAG23"
        private const val DRIVER_TOKEN_PATH = "/api/auth/driver-token"
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
    private var cierreEnProgreso = false
    private var pedidoTrackingPendiente: String? = null
    private var authBootstrapEnCurso = false
    private var authBootstrapListo = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.i(TAG_ICV02_ACTIVITY, "onCreate savedInstanceState=${savedInstanceState != null} action=${intent.action ?: "null"} flags=${intent.flags} extras=${intent.extras?.keySet()?.joinToString(",") ?: "null"} pantallaCerrada=$pantallaCerrada")
        if (debeBloquearReaperturaPostCierre()) {
            Log.i(TAG_ICV02_ACTIVITY, "onCreate omitido por cierre reciente")
            finish()
            return
        }
        if (pantallaCerrada) {
            Log.i(TAG_ICV02_ACTIVITY, "onCreate aborted because pantallaCerrada=true")
            finish()
            return
        }
        setContentView(R.layout.activity_pedidos_disponibles)
        validarVersionEcosistema()
        Log.i(TAG_ICV02_ACTIVITY, "onCreate view initialized")

        txtEstadoSync = findViewById(R.id.txtEstadoSync)
        txtVacio = findViewById(R.id.txtVacio)
        btnCompletarEntrega = findViewById(R.id.btnCompletarEntrega)

        val recyclerView: RecyclerView = findViewById(R.id.recyclerPedidos)
        recyclerView.layoutManager = LinearLayoutManager(this)

        pedidoAdapter = PedidoAdapter { pedido ->
            val uid = FirebaseAuth.getInstance().currentUser?.uid
            if (uid.isNullOrBlank()) {
                Log.i(TAG_ICV02_ACTIVITY, "aceptarPedido bloqueado por sesion null")
                bootstrapAuthRepartidor { listo ->
                    if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                        Log.i(TAG_ICV02_ACTIVITY, "aceptarPedido cancelado por cierre en progreso")
                        return@bootstrapAuthRepartidor
                    }
                    if (!listo) {
                        Toast.makeText(this, "Debes iniciar sesion para aceptar pedidos", Toast.LENGTH_SHORT).show()
                        return@bootstrapAuthRepartidor
                    }
                    aceptarPedidoConSesion(pedido.id)
                }
                return@PedidoAdapter
            }

            aceptarPedidoConSesion(pedido.id)
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
        // Arranque limpio: no reabrir tracking ni resolver estado si ya se está cerrando.
        viewModel.limpiarPedidoActivoLocal()
        stopService(Intent(this, DeliveryTrackingService::class.java))

        if (!cierreEnProgreso && !pantallaCerrada && !isFinishing && !isDestroyed) {
            bootstrapAuthRepartidor { listo ->
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    Log.i(TAG_ICV02_ACTIVITY, "bootstrapAuth omitido por cierre en progreso")
                    return@bootstrapAuthRepartidor
                }
                if (listo) {
                    resolverEstadoOperativo()
                }
            }
        }
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
        Log.i(TAG_ICV02_ACTIVITY, "onStart")
        if (debeBloquearReaperturaPostCierre()) {
            Log.i(TAG_ICV02_ACTIVITY, "onStart omitido por cierre reciente")
            return
        }
        if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
            Log.i(TAG_ICV02_ACTIVITY, "onStart sin sincronizacion por cierre en progreso")
            return
        }
        viewModel.iniciarSincronizacion()
    }

    override fun onStop() {
        Log.i(TAG_ICV02_ACTIVITY, "onStop")
        viewModel.detenerSincronizacion()
        super.onStop()
    }

    override fun onDestroy() {
        Log.i(TAG_ICV02_ACTIVITY, "onDestroy")
        uiScope.cancel()
        super.onDestroy()
    }

    override fun onPause() {
        Log.i(TAG_ICV02_ACTIVITY, "onPause")
        super.onPause()
    }

    override fun onBackPressed() {
        pantallaCerrada = true
        Log.i(TAG_ICV02_ACTIVITY, "onBackPressed pantallaCerrada=true")
        stopService(Intent(this, DeliveryTrackingService::class.java))
        super.onBackPressed()
    }

    private fun observarPedidos() {
        uiScope.launch {
            viewModel.pedidos.collect { pedidos ->
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    return@collect
                }
                pedidoAdapter.submitList(pedidos)
                txtVacio.visibility = if (pedidos.isEmpty()) View.VISIBLE else View.GONE
            }
        }
    }

    private fun observarEstadoSync() {
        uiScope.launch {
            viewModel.syncEstado.collect { estado ->
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    return@collect
                }
                currentSyncState = estado
                actualizarEstadoSync()
            }
        }
    }

    private fun observarEventosSync() {
        uiScope.launch {
            viewModel.syncEventos.collect { evento ->
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    return@collect
                }
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
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    return@collect
                }
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
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    return@collect
                }
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

            Log.i(TAG_ICV02_COMPLETE, "inicio completarPedido pedidoId=$pedidoId uid=${FirebaseAuth.getInstance().currentUser?.uid ?: "null"} hora=${System.currentTimeMillis()}")
            btnCompletarEntrega.isEnabled = false
            viewModel.completarPedido(pedidoId) { ok, mensaje ->
                runOnUiThread {
                    Log.i(TAG_ICV02_COMPLETE, "respuesta completarPedido ok=$ok mensaje=$mensaje pantallaCerradaAntes=$pantallaCerrada")
                    btnCompletarEntrega.isEnabled = true
                if (ok) {
                    Log.i(TAG_ICV02_ACTIVITY, "Entrega completada correctamente")
                    registrarCierreExitoso()
                    cierreEnProgreso = true
                    pantallaCerrada = true
                    pedidoTrackingPendiente = null

                    Log.i(TAG_ICV02_ACTIVITY, "radarVisibleSinRecreacion tras complete-order")
                    Log.i(TAG_ICV02_SERVICE, "stopService DeliveryTrackingService")
                    stopService(Intent(this, DeliveryTrackingService::class.java))

                    Log.i(TAG_ICV02_VM, "limpiarPedidoActivoLocal requested")
                    viewModel.limpiarPedidoActivoLocal()

                    Toast.makeText(this, "Pedido completado", Toast.LENGTH_SHORT).show()

                    regresarAlRadarBase()
                    return@runOnUiThread
                }
                    Toast.makeText(this, mensaje, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun solicitarPermisosDeArranque() {
        if (tienePermisoUbicacion()) {
            Log.i(TAG_ICV02_ACTIVITY, "solicitarPermisosDeArranque permisos=OK")
            resolverEstadoOperativo()
            return
        }

        Log.i(TAG_ICV02_ACTIVITY, "solicitarPermisosDeArranque permisos=SOLICITADOS")
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
        if (debeBloquearReaperturaPostCierre()) {
            Log.i(TAG_ICV02_ACTIVITY, "resolverEstadoOperativo omitido por cierre reciente")
            return
        }
        if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
            Log.i(TAG_ICV02_ACTIVITY, "resolverEstadoOperativo omitido por cierre en progreso")
            return
        }
        val currentUser = FirebaseAuth.getInstance().currentUser
        Log.i(TAG_ICV02_ACTIVITY, "resolverEstadoOperativo uid=${currentUser?.uid ?: "null"}")

        viewModel.resolverEstadoOperativo(currentUser?.uid) { estado ->
            runOnUiThread {
                if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
                    Log.i(TAG_ICV02_ACTIVITY, "resolverEstadoOperativo result ignorado por cierre en progreso")
                    return@runOnUiThread
                }
                Log.i(TAG_ICV02_ACTIVITY, "resolverEstadoOperativo result destino=${estado.destino} pedidoId=${estado.pedidoId ?: "null"} estadoPedido=${estado.estadoPedido ?: "null"}")
                if (estado.destino == com.nelly.driver.data.repository.PedidoRepository.Destino.TRACKING && !estado.pedidoId.isNullOrBlank()) {
                    iniciarTrackingConPermiso(estado.pedidoId)
                } else {
                    Log.i(TAG_ICV02_SERVICE, "stopService DeliveryTrackingService from resolverEstadoOperativo")
                    stopService(Intent(this, DeliveryTrackingService::class.java))
                }
            }
        }
    }

    private fun iniciarTrackingConPermiso(pedidoId: String) {
        if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
            Log.i(TAG_ICV02_ACTIVITY, "iniciarTrackingConPermiso omitido por cierre en progreso pedidoId=$pedidoId")
            return
        }
        if (tienePermisoUbicacion()) {
            Log.i(TAG_ICV02_SERVICE, "startService DeliveryTrackingService pedidoId=$pedidoId")
            iniciarServicioTracking(pedidoId)
            return
        }

        pedidoTrackingPendiente = pedidoId
        Log.i(TAG_ICV02_ACTIVITY, "tracking pendiente por permisos pedidoId=$pedidoId")
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
        if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
            Log.i(TAG_ICV02_SERVICE, "startService omitido por cierre en progreso pedidoId=$pedidoId")
            return
        }
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
        Log.i(TAG_ICV02_ACTIVITY, "validarVersionEcosistema version=$versionSistema")
    }

    private fun aceptarPedidoConSesion(pedidoId: String) {
        if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
            Log.i(TAG_ICV02_ACTIVITY, "aceptarPedidoConSesion omitido por cierre en progreso pedidoId=$pedidoId")
            return
        }
        val uid = FirebaseAuth.getInstance().currentUser?.uid
        if (uid.isNullOrBlank()) {
            Toast.makeText(this, "Debes iniciar sesion para aceptar pedidos", Toast.LENGTH_SHORT).show()
            return
        }

        viewModel.aceptarPedido(pedidoId, uid) { ok, mensaje ->
            val text = if (ok) "Pedido aceptado" else mensaje
            runOnUiThread {
                if (ok) {
                    iniciarTrackingConPermiso(pedidoId)
                }
                Toast.makeText(this, text, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun bootstrapAuthRepartidor(onDone: (Boolean) -> Unit) {
        if (debeBloquearReaperturaPostCierre()) {
            Log.i(TAG_ICV02_ACTIVITY, "bootstrapAuth omitido por cierre reciente")
            onDone(false)
            return
        }
        if (cierreEnProgreso || pantallaCerrada || isFinishing || isDestroyed) {
            Log.i(TAG_ICV02_ACTIVITY, "bootstrapAuth omitido por cierre en progreso")
            onDone(false)
            return
        }
        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            authBootstrapListo = true
            onDone(true)
            return
        }

        if (authBootstrapEnCurso) {
            return
        }

        authBootstrapEnCurso = true
        val prefs = getSharedPreferences(PREFS_AUTH, MODE_PRIVATE)
        val uid = obtenerUidRepartidorBootstrap(prefs)
        Log.i(TAG_ICV02_ACTIVITY, "bootstrapAuth start uid=$uid")

        Thread {
            val result = solicitarCustomToken(uid)
            runOnUiThread {
                authBootstrapEnCurso = false
                if (result == null) {
                    Log.i(TAG_ICV02_ACTIVITY, "bootstrapAuth failed uid=$uid")
                    onDone(false)
                    return@runOnUiThread
                }

                FirebaseAuth.getInstance().signInWithCustomToken(result)
                    .addOnSuccessListener { authResult ->
                        val signedUser = authResult.user
                        persistirUidBootstrap(prefs, signedUser)
                        authBootstrapListo = true
                        Log.i(TAG_ICV02_ACTIVITY, "bootstrapAuth success uid=${signedUser?.uid ?: uid}")
                        onDone(true)
                    }
                    .addOnFailureListener { error ->
                        Log.e(TAG_ICV02_ACTIVITY, "bootstrapAuth signIn failure uid=$uid mensaje=${error.message}")
                        onDone(false)
                    }
            }
        }.start()
    }

    private fun obtenerUidRepartidorBootstrap(prefs: SharedPreferences): String {
        val persisted = prefs.getString(PREF_UID, null).orEmpty().trim()
        if (persisted.isNotBlank()) {
            return persisted
        }

        val intentUid = intent.getStringExtra("driver_uid").orEmpty().trim()
        if (intentUid.isNotBlank()) {
            return intentUid
        }

        return DEFAULT_DRIVER_UID
    }

    private fun persistirUidBootstrap(prefs: SharedPreferences, user: FirebaseUser?) {
        val uid = user?.uid.orEmpty().trim()
        if (uid.isBlank()) {
            return
        }
        prefs.edit().putString(PREF_UID, uid).apply()
    }

    private fun registrarCierreExitoso() {
        getSharedPreferences(PREFS_CIERRE, MODE_PRIVATE)
            .edit()
            .putLong(PREF_ULTIMO_CIERRE_EXITO_MS, System.currentTimeMillis())
            .apply()
    }

    private fun regresarAlRadarBase() {
        Log.i(TAG_ICV02_ACTIVITY, "regresarAlRadarBase pedido completado")
        val intentBase = Intent(this, com.example.nellydriver.MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK)
            putExtra("from_delivery_finish", true)
        }
        startActivity(intentBase)
        finishAffinity()
    }

    private fun debeBloquearReaperturaPostCierre(): Boolean {
        val ultimoCierre = getSharedPreferences(PREFS_CIERRE, MODE_PRIVATE)
            .getLong(PREF_ULTIMO_CIERRE_EXITO_MS, 0L)
        if (ultimoCierre <= 0L) {
            return false
        }

        val transcurrido = System.currentTimeMillis() - ultimoCierre
        return transcurrido in 0..BLOQUEO_REAPERTURA_MS
    }

    private fun solicitarCustomToken(uid: String): String? {
        var connection: HttpURLConnection? = null
        return try {
            val endpoint = "${BuildConfig.API_BASE_URL}$DRIVER_TOKEN_PATH?uid=${java.net.URLEncoder.encode(uid, Charsets.UTF_8.name())}"
            connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 15000
                readTimeout = 15000
                doInput = true
            }
            val statusCode = connection.responseCode
            val stream = if (statusCode in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.use { input -> BufferedReader(InputStreamReader(input)).readText() }.orEmpty()
            if (statusCode !in 200..299) {
                Log.e(TAG_ICV02_ACTIVITY, "driver-token http=$statusCode body=$body")
                return null
            }

            val token = JSONObject(body).optString("token").trim()
            token.takeIf { it.isNotBlank() }
        } catch (error: Exception) {
            Log.e(TAG_ICV02_ACTIVITY, "driver-token error mensaje=${error.message}")
            null
        } finally {
            connection?.disconnect()
        }
    }

}
