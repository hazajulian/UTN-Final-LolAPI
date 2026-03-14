// Captura errores y responde con JSON consistente
import { error as logError } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logError('Unhandled error', {
    err: {
      message: err?.message,
      statusCode: err?.statusCode,
      stack: err?.stack
    }
  });

  const status = err?.statusCode || 500;

  // Si ya viene un payload armado (por ejemplo desde un helper), lo respetamos
  const payload = {
    status: 'error',
    message: err?.message || 'Error interno del servidor'
  };

  // Si hay detalles (ej: validación custom), los incluimos
  if (err?.details) payload.details = err.details;

  // En dev, opcionalmente exponemos el stack (útil para debug)
  if (process.env.NODE_ENV !== 'production' && err?.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
