// asyncHandler.js
// Envuelve controladores asincronos y delega errores al errorHandler.

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);