import { z } from "zod";

export const itemsFiltersMetaQuerySchema = z.object({
  lang: z.enum(["en", "es"]).optional().default("en"),
  includeHidden: z.coerce.boolean().optional().default(false),
  shopOnly: z.coerce.boolean().optional().default(true),
});
