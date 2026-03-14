// Configuración y arranque del servidor: conexión a DB, rutas y Swagger
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { connectDB } from '../startpoint/mongo.js';
import userRouter from '../routes/user-route.js';
import contactRouter from '../routes/contact-route.js';
import championsRouter from '../routes/champions-route.js';
import itemsRouter from "../routes/items-route.js";
import metaRouter from '../routes/meta-route.js';

import { errorHandler } from '../middleware/errorHandler.js';
import { info, error } from '../utils/logger.js';

/* ============================
   DB
   ============================ */
try {
  await connectDB();
  info('MongoDB conectado');
} catch (err) {
  error('Error conectando a MongoDB', { err });
  process.exit(1);
}

const app = express();

/* ============================
   CORS
   - En dev: permite todo
   - En prod: permite solo origins de FRONTEND_URL + extras
   ============================ */
const isProd = process.env.NODE_ENV === 'production';

// Podés setear FRONTEND_URL=http://localhost:5173 o tu deploy
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2, // opcional
  process.env.FRONTEND_URL_3  // opcional
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // requests sin origin (Postman/REST Client) -> permitir
      if (!origin) return cb(null, true);

      // Dev: permitir todo
      if (!isProd) return cb(null, true);

      // Prod: permitir solo whitelist
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json());

/* ============================
   Swagger JSON
   ============================ */
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'docs', 'swagger.json'));
});

app.get('/swagger-es.json', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'docs', 'swagger-es.json'));
});

/* ============================
   Routes
   ============================ */

// Meta / Health (público)
app.use('/api/v1', metaRouter);

// Auth
app.use('/api/v1/auth', userRouter);

// Contact
app.use('/api/v1', contactRouter);

// Champions
app.use('/api/v1/champions', championsRouter);

// Items (Tienda)
app.use("/api/v1/items", itemsRouter);

/* ============================
   Errors
   ============================ */
app.use(errorHandler);

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  info(`Servidor corriendo en http://localhost:${PORT}`);
});
