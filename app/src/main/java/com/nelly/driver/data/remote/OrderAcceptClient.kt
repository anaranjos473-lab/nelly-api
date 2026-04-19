package com.nelly.driver.data.remote

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class OrderAcceptClient(
    private val endpoint: String = "https://nelly-api-8lh1.onrender.com/api/delivery/accept-order"
) {

    data class AcceptResult(
        val ok: Boolean,
        val statusCode: Int,
        val body: String
    )

    private val mainHandler = Handler(Looper.getMainLooper())

    fun acceptOrder(
        pedidoId: String,
        onResult: (AcceptResult) -> Unit
    ) {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            onMain(onResult, AcceptResult(false, 401, "Usuario no autenticado"))
            return
        }

        user.getIdToken(false)
            .addOnSuccessListener { result ->
                val token = result.token
                if (token.isNullOrBlank()) {
                    onMain(onResult, AcceptResult(false, 401, "Token vacio"))
                    return@addOnSuccessListener
                }

                sendWithRetry(
                    pedidoId = pedidoId,
                    userToken = token,
                    user = user,
                    allowRefreshRetry = true,
                    onResult = onResult
                )
            }
            .addOnFailureListener { error ->
                onMain(onResult, AcceptResult(false, 401, "No se pudo obtener token: ${error.message}"))
            }
    }

    private fun sendWithRetry(
        pedidoId: String,
        userToken: String,
        user: com.google.firebase.auth.FirebaseUser,
        allowRefreshRetry: Boolean,
        onResult: (AcceptResult) -> Unit
    ) {
        Thread {
            val response = postAccept(pedidoId, userToken)

            if (response.statusCode == 403 && allowRefreshRetry) {
                Log.w("NellyAuth", "Claim no detectado, refrescando token y reintentando una vez...")
                user.getIdToken(true)
                    .addOnSuccessListener { refreshed ->
                        val refreshedToken = refreshed.token
                        if (refreshedToken.isNullOrBlank()) {
                            onMain(onResult, AcceptResult(false, 401, "Token refrescado vacio"))
                            return@addOnSuccessListener
                        }

                        Thread {
                            val retryResponse = postAccept(pedidoId, refreshedToken)
                            onMain(onResult, retryResponse)
                        }.start()
                    }
                    .addOnFailureListener { refreshError ->
                        onMain(
                            onResult,
                            AcceptResult(false, 401, "No se pudo refrescar token: ${refreshError.message}")
                        )
                    }
                return@Thread
            }

            onMain(onResult, response)
        }.start()
    }

    private fun postAccept(pedidoId: String, token: String): AcceptResult {
        var connection: HttpURLConnection? = null

        return try {
            val payload = JSONObject().apply {
                put("pedidoId", pedidoId)
            }

            connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15000
                readTimeout = 15000
                doInput = true
                doOutput = true
                setRequestProperty("Authorization", "Bearer $token")
                setRequestProperty("Content-Type", "application/json")
            }

            connection.outputStream.use { os ->
                os.write(payload.toString().toByteArray(Charsets.UTF_8))
            }

            val statusCode = connection.responseCode
            val stream = if (statusCode in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.use { input ->
                BufferedReader(InputStreamReader(input)).readText()
            }.orEmpty()

            AcceptResult(statusCode in 200..299, statusCode, body)
        } catch (error: Exception) {
            Log.e("NellyAccept", "Error aceptando pedido en backend", error)
            AcceptResult(false, 500, "Error aceptando pedido: ${error.message}")
        } finally {
            connection?.disconnect()
        }
    }

    private fun onMain(onResult: (AcceptResult) -> Unit, result: AcceptResult) {
        mainHandler.post {
            onResult(result)
        }
    }
}
