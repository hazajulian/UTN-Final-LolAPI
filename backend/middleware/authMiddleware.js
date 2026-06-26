// authMiddleware.js
// Valida el token de sesion y adjunta el usuario autenticado.

import { User } from "../models/mongodb/user-modeldb.js";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No autorizado",
    });
  }

  const token = header.slice(7);

  const user = await User.findOne({
    sessionToken: token,
  }).select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Token inválido o sesión expirada",
    });
  }

  req.user = user;

  next();
}