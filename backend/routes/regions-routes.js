import { Router } from "express";
import {
  getRegionById,
  getRegions,
} from "../controllers/regions-controller.js";

const router = Router();

router.get("/", getRegions);
router.get("/:regionId", getRegionById);

export default router;