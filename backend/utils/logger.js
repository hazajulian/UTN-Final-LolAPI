// logger.js
// Logger simple con salida JSON, timestamp y niveles de severidad.

const LEVELS = {
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
};

function formatLog(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

// Registra mensajes informativos.
export function info(message, meta) {
  console.log(
    formatLog(
      LEVELS.INFO,
      message,
      meta
    )
  );
}

// Registra advertencias.
export function warn(message, meta) {
  console.warn(
    formatLog(
      LEVELS.WARN,
      message,
      meta
    )
  );
}

// Registra errores.
export function error(message, meta) {
  console.error(
    formatLog(
      LEVELS.ERROR,
      message,
      meta
    )
  );
}