// Validación de query params para listados públicos.
import { z } from "zod";

export const listQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, { message: "Página mínima es 1" })
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, { message: "Límite mínimo es 1" })
    .max(100, { message: "Límite máximo es 100" })
    .default(20),

  lang: z.enum(["en", "es"]).optional(),

  search: z.string().optional().default(""),

  sort: z
    .enum(["name", "name_desc", "region"])
    .optional()
    .default("name"),

  region: z.string().optional().default(""),

  positions: z.preprocess(
    (val) => {
      if (!val) return [];

      if (Array.isArray(val)) return val;

      return String(val)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    },
    z.array(z.string()).optional().default([])
  ),
});