import { z } from "zod";

export const itemsTagsQuerySchema = z.object({
  lang: z.enum(["en", "es"]).optional().default("en"),
  group: z.enum(["all", "main", "arena", "special", "hidden"]).optional().default("all"),
  includeHidden: z.coerce.boolean().optional().default(false),
});