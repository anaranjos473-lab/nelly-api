import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimiter from './middlewares/rateLimiter.js';
import secureHeaders from './middlewares/secureHeaders.js';
import zonesRouter from './routes/zones.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import errorHandler from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(secureHeaders);
app.use(rateLimiter);

// Swagger/OpenAPI config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nelly Delivery API',
      version: '1.0.0',
      description: 'Documentación automática de la API Nelly Delivery',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
  res.send('API Nelly funcionando 🚀');
});

app.use('/api/zonas', zonesRouter);
app.use('/api/usuarios', usersRouter);
app.use('/api/ordenes', ordersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Middleware de manejo de errores
app.use(errorHandler);


// Solo arranca el puerto si NO estamos en modo de prueba
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Swagger docs disponibles en http://localhost:${PORT}/api-docs`);
  });
}

export default app;
