package com.example.nellydriver

import android.Manifest
import android.graphics.Bitmap
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import kotlinx.coroutines.launch
import timber.log.Timber
import java.util.Locale
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.maps.android.compose.*
import com.example.nellydriver.ui.theme.NellyTypography
import com.example.nellydriver.ui.theme.NellyButton
import com.example.nellydriver.ui.theme.NellyCard
import com.example.nellydriver.ui.theme.NellyColors
import androidx.core.graphics.toColorInt
import com.nelly.driver.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DriverDashboardScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier,
    navController: NavController
) {
    Timber.d("DriverDashboardScreen composición inicial")
    val context = LocalContext.current
    val isConectado by viewModel.isConectado.collectAsStateWithLifecycle(initialValue = false)
    val gananciasHoy by viewModel.gananciasHoy.collectAsStateWithLifecycle(initialValue = 0.0)
    val pedidoActual by viewModel.pedidoActual.collectAsStateWithLifecycle(initialValue = null)
    val puntosRuta by viewModel.puntosRuta.collectAsStateWithLifecycle(initialValue = emptyList())
    val noticiasUrbanas by viewModel.noticiasUrbanas.collectAsStateWithLifecycle()
    val proximaOla by viewModel.proximaOlaDemanda.collectAsStateWithLifecycle()
    val alertaMecanica by viewModel.mostrarAlertaMecanica.collectAsStateWithLifecycle()
    val fechaCorte by viewModel.proximaFechaCorte.collectAsStateWithLifecycle()
    val retenciones by viewModel.totalRetencionesHoy.collectAsStateWithLifecycle()
    val pedidoEnCola by viewModel.pedidoEnCola.collectAsStateWithLifecycle()
    val tiempoEspera by viewModel.tiempoEsperaRestante.collectAsStateWithLifecycle()
    val zonas by viewModel.zonas.collectAsStateWithLifecycle(initialValue = emptyList())
    val currentLoc by viewModel.currentLocation.collectAsStateWithLifecycle()
    val validacionPendiente by viewModel.isValidacionFondoPendiente.collectAsStateWithLifecycle()
    val batteryLevel by viewModel.batteryLevel.collectAsStateWithLifecycle()
    val isCharging by viewModel.isBatteryCharging.collectAsStateWithLifecycle()
    val climaActual by viewModel.estadoClima.collectAsStateWithLifecycle()
    
    var newsIndex by remember { mutableIntStateOf(0) }
    
    LaunchedEffect(noticiasUrbanas) {
        if (noticiasUrbanas.isNotEmpty()) {
            while (true) {
                kotlinx.coroutines.delay(8000) // Rotación cada 8 segundos
                newsIndex = (newsIndex + 1) % noticiasUrbanas.size
            }
        }
    }

    val sheetState = rememberStandardBottomSheetState(initialValue = SheetValue.PartiallyExpanded)
    val scaffoldState = rememberBottomSheetScaffoldState(sheetState)
    val scope = rememberCoroutineScope()

    val tuxtla = LatLng(16.7527, -93.1167)
    val cameraPositionState = rememberCameraPositionState { position = CameraPosition.fromLatLngZoom(tuxtla, 14f) }
    val hasValidMapsKey = true // Forced for certified look

    LaunchedEffect(currentLoc) {
        if (currentLoc != null && cameraPositionState.position.target == tuxtla) {
            cameraPositionState.position = CameraPosition.fromLatLngZoom(
                LatLng(currentLoc!!.latitude, currentLoc!!.longitude),
                16f
            )
        }
    }

    var fotoEvidencia by remember { mutableStateOf<Bitmap?>(null) }
    val launcherCamara = rememberLauncherForActivityResult(contract = ActivityResultContracts.TakePicturePreview()) { bitmap -> 
        bitmap?.let { fotoEvidencia = it } 
    }

    LaunchedEffect(pedidoActual?.id, currentLoc != null) {
        val pedido = pedidoActual ?: return@LaunchedEffect
        val puntos = buildList {
            currentLoc?.let { add(LatLng(it.latitude, it.longitude)) }
            val tienda = GeoPoint(pedido.latTienda, pedido.lngTienda)
            val cliente = GeoPoint(pedido.lat, pedido.lng)
            if (C4GeoPolicy.isValid(tienda)) add(LatLng(tienda.lat, tienda.lng))
            if (C4GeoPolicy.isValid(cliente)) add(LatLng(cliente.lat, cliente.lng))
        }
        if (puntos.size >= 2) {
            val bounds = LatLngBounds.builder().apply { puntos.forEach(::include) }.build()
            runCatching {
                cameraPositionState.animate(
                    CameraUpdateFactory.newLatLngBounds(bounds, 120),
                    durationMs = 700
                )
            }.onFailure { Timber.w(it, "C4_MAP_CAMERA_BOUNDS_FAILED pedidoId=%s", pedido.id) }
        }
    }
    val launcherPermisoCamara = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            launcherCamara.launch(null)
        } else {
            Timber.w("Permiso CAMERA denegado; no se abre captura de evidencia")
        }
    }

    fun abrirCamaraConPermiso() {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            launcherCamara.launch(null)
        } else {
            launcherPermisoCamara.launch(Manifest.permission.CAMERA)
        }
    }

    val topNoticiaRaw = if (noticiasUrbanas.any { it.prioridad >= 2 }) {
        noticiasUrbanas.filter { it.prioridad >= 2 }.maxByOrNull { it.timestamp }
    } else if (noticiasUrbanas.isNotEmpty()) {
        noticiasUrbanas[newsIndex % noticiasUrbanas.size]
    } else {
        null
    }
    
    val topNoticia = topNoticiaRaw ?: NoticiaUrbana(texto = climaActual, tipo = "CLIMA")

    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        sheetPeekHeight = when {
            validacionPendiente -> 450.dp
            pedidoActual != null -> 520.dp
            else -> 220.dp
        },
        sheetContainerColor = Color(0xFF0D1117), 
        sheetShape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        sheetDragHandle = { Box(modifier = Modifier.padding(top = 12.dp).width(40.dp).height(4.dp).clip(CircleShape).background(Color.Gray.copy(0.5f))) },
        sheetContent = {
            Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 8.dp)) {
                if (validacionPendiente) {
                    val fondo by viewModel.fondoDisponible.collectAsStateWithLifecycle()
                    BilleteraDeCombatePanel(
                        montoActual = fondo,
                        onConfirmar = { viewModel.confirmarFondoActual(it) }
                    )
                } else if (pedidoActual != null) {
                    PedidoProPanel(
                        pedido = pedidoActual!!,
                        pedidoEnCola = pedidoEnCola,
                        fotoEvidencia = fotoEvidencia,
                        tiempoEspera = tiempoEspera,
                        ubicacionActual = currentLoc?.let { GeoPoint(it.latitude, it.longitude) },
                        onAceptar = { viewModel.aceptarPedidoRTDB(pedidoActual!!) },
                        onRechazar = { viewModel.rechazarPedido() },
                        onLlegueTienda = { viewModel.reportarLlegadaTienda(pedidoActual!!.id) },
                        onPedidoAbordo = { viewModel.reportarPedidoAbordo(pedidoActual!!.id) },
                        onLlegueCliente = { viewModel.reportarLlegadaCliente(pedidoActual!!.id) },
                        onTomarFoto = { abrirCamaraConPermiso() },
                        onFinalizar = {
                            viewModel.finalizarEntregaConFoto(pedidoActual!!, fotoEvidencia)
                            fotoEvidencia = null
                        }
                    )
                } else {
                    BuscandoPedidosPanel(
                        isConectado = isConectado,
                        onToggle = { 
                            if (isConectado) viewModel.reportarDesconectado() 
                            else viewModel.iniciarTurno()
                        },
                        alertaMecanica = alertaMecanica,
                        proximaOla = proximaOla,
                        fechaCorte = fechaCorte,
                        retenciones = retenciones
                    )
                }
                Spacer(Modifier.height(20.dp))
            }
        }
    ) { _ ->
        Box(modifier = modifier.fillMaxSize()) {
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                properties = MapProperties(
                    isMyLocationEnabled = true,
                    mapStyleOptions = MapStyleOptions.loadRawResourceStyle(context, R.raw.map_style_night)
                ),
                uiSettings = MapUiSettings(zoomControlsEnabled = false, myLocationButtonEnabled = false)
            ) {
                if (puntosRuta.isNotEmpty()) Polyline(points = puntosRuta, color = Color(0xFF4285F4), width = 14f)

                zonas.forEach { zona ->
                    val puntos = zona.coordenadas?.map { LatLng(it.lat, it.lng) } ?: emptyList()
                    if (puntos.size >= 3) {
                        val colorFinal = try { Color(zona.colorHex.toColorInt()) } catch (_: Exception) { Color(0xFF4CAF50) }
                        Polygon(points = puntos, fillColor = colorFinal.copy(0.25f), strokeColor = colorFinal, strokeWidth = 3f)
                    }
                }

                pedidoActual?.let { p ->
                    val tienda = GeoPoint(p.latTienda, p.lngTienda)
                    val cliente = GeoPoint(p.lat, p.lng)
                    if (C4GeoPolicy.isValid(tienda)) {
                        Marker(state = rememberUpdatedMarkerState(position = LatLng(tienda.lat, tienda.lng)), title = "Tienda", icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ORANGE))
                    }
                    if (C4GeoPolicy.isValid(cliente)) {
                        Marker(state = rememberUpdatedMarkerState(position = LatLng(cliente.lat, cliente.lng)), title = "Cliente", icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN))
                    }
                }
            }

            Column(modifier = Modifier.fillMaxWidth().padding(top = 44.dp)) {
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(50.dp).shadow(6.dp, RoundedCornerShape(25.dp)),
                    color = Color(0xFF1E2632),
                    shape = RoundedCornerShape(25.dp)
                ) {
                    Row(modifier = Modifier.padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { }, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.Menu, null, tint = Color.White)
                        }
                        
                        DiagnosticIndicator(Icons.Default.LocationOn, if (currentLoc != null) Color.Green else Color.Gray)
                        DiagnosticIndicator(Icons.Default.Wifi, if (topNoticia.texto.contains("Offline")) Color.Red else Color.Green)
                        
                        val batteryColor = when {
                            batteryLevel < 20 -> Color.Red
                            batteryLevel < 50 -> Color(0xFFFFA000)
                            else -> Color.Green
                        }
                        DiagnosticIndicator(if (isCharging) Icons.Default.BatteryChargingFull else Icons.Default.BatteryFull, batteryColor) 
                        Text("${batteryLevel}%", color = Color.White, fontSize = 10.sp, modifier = Modifier.padding(end = 8.dp))
                        
                        Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                            if (topNoticia.tipo == "ALERTA" || topNoticia.prioridad >= 2) {
                                Box(modifier = Modifier.size(8.dp).background(Color.Red, CircleShape))
                                Spacer(Modifier.width(6.dp))
                            }
                            
                            val displayTexto = if (topNoticia.tipo == "CLIMA") climaActual else topNoticia.texto.uppercase()
                            
                            Text(
                                text = displayTexto,
                                color = if(topNoticia.tipo == "ALERTA") Color.Red else Color.White, 
                                fontSize = 11.sp, 
                                fontWeight = FontWeight.Black, 
                                maxLines = 1
                            )
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))

                Surface(
                    modifier = Modifier.align(Alignment.CenterHorizontally).shadow(4.dp, RoundedCornerShape(12.dp)),
                    color = Color.White,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("Saldo: ", color = Color.Gray, fontSize = 14.sp)
                        Text("MXN${formatearDinero(gananciasHoy)}", color = Color.Black, fontSize = 16.sp, fontWeight = FontWeight.Black)
                        Spacer(Modifier.width(12.dp))
                        Text("Recargar", color = Color(0xFF1E56C3), fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clickable { })
                    }
                }
            }

            FloatingActionButton(
                onClick = { 
                    currentLoc?.let { loc ->
                        scope.launch {
                            cameraPositionState.animate(
                                CameraUpdateFactory.newLatLngZoom(
                                    LatLng(loc.latitude, loc.longitude), 
                                    16f
                                )
                            )
                        }
                    }
                },
                modifier = Modifier.align(Alignment.TopEnd).padding(top = 110.dp, end = 16.dp).size(40.dp),
                containerColor = Color.White,
                contentColor = Color.Black,
                shape = CircleShape
            ) { Icon(Icons.Default.MyLocation, null, modifier = Modifier.size(20.dp)) }
        }
    }
}

