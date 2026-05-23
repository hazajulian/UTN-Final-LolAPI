// Configuración y arranque del servidor: conexión a DB y rutas principales.
import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "../startpoint/mongo.js";
import userRouter from "../routes/user-route.js";
import contactRouter from "../routes/contact-route.js";
import championsRouter from "../routes/champions-route.js";
import itemsRouter from "../routes/items-route.js";
import summonerSpellsRouter from "../routes/summoner-spells-route.js";
import runesRouter from "../routes/runes-route.js";
import regionsRouter from "../routes/regions-routes.js";
import metaRouter from "../routes/meta-route.js";

import { errorHandler } from "../middleware/errorHandler.js";
import { info, error } from "../utils/logger.js";

/* ============================
   DB
   ============================ */
try {
  await connectDB();
  info("MongoDB conectado");
} catch (err) {
  error("Error conectando a MongoDB", { err });
  process.exit(1);
}

const app = express();

/* ============================
   CORS
   ============================ */
const isProd = process.env.NODE_ENV === "production";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (!isProd) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

/* ============================
   Routes
   ============================ */

// Meta / Health
app.use("/api/v1", metaRouter);

// Auth
app.use("/api/v1/auth", userRouter);

// Contact
app.use("/api/v1", contactRouter);

// Champions
app.use("/api/v1/champions", championsRouter);

// Items
app.use("/api/v1/items", itemsRouter);

// Summoner Spells
app.use("/api/v1/summoner-spells", summonerSpellsRouter);

// Runes
app.use("/api/v1/runes", runesRouter);

// Regions
app.use("/api/v1/regions", regionsRouter);

/* ============================
   Errors
   ============================ */
app.use(errorHandler);

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  info(`Servidor corriendo en http://localhost:${PORT}`);
});