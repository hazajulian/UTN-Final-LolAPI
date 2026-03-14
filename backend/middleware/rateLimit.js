import rateLimit from 'express-rate-limit';

// Máximo 10 intentos de login por IP en 15 minutos
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de login. Vuelve a intentarlo en 15 minutos.'
});

// Máximo 5 solicitudes de forgot-password por IP en 15 minutos
export const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiadas solicitudes de restablecimiento. Vuelve a intentarlo en 15 minutos.'
});

// Contact anti-spam básico (opcional pero recomendado)
export const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 5,
  message: 'Demasiados mensajes. Vuelve a intentarlo en unos minutos.'
});
