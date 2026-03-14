import { z } from "zod";

const sortEnum = z.enum(["name", "gold_asc", "gold_desc"]).default("name");

const tierEnum = z.enum(["basic", "epic", "legendary"]);

// Secciones/categorías que querés en UI (API-friendly)
const sectionEnum = z.enum([
  "starter",
  "consumable",
  "trinket",
  "distributed",
  "boots",
  "basic",
  "epic",
  "legendary",
  "champion_exclusive",
  "minion_turret",
  "arena_prismatic",
  "arena_anvil",
  "arena_exclusive",
]);

export const itemsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  lang: z.enum(["es", "en"]).optional().default("en"),

  search: z.string().trim().min(1).optional(),

  tags: z.string().optional(), // csv
  roles: z.string().optional(), // csv "mage,tank"

  tier: tierEnum.optional(),
  section: sectionEnum.optional(),

  minGold: z.coerce.number().min(0).optional(),
  maxGold: z.coerce.number().min(0).optional(),

  sort: sortEnum.optional().default("name"),

  includeHidden: z.coerce.boolean().optional().default(false),

  // por defecto TRUE: limpia variantes 22xxxx + visibles
  shopOnly: z.coerce.boolean().optional().default(true),

  // por defecto TRUE => sin duplicados por name
  dedupe: z.coerce.boolean().optional().default(true),
});

export const itemsAllQuerySchema = z.object({
  lang: z.enum(["es", "en"]).optional().default("en"),
  includeHidden: z.coerce.boolean().optional().default(false),
  shopOnly: z.coerce.boolean().optional().default(true),

  dedupe: z.coerce.boolean().optional().default(true),
});
