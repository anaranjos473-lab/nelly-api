# Snippets de integración Chat Nelly (Frontend)

## JavaScript (Web/Panel)

```js
// Reportar estado "escribiendo"
const reportarEscribiendo = (pedidoId, userId, estaEscribiendo) => {
    const statusRef = firebase.database().ref(`chats/${pedidoId}/metadatos/escribiendo/${userId}`);
    statusRef.set(estaEscribiendo); 
    // Al cerrar la app o limpiar el campo, se pone en false
};

// Listener para mostrar el aviso en la UI
firebase.database().ref(`chats/${pedidoId}/metadatos/escribiendo`)
    .on('value', (snapshot) => {
        const estados = snapshot.val();
        // Lógica para mostrar "El repartidor está escribiendo..."
    });

// Listener de mensajes (últimos 20)
firebase.database().ref(`chats/${pedidoId}/mensajes`).limitToLast(20)
    .on('child_added', (snapshot) => {
        const mensaje = snapshot.val();
        // Lógica para mostrar mensaje en UI
    });
```

## Kotlin (Android)

```kotlin
fun iniciarEscuchaChat(pedidoId: String) {
    val chatRef = database.getReference("chats/$pedidoId/mensajes")
    chatRef.limitToLast(20).addChildEventListener(object : ChildEventListener {
        override fun onChildAdded(snapshot: DataSnapshot, previousChildName: String?) {
            val nuevoMensaje = snapshot.getValue(MensajeChat::class.java)
            nuevoMensaje?.let { 
                _listaMensajes.value?.add(it)
                _listaMensajes.postValue(_listaMensajes.value)
            }
        }
        // ... (onChildChanged para el "Visto", onChildRemoved, etc.)
    })
}
```

---

**Checklist de impacto:**
- [x] Reglas de seguridad en database.rules.json
- [x] Snippets frontend para "escribiendo" y mensajes
- [x] Listeners granulares, bajo consumo
- [x] Sin impacto en app.js ni panel.html (integración directa SDK)

Listo para integración y pruebas en ambiente de desarrollo.