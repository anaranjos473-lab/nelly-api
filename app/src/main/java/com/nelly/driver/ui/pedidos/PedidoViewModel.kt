package com.nelly.driver.ui.pedidos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nelly.driver.data.repository.PedidoRepository
import com.nelly.driver.model.PedidoEntity
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn

class PedidoViewModel(
    private val repository: PedidoRepository
) : ViewModel() {

    private val _syncEstado = MutableStateFlow("IDLE")
    val syncEstado: StateFlow<String> = _syncEstado.asStateFlow()
    val syncEventos: StateFlow<String> = repository.syncEventos
    val pedidoActivoId: StateFlow<String?> = repository.pedidoActivoId
    private val _bloqueoDeuda = MutableStateFlow(false)
    val bloqueoDeuda: StateFlow<Boolean> = _bloqueoDeuda.asStateFlow()

    val pedidos: StateFlow<List<PedidoEntity>> = repository
        .observarPedidos()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun limpiarPedidoActivoLocal() {
        Log.i("ICV02_VM", "limpiarPedidoActivoLocal before pedidoActivoId=${pedidoActivoId.value ?: "null"}")
        repository.limpiarPedidoActivoLocal()
        Log.i("ICV02_VM", "limpiarPedidoActivoLocal after pedidoActivoId=${pedidoActivoId.value ?: "null"}")
    }

    fun resolverEstadoOperativo(
        repartidorUid: String?,
        onResultado: (PedidoRepository.EstadoOperativo) -> Unit
    ) {
        repository.resolverEstadoOperativo(repartidorUid, onResultado)
    }

    fun iniciarSincronizacion() {
        Log.i("ICV02_VM", "iniciarSincronizacion syncEstado=${_syncEstado.value} pedidoActivoId=${pedidoActivoId.value ?: "null"}")
        _syncEstado.value = "RUNNING"
        repository.iniciarSincronizacion { mensaje, error ->
            _syncEstado.value = "ERROR: $mensaje ${error?.message ?: ""}".trim()
        }
    }

    fun detenerSincronizacion() {
        repository.detenerSincronizacion()
        _syncEstado.value = "STOPPED"
    }

    fun aceptarPedido(
        pedidoId: String,
        repartidorUid: String,
        onResultado: (ok: Boolean, mensaje: String) -> Unit
    ) {
        repository.aceptarPedido(pedidoId, repartidorUid) { ok, mensaje ->
            _syncEstado.value = if (ok) "ACEPTADO" else "ERROR: $mensaje"
            if (ok) {
                _bloqueoDeuda.value = false
            } else if (mensaje.contains("Limite de deuda alcanzado", ignoreCase = true)) {
                _bloqueoDeuda.value = true
            }
            onResultado(ok, mensaje)
        }
    }

    fun completarPedido(
        pedidoId: String,
        onResultado: (ok: Boolean, mensaje: String) -> Unit
    ) {
        repository.completarPedido(pedidoId) { ok, mensaje ->
            _syncEstado.value = if (ok) "ENTREGADO" else "ERROR: $mensaje"
            onResultado(ok, mensaje)
        }
    }

    fun detenerAudioPedido() {
        repository.detenerNotificacionPedido()
    }

    override fun onCleared() {
        detenerSincronizacion()
        super.onCleared()
    }
}
