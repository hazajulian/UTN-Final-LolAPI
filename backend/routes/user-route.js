// routes/user-route.js
import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

// Controllers
import {
  register,
  login,
  getProfile,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
  listUsers,
  getUserById,
  getUserByUsername,
  forgotPassword,
  resetPassword,

  // Favorites
  listFavorites,
  listFavoritesFull,
  addFavorite,
  removeFavorite
} from '../controllers/user-controller.js';

const router = Router();

/* ============================
   Public
   ============================ */
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

/* ============================
   Auth
   ============================ */
router.get('/me', authMiddleware, asyncHandler(getProfile));
router.post('/logout', authMiddleware, asyncHandler(logout));
router.put('/profile', authMiddleware, asyncHandler(updateProfile));
router.put('/password', authMiddleware, asyncHandler(changePassword));
router.delete('/', authMiddleware, asyncHandler(deleteAccount));

/* ============================
   FAVORITES (NEW)
   ============================ */
// IDs
router.get('/favorites', authMiddleware, asyncHandler(listFavorites));
// details para pestaña favoritos
router.get('/favorites/full', authMiddleware, asyncHandler(listFavoritesFull));
// add/remove
router.post('/favorites/:id', authMiddleware, asyncHandler(addFavorite));
router.delete('/favorites/:id', authMiddleware, asyncHandler(removeFavorite));

/* ============================
   Admin
   ============================ */
router.get('/all', authMiddleware, adminMiddleware, asyncHandler(listUsers));
router.get('/id/:id', authMiddleware, adminMiddleware, asyncHandler(getUserById));
router.get('/username/:username', authMiddleware, adminMiddleware, asyncHandler(getUserByUsername));

export default router;
