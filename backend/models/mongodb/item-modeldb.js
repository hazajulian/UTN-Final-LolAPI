// item-modeldb.js
// Define el modelo de items basado en Data Dragon y catalogo curado.

import mongoose from "mongoose";

const subSchemaOpts = {
  _id: false,
  id: false,
};

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
    itemId: { type: String, required: true },
    locale: { type: String, required: true, enum: ["en_US", "es_MX"] },

    catalogName: { type: String, default: "" },
    catalogSection: { type: String, default: "" },
    catalogStatus: {
      type: String,
      enum: ["approved", "missing", "blocked", "manual"],
      default: "approved",
    },
    catalogOrder: { type: Number, default: 0 },

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

    shopGroup: {
      type: String,
      enum: ["main", "arena", "special", "hidden"],
      default: "main",
    },

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

    tier: {
      type: String,
      enum: ["basic", "epic", "legendary", ""],
      default: "",
    },

    roleGroups: {
      type: [String],
      default: [],
    },

    isSummonersRift: { type: Boolean, default: true },
    isArena: { type: Boolean, default: false },
    isVariant: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: String, default: "" },

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

ItemSchema.index({ locale: 1, itemId: 1 }, { unique: true });

ItemSchema.index({ locale: 1, name: 1 });
ItemSchema.index({ locale: 1, catalogName: 1 });
ItemSchema.index({ locale: 1, catalogOrder: 1 });
ItemSchema.index({ locale: 1, "gold.total": 1 });
ItemSchema.index({ locale: 1, tags: 1 });

ItemSchema.index({ locale: 1, shopGroup: 1 });
ItemSchema.index({ locale: 1, shopSection: 1 });
ItemSchema.index({ locale: 1, tier: 1 });
ItemSchema.index({ locale: 1, roleGroups: 1 });

ItemSchema.index({ locale: 1, isVisible: 1 });
ItemSchema.index({ locale: 1, isSummonersRift: 1 });
ItemSchema.index({ locale: 1, isArena: 1 });
ItemSchema.index({ locale: 1, isRemoved: 1 });
ItemSchema.index({ locale: 1, isDuplicate: 1 });
ItemSchema.index({ locale: 1, duplicateOf: 1 });
ItemSchema.index({ locale: 1, catalogStatus: 1 });

export const Item = mongoose.model("Item", ItemSchema);