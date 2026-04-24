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

class IncidentReportClient(
    private val endpoint: String = "https://nelly-api-8lh1.onrender.com/api/delivery/reporte-incidente"
) {

    data class ReportResult(
        val ok: Boolean,
        val statusCode: Int,
        val body: String
    )

    private val mainHandler = Handler(Looper.getMainLooper())

    fun reportIncident(
        activo: Boolean,
        descripcion: String?,
        onResult: (ReportResult) -> Unit
    ) {
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            onMain(onResult, ReportResult(false, 401, "Usuario no autenticado"))
            return
        }

        user.getIdToken(false)
            .addOnSuccessListener { result ->
                val token = result.token
                if (token.isNullOrBlank()) {
                    onMain(onResult, ReportResult(false, 401, "Token vacio"))
                    return@addOnSuccessListener
                }

                sendWithRetry(
                    activo = activo,
                    descripcion = descripcion,
                    userToken = token,
                    user = user,
                    allowRefreshRetry = true,
                    onResult = onResult
                )
            }
            .addOnFailureListener { error ->
                onMain(onResult, ReportResult(false, 401, "No se pudo obtener token: ${error.message}"))
            }
    }

    private fun sendWithRetry(
        activo: Boolean,
        descripcion: String?,
        userToken: String,
        user: com.google.firebase.auth.FirebaseUser,
        allowRefreshRetry: Boolean,
        onResult: (ReportResult) -> Unit
    ) {
        Thread {
            val response = postIncident(activo, descripcion, userToken)

            if (response.statusCode == 403 && allowRefreshRetry) {
                if (BuildConfig.DEBUG) {
                    Log.w("NellyAuth", "Claim no detectado, refrescando token y reintentando una vez...")
                }

                user.getIdToken(true)
                    .addOnSuccessListener { refreshed ->
                        val refreshedToken = refreshed.token
                        if (refreshedToken.isNullOrBlank()) {
                            onMain(onResult, ReportResult(false, 401, "Token refrescado vacio"))
                            return@addOnSuccessListener
                        }

                        Thread {
                            val retryResponse = postIncident(activo, descripcion, refreshedToken)
                            onMain(onResult, retryResponse)
                        }.start()
                    }
                    .addOnFailureListener { refreshError ->
                        onMain(
                            onResult,
                            ReportResult(false, 401, "No se pudo refrescar token: ${refreshError.message}")
                        )
                    }
                return@Thread
            }

            onMain(onResult, response)
        }.start()
    }

    private fun postIncident(activo: Boolean, descripcion: String?, token: String): ReportResult {
        var connection: HttpURLConnection? = null

        return try {
            val payload = JSONObject().apply {
                put("activo", activo)
                if (!descripcion.isNullOrBlank()) {
                    put("descripcion", descripcion)
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

            ReportResult(statusCode in 200..299, statusCode, body)
        } catch (error: Exception) {
            if (BuildConfig.DEBUG) {
                Log.e("NellyIncident", "Error reportando incidente", error)
            } else {
                Log.e("NellyIncident", "Error reportando incidente")
            }
            ReportResult(false, 500, "Error reportando incidente: ${error.message}")
        } finally {
            connection?.disconnect()
        }
    }

    private fun onMain(onResult: (ReportResult) -> Unit, result: ReportResult) {
        mainHandler.post {
            onResult(result)
        }
    }
}
