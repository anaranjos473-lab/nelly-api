package com.example.nellydriver.telemetry

import timber.log.Timber

object TacticalTelemetry {
    // Eventos
    const val SHADOW_MODE_ENTRIES = "SHADOW_MODE_ENTRIES"
    const val ROOM_SYNC_STARTED = "ROOM_SYNC_STARTED"
    const val ROOM_SYNC_FINISHED = "ROOM_SYNC_FINISHED"
    const val ROOM_SYNC_FAILED = "ROOM_SYNC_FAILED"
    const val FORCE_CLOSE_RECOVERY = "FORCE_CLOSE_RECOVERY"
    const val SUCCESSFUL_DELIVERIES = "SUCCESSFUL_DELIVERIES"
    const val FINANCIAL_CALCULATION_SUCCESS = "FINANCIAL_CALCULATION_SUCCESS"
    const val FINANCIAL_CALCULATION_ERROR = "FINANCIAL_CALCULATION_ERROR"
    
    // Conectividad
    const val NETWORK_RESTORED = "NETWORK_RESTORED"
    const val NETWORK_LOST = "NETWORK_LOST"
    
    // Operativo
    const val ORDER_ACCEPTED = "ORDER_ACCEPTED"
    const val ORDER_DELIVERED = "ORDER_DELIVERED"

    fun logEvent(event: String, params: Map<String, Any?> = emptyMap()) {
        Timber.i("📊 [TELEMETRY] Event: $event | Params: $params")
    }

    fun logState(key: String, value: Any?) {
        Timber.d("📈 [STATE] $key = $value")
    }

    fun incrementCounter(counter: String) {
        Timber.d("🔢 [COUNTER] ++$counter")
    }
}
