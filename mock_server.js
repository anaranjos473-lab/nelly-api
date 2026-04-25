const express = require('express');
const app = express();
const PORT = 10001;
app.get('/api/admin/metricas/rentabilidad', (req, res) => {
    res.json({
        ventasBrutas: 1500,
        comisionesNelly: 150,
        conteoEntregas: 10,
        mapaCalor: { "Zona Centro": 1000, "Zona Norte": 500 }
    });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log('Mock server running on port ' + PORT);
});
