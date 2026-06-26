// summoner-spells-route.js
// Define las rutas publicas para consultar hechizos de invocador.

import { Router } from "express";

import * as ctrl from "../controllers/summoner-spells-controller.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Obtiene el listado de hechizos de invocador.
router.get("/", asyncHandler(ctrl.listSummonerSpells));

// Obtiene el detalle de un hechizo por id.
router.get("/:id", asyncHandler(ctrl.getSummonerSpellById));

export default router;