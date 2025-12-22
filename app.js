const express = require('express');
const walletRoutes = require('./routes/walletRoutes');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// Conexión de rutas
app.use('/api/v1/wallet', walletRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Nelly API en puerto ${PORT}`));
