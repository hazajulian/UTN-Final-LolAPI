import { Router } from "express";
import * as ctrl from "../controllers/runes-controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(ctrl.listRuneTrees));

router.get("/:key", asyncHandler(ctrl.getRuneTreeByKey));

export default router;