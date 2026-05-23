// Rutas públicas para consultar campeones oficiales.
import { Router } from "express";
import * as ctrl from "../controllers/champions-controllers.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { validateZod } from "../middleware/validateZod.js";
import { listQuerySchema } from "../schemas/query.schema.js";
import { idParamSchema } from "../schemas/params.schema.js";

const router = Router();

// Listado de campeones oficiales
router.get(
  "/",
  validateZod(listQuerySchema, "query"),
  asyncHandler(ctrl.listSeedChampions)
);

// Detalle de campeón oficial
router.get(
  "/:id",
  validateZod(idParamSchema, "params"),
  asyncHandler(ctrl.getChampionById)
);

export default router;