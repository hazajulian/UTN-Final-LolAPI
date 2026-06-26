// errorHandler.js
// Maneja errores globales y responde con un formato JSON consistente.

import { error as logError } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  logError("Unhandled error", {
    err: {
      message: err?.message,
      statusCode: err?.statusCode,
      stack: err?.stack,
    },
  });

  const status = err?.statusCode || 500;

  const payload = {
    status: "error",
    message: err?.message || "Error interno del servidor",
  };

  if (err?.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && err?.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}