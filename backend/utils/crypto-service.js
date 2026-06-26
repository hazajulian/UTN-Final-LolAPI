// crypto-service.js
// Gestiona hashing de contraseñas y generación de tokens de sesión.

import crypto from "crypto";

// Genera un hash seguro utilizando scrypt.
export function hashPassword(password) {
  if (!process.env.PASSWORD_SALT) {
    throw new Error("PASSWORD_SALT no configurado");
  }

  return crypto
    .scryptSync(password, process.env.PASSWORD_SALT, 64)
    .toString("hex");
}

// Verifica si una contraseña coincide con su hash.
export function verifyPassword(plain, hash) {
  return hashPassword(plain) === hash;
}

// Genera un token de sesión aleatorio.
export function makeSessionToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}