@Composable
fun DiagnosticIndicator(icon: androidx.compose.ui.graphics.vector.ImageVector, color: Color) {
    Icon(
        icon, 
        null, 
        tint = color, 
        modifier = Modifier.padding(horizontal = 4.dp).size(14.dp)
    )
}

@Composable
fun BilleteraDeCombatePanel(
    montoActual: Double,
    onConfirmar: (Double) -> Unit
) {
    var sliderValue by remember { mutableFloatStateOf(montoActual.toFloat()) }
    
    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Billetera de Combate", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black)
        Text("Valida tu efectivo para seguir operando", color = Color.Gray, fontSize = 12.sp)
        
        Spacer(Modifier.height(24.dp))
        
        Text(
            text = formatearDinero(sliderValue.toDouble()),
            color = Color(0xFF2ECC71),
            fontSize = 36.sp,
            fontWeight = FontWeight.Black
        )

        Slider(
            value = sliderValue,
            onValueChange = { sliderValue = it },
            valueRange = 0f..2000f,
            steps = 19,
            colors = SliderDefaults.colors(
                thumbColor = Color(0xFF2ECC71),
                activeTrackColor = Color(0xFF2ECC71)
            )
        )
        
        Spacer(Modifier.height(24.dp))
        
        NellyButton(
            text = "CONFIRMAR EFECTIVO",
            containerColor = Color(0xFF2ECC71),
            modifier = Modifier.fillMaxWidth().height(56.dp)
        ) {
            onConfirmar(sliderValue.toDouble())
        }
    }
}

