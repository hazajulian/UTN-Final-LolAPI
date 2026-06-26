// contact.schema.js
// Validaciones Zod para el formulario de contacto.

import { z } from "zod";

export const contactSchema = z.object({
  subject: z
    .string()
    .min(3, {
      message: "El subject debe tener al menos 3 caracteres",
    })
    .max(120),

  message: z
    .string()
    .min(10, {
      message: "El message debe tener al menos 10 caracteres",
    })
    .max(4000),
});