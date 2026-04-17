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

class LocationUpdateClient(
    private val endpoint: String = "https://nelly-api-81h1.onrender.com/api/delivery/update-location"
) {

    data class UpdateResult(
        val ok: Boolean,
        val statusCode: Int,
        val body: String
    )

    private val mainHandler = Handler(Looper.getMainLooper())

    fun updateLocation(
        lat: Double,
        lng: Double,
        pedidoId: String?,
        onResult: (UpdateResult) -> Unit
    ) {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            onMain(onResult, UpdateResult(false, 401, "Usuario no autenticado"))
            return
        }

        user.getIdToken(false)
            .addOnSuccessListener { result ->
                val token = result.token
                if (token.isNullOrBlank()) {
                    onMain(onResult, UpdateResult(false, 401, "Token vacio"))
                    return@addOnSuccessListener
                }

                sendWithRetry(
                    lat = lat,
                    lng = lng,
                    pedidoId = pedidoId,
                    userToken = token,
                    user = user,
                    allowRefreshRetry = true,
                    onResult = onResult
                )
            }
            .addOnFailureListener { error ->
                onMain(onResult, UpdateResult(false, 401, "No se pudo obtener token: ${error.message}"))
            }
    }

    private fun sendWithRetry(
        lat: Double,
        lng: Double,
        pedidoId: String?,
        userToken: String,
        user: com.google.firebase.auth.FirebaseUser,
        allowRefreshRetry: Boolean,
        onResult: (UpdateResult) -> Unit
    ) {
        Thread {
            val response = postLocation(lat, lng, pedidoId, userToken)

            if (response.statusCode == 403 && allowRefreshRetry) {
                Log.w("NellyAuth", "Claim no detectado, refrescando token y reintentando una vez...")
                user.getIdToken(true)
                    .addOnSuccessListener { refreshed ->
                        val refreshedToken = refreshed.token
                        if (refreshedToken.isNullOrBlank()) {
                            onMain(onResult, UpdateResult(false, 401, "Token refrescado vacio"))
                            return@addOnSuccessListener
                        }

                        Thread {
                            val retryResponse = postLocation(lat, lng, pedidoId, refreshedToken)
                            onMain(onResult, retryResponse)
                        }.start()
                    }
                    .addOnFailureListener { refreshError ->
                        onMain(
                            onResult,
                            UpdateResult(false, 401, "No se pudo refrescar token: ${refreshError.message}")
                        )
                    }
                return@Thread
            }

            onMain(onResult, response)
        }.start()
    }

    private fun postLocation(
        lat: Double,
        lng: Double,
        pedidoId: String?,
        token: String
    ): UpdateResult {
        var connection: HttpURLConnection? = null

        return try {
            val payload = JSONObject().apply {
                put("lat", lat)
                put("lng", lng)
                if (!pedidoId.isNullOrBlank()) {
                    put("pedidoId", pedidoId)
                }
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

            UpdateResult(statusCode in 200..299, statusCode, body)
        } catch (error: Exception) {
            Log.e("NellyLocation", "Error enviando ubicacion", error)
            UpdateResult(false, 500, "Error enviando ubicacion: ${error.message}")
        } finally {
            connection?.disconnect()
        }
    }

    private fun onMain(onResult: (UpdateResult) -> Unit, result: UpdateResult) {
        mainHandler.post {
            onResult(result)
        }
    }
}