@Composable
fun PedidoProPanel(
    pedido: Pedido,
    pedidoEnCola: Pedido?,
    fotoEvidencia: Bitmap?,
    tiempoEspera: Int,
    ubicacionActual: GeoPoint?,
    onAceptar: () -> Unit,
    onRechazar: () -> Unit,
    onLlegueTienda: () -> Unit,
    onPedidoAbordo: () -> Unit,
    onLlegueCliente: () -> Unit,
    onTomarFoto: () -> Unit,
    onFinalizar: () -> Unit
) {
    val estadoNormalizado = pedido.estado.trim().uppercase(Locale.ROOT)
    val conductorYaAsignado = !pedido.conductorId.isNullOrBlank()
    val estadosOferta = setOf("PENDIENTE", "LISTO", "ASIGNADO", "DISPONIBLE", "PARA_REPARTO", "PENDIENTE_REPARTIDOR")
    val esPendiente = estadoNormalizado in estadosOferta && !conductorYaAsignado
    val esLlegueTienda = estadoNormalizado == "LLEGUE_A_TIENDA"
    val esPedidoAbordo = estadoNormalizado == "PEDIDO_ABORDO"
    val esLlegueCliente = estadoNormalizado == "LLEGUE_A_CLIENTE"
    val esEnCurso = estadoNormalizado == "EN_CURSO" || (conductorYaAsignado && estadoNormalizado in estadosOferta)
    val llegadaTienda = C4GeoPolicy.evaluateArrival(ubicacionActual, GeoPoint(pedido.latTienda, pedido.lngTienda))
    val llegadaCliente = C4GeoPolicy.evaluateArrival(ubicacionActual, GeoPoint(pedido.lat, pedido.lng))
    
    Column(modifier = Modifier.fillMaxWidth()) {
        if (esPendiente) {
            Surface(
                modifier = Modifier.fillMaxWidth().height(40.dp),
                color = Color(0xFF1A1D24),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(modifier = Modifier.fillMaxSize(), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                    Text("Nuevo viaje ", color = Color.White, fontSize = 14.sp)
                    Text("00:38", color = Color(0xFFFFD700), fontWeight = FontWeight.Black, fontSize = 14.sp)
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        if (pedidoEnCola != null) {
            Surface(color = Color(0xFFFFD700).copy(0.1f), shape = RoundedCornerShape(8.dp), modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Layers, null, tint = Color(0xFFFFD700), modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(12.dp))
                    Text("TIENES UNA MISIÓN EN COLA", color = Color(0xFFFFD700), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Text(text = "MXN${formatearDinero(pedido.monto)}", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Black)
        Text(
            text = when { 
                esPendiente -> "¡NUEVA MISIÓN DISPONIBLE!"
                esEnCurso -> "DIRÍGETE A LA TIENDA"
                esLlegueTienda -> "COMPRA EN CURSO"
                esPedidoAbordo -> "ENTREGA EN TRAYECTO"
                esLlegueCliente -> "PUNTO DE ENTREGA"
                else -> "OPERACIÓN ACTIVA" 
            }, 
            color = if(esPendiente) Color(0xFFFFD700) else Color.Gray, 
            fontSize = 13.sp, 
            fontWeight = FontWeight.Black
        )
        
        Spacer(Modifier.height(12.dp))
        
        NellyCard(containerColor = Color(0xFF1E2632)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Store, null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(pedido.tienda_nombre.ifEmpty { "Tienda Nelly" }, color = Color.White, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(4.dp))
                Text(pedido.tienda_direccion, color = Color.Gray, fontSize = 12.sp)
                
                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp), color = Color.Gray.copy(0.2f))
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Person, null, tint = Color.Gray, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(pedido.cliente.ifEmpty { "Cliente Nelly" }, color = Color.White, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(4.dp))
                Text(pedido.cliente_direccion, color = Color.Gray, fontSize = 12.sp)
            }
        }

        if (!pedido.cliente_confirmacion_ubicacion && (esPendiente || esEnCurso)) {
            Spacer(Modifier.height(8.dp))
            Surface(color = Color(0xFFFFD700).copy(0.1f), shape = RoundedCornerShape(8.dp)) {
                Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.LocationSearching, null, tint = Color(0xFFFFD700), modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(8.dp))
                    Text("ESPERANDO 'LUZ VERDE' DE UBICACIÓN (CLIENTE)", color = Color(0xFFFFD700), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        if (esPendiente) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = onRechazar,
                    modifier = Modifier.size(56.dp).background(Color(0xFF1E2632), RoundedCornerShape(12.dp))
                ) { Icon(Icons.Default.Close, null, tint = Color.White) }
                
                Spacer(Modifier.width(8.dp))
                
                NellyButton(
                    text = "¡ARRE, LO LLEVO!",
                    containerColor = Color(0xFF1E88E5),
                    contentColor = Color.White,
                    modifier = Modifier.weight(1f).height(56.dp)
                ) { onAceptar() }
            }
        } else {
            when {
                esEnCurso -> {
                    C4ArrivalButton("YA ESTOY EN LA TIENDA", llegadaTienda, onLlegueTienda)
                }
                esLlegueTienda -> {
                    NellyButton(text = "PEDIDO ABORDO", containerColor = Color(0xFF1E88E5), contentColor = Color.White, modifier = Modifier.fillMaxWidth().height(56.dp)) { onPedidoAbordo() }
                }
                esPedidoAbordo -> {
                    C4ArrivalButton("LLEGUÉ CON EL CLIENTE", llegadaCliente, onLlegueCliente)
                }
                esLlegueCliente -> {
                    if (fotoEvidencia != null) {
                        Image(bitmap = fotoEvidencia.asImageBitmap(), contentDescription = null, modifier = Modifier.fillMaxWidth().height(100.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
                        Spacer(Modifier.height(8.dp))
                        NellyButton(text = "FINALIZAR ENTREGA", containerColor = Color(0xFF4CAF50), modifier = Modifier.fillMaxWidth().height(56.dp)) { onFinalizar() }
                    } else {
                        NellyButton(text = "CAPTURAR EVIDENCIA", containerColor = Color.DarkGray, modifier = Modifier.fillMaxWidth().height(56.dp)) { onTomarFoto() }
                    }
                }
            }
        }
    }
}

@Composable
private fun C4ArrivalButton(text: String, gate: ArrivalGate, onAllowed: () -> Unit) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Button(
            onClick = onAllowed,
            enabled = gate.allowed,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFFD700),
                contentColor = Color.Black,
                disabledContainerColor = Color(0xFF343A40),
                disabledContentColor = Color(0xFFADB5BD)
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(56.dp).padding(8.dp)
        ) {
            Text(text, fontWeight = FontWeight.Bold)
        }
        Text(
            text = gate.message,
            color = if (gate.allowed) Color(0xFF4CAF50) else Color(0xFFFFD54F),
            fontSize = 11.sp,
            modifier = Modifier.padding(horizontal = 12.dp)
        )
    }
}

