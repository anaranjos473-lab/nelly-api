package com.nelly.driver.data.remote

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.nelly.driver.BuildConfig
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class OrderCompleteClient(
    private val endpoint: String = "${BuildConfig.API_BASE_URL}/api/delivery/complete-order"
) {

    data class CompleteResult(
        val ok: Boolean,
        val statusCode: Int,
        val body: String
    )

    private val mainHandler = Handler(Looper.getMainLooper())

    fun completeOrder(
        pedidoId: String,
        onResult: (CompleteResult) -> Unit
    ) {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            onMain(onResult, CompleteResult(false, 401, "Usuario no autenticado"))
            return
        }

        user.getIdToken(false)
            .addOnSuccessListener { result ->
                val token = result.token
                if (token.isNullOrBlank()) {
                    onMain(onResult, CompleteResult(false, 401, "Token vacio"))
                    return@addOnSuccessListener
                }

                sendWithRetry(pedidoId, token, user, true, onResult)
            }
            .addOnFailureListener { error ->
                onMain(onResult, CompleteResult(false, 401, "No se pudo obtener token: ${error.message}"))
            }
    }

    private fun sendWithRetry(
        pedidoId: String,
        userToken: String,
        user: com.google.firebase.auth.FirebaseUser,
        allowRefreshRetry: Boolean,
        onResult: (CompleteResult) -> Unit
    ) {
        Thread {
            val response = postComplete(pedidoId, userToken)

            if (response.statusCode == 401 && allowRefreshRetry) {
                user.getIdToken(true)
                    .addOnSuccessListener { refreshed ->
                        val refreshedToken = refreshed.token
                        if (refreshedToken.isNullOrBlank()) {
                            onMain(onResult, CompleteResult(false, 401, "Token refrescado vacio"))
                            return@addOnSuccessListener
                        }

                        Thread {
                            onMain(onResult, postComplete(pedidoId, refreshedToken))
                        }.start()
                    }
                    .addOnFailureListener { refreshError ->
                        onMain(onResult, CompleteResult(false, 401, "No se pudo refrescar token: ${refreshError.message}"))
                    }
                return@Thread
            }

            onMain(onResult, response)
        }.start()
    }

    private fun postComplete(pedidoId: String, token: String): CompleteResult {
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

            CompleteResult(statusCode in 200..299, statusCode, body)
        } catch (error: Exception) {
            if (BuildConfig.DEBUG) {
                Log.e("NellyComplete", "Error completando pedido en backend", error)
            } else {
                Log.e("NellyComplete", "Error completando pedido en backend")
            }
            CompleteResult(false, 500, "Error completando pedido: ${error.message}")
        } finally {
            connection?.disconnect()
        }
    }

    private fun onMain(onResult: (CompleteResult) -> Unit, result: CompleteResult) {
        mainHandler.post {
            onResult(result)
        }
    }
}
