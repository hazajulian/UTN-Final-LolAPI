// contact-route.js
// Define la ruta para enviar mensajes desde el formulario de contacto.

import { Router } from "express";

import { contactController } from "../controllers/contact-controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { contactLimiter } from "../middleware/rateLimit.js";
import { validateZod } from "../middleware/validateZod.js";

import { contactSchema } from "../schemas/contact.schema.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Envía un mensaje de contacto autenticado.
router.post("/contact", authMiddleware, contactLimiter, validateZod(contactSchema), asyncHandler(contactController)
);

export default router;