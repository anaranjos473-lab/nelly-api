import express from 'express';
const router = express.Router();


// Endpoint raíz con perfil de ejemplo
router.get('/', (req, res) => {
    const nombre = "Administrador";
    const userProfile = {
        displayName: nombre || "Usuario Nelly",
        role: "admin"
    };
    res.status(200).json({ success: true, profile: userProfile });
});

export default router;
            password,
            displayName: nombre || "Usuario Nelly"
        });
        await admin.firestore().collection('usuarios').doc(userRecord.uid).set({
            nombre: nombre || "Usuario Nelly",
            email,
            rol: rol || "DRIVER_TEST",
            fechaRegistro: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            uid: userRecord.uid
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
