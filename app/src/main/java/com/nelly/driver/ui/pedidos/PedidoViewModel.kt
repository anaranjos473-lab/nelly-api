package com.nelly.driver.ui.pedidos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nelly.driver.data.repository.PedidoRepository
import com.nelly.driver.model.PedidoEntity
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

    fun iniciarSincronizacion() {
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

    override fun onCleared() {
        detenerSincronizacion()
        super.onCleared()
    }
}
