// user-route.js
// Define las rutas de autenticacion, perfil, favoritos y administracion.

import { Router } from "express";

import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
  listFavorites,
  listFavoritesFull,
  addFavorite,
  removeFavorite,
  listUsers,
  getUserById,
  getUserByUsername,
} from "../controllers/user-controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

import {
  registerLimiter,
  loginLimiter,
  forgotLimiter,
} from "../middleware/rateLimit.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Registro y autenticacion.
router.post("/register", registerLimiter, asyncHandler(register));
router.post("/login", loginLimiter, asyncHandler(login));
router.post("/forgot-password", forgotLimiter, asyncHandler(forgotPassword));
router.post("/reset-password", forgotLimiter, asyncHandler(resetPassword));

// Perfil del usuario autenticado.
router.get("/me", authMiddleware, asyncHandler(getProfile));
router.post("/logout", authMiddleware, asyncHandler(logout));
router.put("/profile", authMiddleware, asyncHandler(updateProfile));
router.put("/password", authMiddleware, asyncHandler(changePassword));
router.delete("/", authMiddleware, asyncHandler(deleteAccount));

// Gestion de favoritos.
router.get("/favorites", authMiddleware, asyncHandler(listFavorites));
router.get("/favorites/full", authMiddleware, asyncHandler(listFavoritesFull));
router.post("/favorites/:id", authMiddleware, asyncHandler(addFavorite));
router.delete("/favorites/:id", authMiddleware, asyncHandler(removeFavorite));

// Gestion de usuarios para administradores.
router.get("/all", authMiddleware, adminMiddleware, asyncHandler(listUsers));
router.get("/id/:id", authMiddleware, adminMiddleware, asyncHandler(getUserById));
router.get(
  "/username/:username",
  authMiddleware,
  adminMiddleware,
  asyncHandler(getUserByUsername)
);

export default router;