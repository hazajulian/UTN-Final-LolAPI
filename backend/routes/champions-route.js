// champions-route.js
// Define las rutas publicas para consultar campeones oficiales.

import { Router } from "express";

import * as ctrl from "../controllers/champions-controllers.js";

import { validateZod } from "../middleware/validateZod.js";

import { idParamSchema } from "../schemas/params.schema.js";
import { listQuerySchema } from "../schemas/query.schema.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Obtiene el listado de campeones.
router.get("/", validateZod(listQuerySchema, "query"), asyncHandler(ctrl.listSeedChampions));

// Obtiene el detalle de un campeon por id.
router.get("/:id", validateZod(idParamSchema, "params"), asyncHandler(ctrl.getChampionById));

export default router;