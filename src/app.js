

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import xss from 'xss-clean';
import morgan from 'morgan';
import winston from 'winston';
import zonesRouter from './routes/zones.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import errorHandler from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';



const app = express();

// Seguridad con Helmet
app.use(helmet());

// Rate limiting global (100 peticiones por IP cada 15 min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// CORS personalizado
const corsOptions = {
  origin: ['https://nelly-app.com'], // Cambia por tu frontend oficial
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Protección contra XSS
app.use(xss());

// Compresión de respuestas
app.use(compression());

// Configuración de Winston para logging avanzado
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Morgan integrado con Winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(express.json());

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
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    logger.info(`Swagger docs disponibles en http://localhost:${PORT}/api-docs`);
  });
}

export default app;
