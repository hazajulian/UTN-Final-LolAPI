// validateZod.js
// Valida peticiones utilizando esquemas Zod.

import { ZodError } from "zod";

export const validateZod = (schema, property = "body") => (req, res, next) => {
  try {
    const parsed = schema.parse(req[property]);

    if (property === "query") {
      Object.assign(req.query, parsed);
    } else {
      req[property] = parsed;
    }

    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Error de validación",
        details: err.issues.map((issue) => issue.message),
      });
    }

    return next(err);
  }
};