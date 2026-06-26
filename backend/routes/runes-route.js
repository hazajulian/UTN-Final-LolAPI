// runes-route.js
// Define las rutas publicas para consultar arboles de runas.

import { Router } from "express";

import * as ctrl from "../controllers/runes-controller.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Obtiene todos los arboles de runas.
router.get("/", asyncHandler(ctrl.listRuneTrees));

// Obtiene un arbol de runas por clave.
router.get("/:key", asyncHandler(ctrl.getRuneTreeByKey));

export default router;