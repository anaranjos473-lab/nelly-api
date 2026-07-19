package com.example.nellydriver

import android.app.Application
import com.google.firebase.FirebaseApp

class NellyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
