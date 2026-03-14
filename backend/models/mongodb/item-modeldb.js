// Modelo de Item (Tienda) basado en Data Dragon
import mongoose from "mongoose";

const subSchemaOpts = { _id: false, id: false };

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
    itemId: { type: String, required: true }, // id de ddragon (key string)
    locale: { type: String, required: true, enum: ["en_US", "es_ES"] },

    name: { type: String, required: true },
    plaintext: { type: String, default: "" },

    descriptionRaw: { type: String, default: "" },
    descriptionText: { type: String, default: "" },

    gold: { type: GoldSchema, default: () => ({}) },
    tags: { type: [String], default: [] },

    from: { type: [String], default: [] },
    into: { type: [String], default: [] },

    maps: { type: Object, default: {} },

    imageFull: { type: String, default: "" },
    iconUrl: { type: String, default: "" },

    inStore: { type: Boolean, default: true },
    hideFromAll: { type: Boolean, default: false },
    requiredChampion: { type: String, default: "" },
    requiredAlly: { type: String, default: "" },

    ddragonVersion: { type: String, default: "" },

    // DERIVADOS (para filtros UI)
    isVariant: { type: Boolean, default: false }, // itemId "22xxxx"
    tier: {
      type: String,
      enum: ["basic", "epic", "legendary", ""],
      default: "",
    },
    shopSection: {
      type: String,
      enum: ["starter", "consumable", "trinket", "boots", "basic", "epic", "legendary", ""],
      default: "",
    },
    roleGroups: {
      type: [String],
      default: [],
    },

    // ✅ NUEVO: filtro por SR (map 11)
    isSummonersRift: { type: Boolean, default: true },

    // ✅ NUEVO: dedupe por nombre
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: String, default: "" },
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

        const {
          itemId,
          locale,
          name,
          plaintext,
          descriptionRaw,
          descriptionText,
          gold,
          tags,
          from,
          into,
          maps,
          imageFull,
          iconUrl,
          inStore,
          hideFromAll,
          requiredChampion,
          requiredAlly,
          ddragonVersion,
          isVariant,
          tier,
          shopSection,
          roleGroups,
          isSummonersRift,
          isDuplicate,
          duplicateOf,
          ...rest
        } = ret;

        return {
          itemId,
          locale,
          name,
          plaintext,
          descriptionRaw,
          descriptionText,
          gold,
          tags,
          from,
          into,
          maps,
          imageFull,
          iconUrl,
          inStore,
          hideFromAll,
          requiredChampion,
          requiredAlly,
          ddragonVersion,
          isVariant,
          tier,
          shopSection,
          roleGroups,
          isSummonersRift,
          isDuplicate,
          duplicateOf,
          ...rest,
        };
      },
    },
  }
);

// Índices
ItemSchema.index({ locale: 1, itemId: 1 }, { unique: true });
ItemSchema.index({ locale: 1, name: 1 });
ItemSchema.index({ locale: 1, "gold.total": 1 });
ItemSchema.index({ locale: 1, tags: 1 });

// nuevos
ItemSchema.index({ locale: 1, isVariant: 1 });
ItemSchema.index({ locale: 1, tier: 1 });
ItemSchema.index({ locale: 1, shopSection: 1 });
ItemSchema.index({ locale: 1, roleGroups: 1 });

// ✅ nuevos (SR + dedupe)
ItemSchema.index({ locale: 1, isSummonersRift: 1 });
ItemSchema.index({ locale: 1, isDuplicate: 1 });
ItemSchema.index({ locale: 1, duplicateOf: 1 });

export const Item = mongoose.model("Item", ItemSchema);
