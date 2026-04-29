import admin from '../config/firebase-config.js';

export const checkAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: "No autorizado" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (e) {
        res.status(403).json({ error: "Token inválido" });
    }
};
