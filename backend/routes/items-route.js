// Rutas de Items.
// Expone listado paginado, listado completo, tags, meta filtros y detalle por id.

import { Router } from "express";
import * as ctrl from "../controllers/items-controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { validateZod } from "../middleware/validateZod.js";
import { idParamSchema } from "../schemas/params.schema.js";
import { itemsAllQuerySchema, itemsListQuerySchema } from "../schemas/items.schema.js";
import { itemsTagsQuerySchema } from "../schemas/itemsTags.schema.js";
import { itemsFiltersMetaQuerySchema } from "../schemas/itemsFiltersMeta.schema.js";

const router = Router();

router.get("/", validateZod(itemsListQuerySchema, "query"), asyncHandler(ctrl.listItems));

router.get("/all", validateZod(itemsAllQuerySchema, "query"), asyncHandler(ctrl.listAllItems));

router.get("/tags", validateZod(itemsTagsQuerySchema, "query"), asyncHandler(ctrl.listItemTags));

router.get("/meta", asyncHandler(ctrl.itemsMeta));

router.get(
  "/meta/filters",
  validateZod(itemsFiltersMetaQuerySchema, "query"),
  asyncHandler(ctrl.itemsFiltersMeta)
);

router.get("/:id", validateZod(idParamSchema, "params"), asyncHandler(ctrl.getItemById));

export default router;