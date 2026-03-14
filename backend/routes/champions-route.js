// Rutas para gestionar campeones oficiales y custom
import { Router } from 'express';
import * as ctrl from '../controllers/champions-controllers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

import { validateZod } from '../middleware/validateZod.js';
import { listQuerySchema } from '../schemas/query.schema.js';
import { createChampionSchema } from '../schemas/champion.schema.js';
import { idParamSchema } from '../schemas/params.schema.js';

const router = Router();

// Seed champions (público) + Zod query validation
router.get('/', validateZod(listQuerySchema, 'query'), asyncHandler(ctrl.listSeedChampions));

// Custom champions del usuario (requiere auth)
router.get('/user', authMiddleware, asyncHandler(ctrl.listMyChampions));

router.post('/', authMiddleware, validateZod(createChampionSchema), asyncHandler(ctrl.createCustomChampion));

router.patch('/:id', authMiddleware, validateZod(idParamSchema, 'params'), asyncHandler(ctrl.updateChampion));

router.delete('/:id', authMiddleware, validateZod(idParamSchema, 'params'), asyncHandler(ctrl.deleteChampion));

// Get champion details (seed o custom)
router.get('/:id', validateZod(idParamSchema, 'params'), asyncHandler(ctrl.getChampionById));

export default router;