@Composable
fun BuscandoPedidosPanel(
    isConectado: Boolean,
    onToggle: () -> Unit,
    alertaMecanica: Boolean,
    proximaOla: String?,
    fechaCorte: String,
    retenciones: Double
) {
    Column {
        if (isConectado) {
            NellyCard(containerColor = Color(0xFF1A237E).copy(alpha = 0.8f), modifier = Modifier.padding(bottom = 16.dp)) {
                Column(modifier = Modifier.padding(16.dp)) {
                    FinancialRow("Próximo Corte", fechaCorte)
                    FinancialRow("Retenciones ISR/IVA", "MXN${formatearDinero(retenciones)}")
                }
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Radar, null, tint = if(isConectado) Color.Green else Color.Gray)
            Spacer(Modifier.width(12.dp))
            Text(if(isConectado) "SISTEMA RADAR ACTIVO" else "TAS DESCANSANDO, VOS", style = NellyTypography.titleMedium, color = Color.White)
        }
        if (isConectado) {
            if (alertaMecanica) NellyCard(containerColor = Color.DarkGray, modifier = Modifier.padding(top = 12.dp)) { Text("⚠️ Mantenimiento Requerido", color = Color(0xFFFFD700), modifier = Modifier.padding(8.dp)) }
            if (proximaOla != null) NellyCard(containerColor = Color(0xFF1E56C3), modifier = Modifier.padding(top = 8.dp)) { Text(proximaOla, color = Color.White, modifier = Modifier.padding(8.dp)) }
        }
        Spacer(Modifier.height(24.dp))
        NellyButton(text = if (isConectado) "A DESCANSAR CHUNCO" else "¡A CHAMBEAR COLOCHO!", containerColor = if (isConectado) Color.Red else Color(0xFF1E56C3), modifier = Modifier.fillMaxWidth().height(60.dp)) { onToggle() }
    }
}

@Composable
fun FinancialRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
        Text(value, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}
