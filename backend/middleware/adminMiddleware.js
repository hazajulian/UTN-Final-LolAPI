// adminMiddleware.js
// Permite el acceso solo a usuarios administradores.

export function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "No autorizado",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: "Acceso restringido a administradores",
    });
  }

  next();
}