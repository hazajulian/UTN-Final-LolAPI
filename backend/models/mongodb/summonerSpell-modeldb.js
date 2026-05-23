import mongoose from "mongoose";

const SummonerSpellSchema = new mongoose.Schema(
  {
    spellId: { type: String, required: true },
    key: { type: String, required: true },
    locale: { type: String, required: true, enum: ["en_US", "es_MX"] },

    name: { type: String, required: true },
    description: { type: String, default: "" },
    tooltip: { type: String, default: "" },

    maxrank: { type: Number, default: 1 },
    cooldown: { type: [Number], default: [] },
    cooldownBurn: { type: String, default: "" },

    modes: { type: [String], default: [] },

    imageFull: { type: String, default: "" },
    iconUrl: { type: String, default: "" },

    ddragonVersion: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

SummonerSpellSchema.index({ locale: 1, spellId: 1 }, { unique: true });
SummonerSpellSchema.index({ locale: 1, name: 1 });

export const SummonerSpell = mongoose.model("SummonerSpell", SummonerSpellSchema);