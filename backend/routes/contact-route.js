import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { contactController } from '../controllers/contact-controller.js';

import { validateZod } from '../middleware/validateZod.js';
import { contactSchema } from '../schemas/contact.schema.js';
import { contactLimiter } from '../middleware/rateLimit.js';

const router = Router();

// /api/v1/contact
router.post(
  '/contact',
  authMiddleware,
  contactLimiter,
  validateZod(contactSchema),
  asyncHandler(contactController)
);

export default router;
