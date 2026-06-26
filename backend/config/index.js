// index.js
// Configura el servidor, conecta MongoDB y registra las rutas principales.

import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "../startpoint/mongo.js";

import metaRouter from "../routes/meta-route.js";
import userRouter from "../routes/user-route.js";
import contactRouter from "../routes/contact-route.js";
import championsRouter from "../routes/champions-route.js";
import itemsRouter from "../routes/items-route.js";
import summonerSpellsRouter from "../routes/summoner-spells-route.js";
import runesRouter from "../routes/runes-route.js";
import regionsRouter from "../routes/regions-routes.js";

import { errorHandler } from "../middleware/errorHandler.js";
import { info, error } from "../utils/logger.js";

const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 3010;
const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3,
].filter(Boolean);

// Conecta la base de datos antes de iniciar el servidor.
try {
  await connectDB();
  info("MongoDB connected");
} catch (err) {
  error("MongoDB connection error", { err });
  process.exit(1);
}

// Configura CORS según entorno.
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || !isProd || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Habilita lectura de JSON en requests.
app.use(express.json());

// Registra rutas públicas y privadas.
app.use("/api/v1", metaRouter);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1", contactRouter);
app.use("/api/v1/champions", championsRouter);
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/summoner-spells", summonerSpellsRouter);
app.use("/api/v1/runes", runesRouter);
app.use("/api/v1/regions", regionsRouter);

// Maneja errores globales.
app.use(errorHandler);

app.listen(PORT, () => {
  info(`Server running on http://localhost:${PORT}`);
});