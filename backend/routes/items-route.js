// items-route.js
// Define las rutas publicas para consultar items y metadatos.

import { Router } from "express";

import * as ctrl from "../controllers/items-controller.js";

import { validateZod } from "../middleware/validateZod.js";

import { idParamSchema } from "../schemas/params.schema.js";
import { itemsAllQuerySchema, itemsListQuerySchema } from "../schemas/items.schema.js";
import { itemsTagsQuerySchema } from "../schemas/itemsTags.schema.js";
import { itemsFiltersMetaQuerySchema } from "../schemas/itemsFiltersMeta.schema.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Obtiene el listado paginado de items.
router.get("/", validateZod(itemsListQuerySchema, "query"), asyncHandler(ctrl.listItems));

// Obtiene todos los items disponibles.
router.get("/all", validateZod(itemsAllQuerySchema, "query"), asyncHandler(ctrl.listAllItems));

// Obtiene los tags disponibles de los items.
router.get("/tags", validateZod(itemsTagsQuerySchema, "query"), asyncHandler(ctrl.listItemTags));

// Obtiene metadatos generales de items.
router.get("/meta", asyncHandler(ctrl.itemsMeta));

// Obtiene filtros disponibles para la interfaz.
router.get("/meta/filters", validateZod(itemsFiltersMetaQuerySchema, "query"), asyncHandler(ctrl.itemsFiltersMeta));

// Obtiene el detalle de un item por id.
router.get("/:id", validateZod(idParamSchema, "params"), asyncHandler(ctrl.getItemById));

export default router;