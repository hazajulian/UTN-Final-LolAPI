import { Router } from "express";
import * as ctrl from "../controllers/summoner-spells-controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(ctrl.listSummonerSpells));

router.get("/:id", asyncHandler(ctrl.getSummonerSpellById));

export default router;