// Modelo de Item basado en Riot Data Dragon + catálogo propio.
// Data Dragon aporta datos crudos; nuestro catálogo decide qué items se muestran,
// cómo se agrupan y en qué orden aparecen en la API.

import mongoose from "mongoose";

const subSchemaOpts = { _id: false, id: false };

// Subdocumento para la información de oro del item.
const GoldSchema = new mongoose.Schema(
  {
    base: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    sell: { type: Number, default: 0 },
    purchasable: { type: Boolean, default: true },
  },
  subSchemaOpts
);

const ItemSchema = new mongoose.Schema(
  {
    // Identificación principal del item en Data Dragon.
    itemId: { type: String, required: true },
    locale: { type: String, required: true, enum: ["en_US", "es_MX"] },

    // Datos propios del catálogo curado.
    catalogName: { type: String, default: "" },
    catalogSection: { type: String, default: "" },
    catalogStatus: {
      type: String,
      enum: ["approved", "missing", "blocked", "manual"],
      default: "approved",
    },
    catalogOrder: { type: Number, default: 0 },

    // Información visible del item.
    name: { type: String, required: true },
    plaintext: { type: String, default: "" },

    // Descripciones: raw conserva HTML de Riot; text guarda versión limpia.
    descriptionRaw: { type: String, default: "" },
    descriptionText: { type: String, default: "" },

    // Datos económicos y etiquetas originales de Riot.
    gold: { type: GoldSchema, default: () => ({}) },
    tags: { type: [String], default: [] },

    // Relaciones de receta del item.
    from: { type: [String], default: [] },
    into: { type: [String], default: [] },

    // Mapas donde Riot marca disponibilidad del item.
    maps: { type: Object, default: {} },

    // Imagen original de Data Dragon.
    imageFull: { type: String, default: "" },
    iconUrl: { type: String, default: "" },

    // Flags originales o derivados de Data Dragon.
    inStore: { type: Boolean, default: true },
    hideFromAll: { type: Boolean, default: false },
    requiredChampion: { type: String, default: "" },
    requiredAlly: { type: String, default: "" },

    // Versión de Data Dragon usada al cargar el item.
    ddragonVersion: { type: String, default: "" },

    // Grupo principal usado por la API y el frontend.
    shopGroup: {
      type: String,
      enum: ["main", "arena", "special", "hidden"],
      default: "main",
    },

    // Sección curada del item.
    // basic / epic / legendary NO van acá: van en tier.
    shopSection: {
      type: String,
      enum: [
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
        "",
      ],
      default: "",
    },

    // Tier solo para items normales de tienda principal.
    tier: {
      type: String,
      enum: ["basic", "epic", "legendary", ""],
      default: "",
    },

    // Roles derivados para filtros del frontend.
    roleGroups: {
      type: [String],
      default: [],
    },

    // Flags útiles para filtros internos y debug.
    isSummonersRift: { type: Boolean, default: true },
    isArena: { type: Boolean, default: false },
    isVariant: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: String, default: "" },

    // Flag final: si es false, el frontend no debería mostrarlo.
    isVisible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;

        return ret;
      },
    },
  }
);

// Índice único por item y lenguaje.
ItemSchema.index({ locale: 1, itemId: 1 }, { unique: true });

// Índices de búsqueda y orden.
ItemSchema.index({ locale: 1, name: 1 });
ItemSchema.index({ locale: 1, catalogName: 1 });
ItemSchema.index({ locale: 1, catalogOrder: 1 });
ItemSchema.index({ locale: 1, "gold.total": 1 });
ItemSchema.index({ locale: 1, tags: 1 });

// Índices para filtros principales de la API.
ItemSchema.index({ locale: 1, shopGroup: 1 });
ItemSchema.index({ locale: 1, shopSection: 1 });
ItemSchema.index({ locale: 1, tier: 1 });
ItemSchema.index({ locale: 1, roleGroups: 1 });

// Índices para visibilidad y diagnóstico.
ItemSchema.index({ locale: 1, isVisible: 1 });
ItemSchema.index({ locale: 1, isSummonersRift: 1 });
ItemSchema.index({ locale: 1, isArena: 1 });
ItemSchema.index({ locale: 1, isRemoved: 1 });
ItemSchema.index({ locale: 1, isDuplicate: 1 });
ItemSchema.index({ locale: 1, duplicateOf: 1 });
ItemSchema.index({ locale: 1, catalogStatus: 1 });

export const Item = mongoose.model("Item", ItemSchema);