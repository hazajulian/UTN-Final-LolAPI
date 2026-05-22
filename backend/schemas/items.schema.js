import { z } from "zod";

const sortEnum = z.enum(["name", "gold_asc", "gold_desc"]).default("name");

const tierEnum = z.enum(["basic", "epic", "legendary"]);

const groupEnum = z.enum(["all", "main", "arena", "special", "hidden"]);

const sectionEnum = z.enum([
  "starter",
  "consumable",
  "trinket",
  "distributed",
  "boots",
  "item",
  "champion_exclusive",
  "arena_prismatic",
  "arena_anvil",
  "arena_exclusive",
  "removed",
]);

export const itemsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),

  lang: z.enum(["es", "en"]).optional().default("en"),

  search: z.string().trim().min(1).optional(),

  tags: z.string().optional(),
  roles: z.string().optional(),

  group: groupEnum.optional().default("all"),
  section: sectionEnum.optional(),
  tier: tierEnum.optional(),

  minGold: z.coerce.number().min(0).optional(),
  maxGold: z.coerce.number().min(0).optional(),

  sort: sortEnum.optional().default("name"),

  includeHidden: z.coerce.boolean().optional().default(false),
});

export const itemsAllQuerySchema = z.object({
  lang: z.enum(["es", "en"]).optional().default("en"),

  group: groupEnum.optional().default("all"),
  section: sectionEnum.optional(),
  tier: tierEnum.optional(),

  includeHidden: z.coerce.boolean().optional().default(false),
});