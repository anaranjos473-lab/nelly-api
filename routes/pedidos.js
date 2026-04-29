import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    const pedidosProfile = {
        displayName: "Pedidos Nelly",
        status: "online"
    };
    res.status(200).json({ success: true, profile: pedidosProfile });
});

export default router;
        if (!pedidoSnap.exists()) {
            return res.status(404).json({ error: 'Pedido no encontrado en pedidos_en_camino' });
        }
        const pedido = pedidoSnap.val();
        // Actualizar el repartidor asignado
        await pedidoRef.child('logistica/repartidor_id').set(nuevoRepartidorId);
        // Opcional: notificar por Discord
        if (alertaDiscord) {
            await alertaDiscord('🔄 Reasignación de pedido', `Pedido ${pedidoId} reasignado a repartidor ${nuevoRepartidorId}`);
        }
        return res.json({ ok: true, mensaje: `Pedido ${pedidoId} reasignado a ${nuevoRepartidorId}` });
    } catch (e) {
        console.error('[PEDIDOS][REASIGNAR] Error:', e.message);
        return res.status(500).json({ error: 'Error al reasignar pedido', detalle: e.message });
    }
});

export default router;
