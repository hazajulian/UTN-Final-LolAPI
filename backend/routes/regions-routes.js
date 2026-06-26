// regions-route.js
// Define las rutas publicas para consultar regiones de Runaterra.

import { Router } from "express";

import {
  getRegionById,
  getRegions,
} from "../controllers/regions-controller.js";

const router = Router();

// Obtiene el listado de regiones.
router.get("/", getRegions);

// Obtiene el detalle de una region.
router.get("/:regionId", getRegionById);

export default router;