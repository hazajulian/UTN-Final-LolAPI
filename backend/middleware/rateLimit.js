// rateLimit.js
// Define limites de peticiones para prevenir abuso y spam.

import rateLimit from "express-rate-limit";

// Limite para intentos de inicio de sesion.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Demasiados intentos de login. Vuelve a intentarlo en 15 minutos.",
});

// Limite para registros de nuevas cuentas.
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Demasiados registros. Vuelve a intentarlo más tarde.",
});

// Limite para solicitudes de recuperacion de contraseña.
export const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Demasiadas solicitudes de restablecimiento. Vuelve a intentarlo en 15 minutos.",
});

// Limite para el formulario de contacto.
export const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Demasiados mensajes. Vuelve a intentarlo en unos minutos.",
});