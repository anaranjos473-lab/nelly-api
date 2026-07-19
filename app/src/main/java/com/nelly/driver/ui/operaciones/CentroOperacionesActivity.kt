package com.nelly.driver.ui.operaciones

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.nelly.driver.R
import com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity

class CentroOperacionesActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_centro_operaciones)

        findViewById<Button>(R.id.btnConectar).setOnClickListener {
            findViewById<TextView>(R.id.txtEstadoOperacion).text = "Estado: Conectado"
        }

        findViewById<Button>(R.id.btnAbrirRadar).setOnClickListener {
            startActivity(
                Intent(this, PedidosDisponiblesActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
                }
            )
        }
    }
}
