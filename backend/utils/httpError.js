// Helpers para errores HTTP consistentes
export function httpError(statusCode, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (details) err.details = details;
  return err;
}

export const badRequest  = (message = 'Bad Request', details) => httpError(400, message, details);
export const unauthorized = (message = 'No autorizado', details) => httpError(401, message, details);
export const forbidden    = (message = 'Forbidden', details) => httpError(403, message, details);
export const notFound     = (message = 'No encontrado', details) => httpError(404, message, details);
