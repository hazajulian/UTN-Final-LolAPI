// Rutas para gestionar Items (Tienda)
import { Router } from "express";
import * as ctrl from "../controllers/items-controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { validateZod } from "../middleware/validateZod.js";
import { idParamSchema } from "../schemas/params.schema.js";
import { itemsAllQuerySchema, itemsListQuerySchema } from "../schemas/items.schema.js";
import { itemsTagsQuerySchema } from "../schemas/itemsTags.schema.js";
import { itemsFiltersMetaQuerySchema } from "../schemas/itemsFiltersMeta.schema.js";

const router = Router();

// List paginado + filtros
router.get("/", validateZod(itemsListQuerySchema, "query"), asyncHandler(ctrl.listItems));

// List completo liviano
router.get("/all", validateZod(itemsAllQuerySchema, "query"), asyncHandler(ctrl.listAllItems));

// Tags para filtros UI
router.get("/tags", validateZod(itemsTagsQuerySchema, "query"), asyncHandler(ctrl.listItemTags));

// Meta items
router.get("/meta", asyncHandler(ctrl.itemsMeta));

// Meta filtros (tiers/sections/roles)
router.get("/meta/filters", validateZod(itemsFiltersMetaQuerySchema, "query"), asyncHandler(ctrl.itemsFiltersMeta));

// Detalle
router.get("/:id", validateZod(idParamSchema, "params"), asyncHandler(ctrl.getItemById));

export default router;
