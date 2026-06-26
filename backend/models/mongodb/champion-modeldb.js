// champion-modeldb.js
// Define el modelo principal de campeones oficiales y personalizados.

import mongoose from "mongoose";

// Metodos estaticos para operaciones comunes.
class ChampionClass {
  static getForFilter(filter = {}) {
    return this.find(filter).sort({ name: 1 });
  }

  static getForId(id) {
    return this.findOne({ id });
  }

  static createChampion(data) {
    return this.create(data);
  }

  static replaceChampion(id, data) {
    return this.findOneAndReplace({ id }, data, { new: true });
  }

  static updateChampion(id, data) {
    return this.findOneAndUpdate({ id }, data, { new: true });
  }

  static deleteChampion(id) {
    return this.findOneAndDelete({ id });
  }
}

const subSchemaOpts = {
  _id: false,
  id: false,
};

const SkinSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    splashUrl: { type: String, required: true },
    loadingUrl: { type: String, required: true },

    imageUrl: { type: String, default: "" },
  },
  subSchemaOpts
);

const SpellSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    iconUrl: { type: String, default: "" },
  },
  subSchemaOpts
);

const ChampionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },

    seed: { type: Boolean, default: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.seed === false;
      },
    },

    name: { type: String, required: true },
    title: { type: String, default: "" },

    region: { type: String, default: "" },

    roles: {
      type: [String],
      default: [],
    },

    positions: {
      type: [String],
      enum: ["Top", "Jungle", "Mid", "ADC", "Support"],
      default: [],
    },

    skins: {
      type: [SkinSchema],
      default: [],
    },

    iconUrl: { type: String, default: "" },
    splashUrl: { type: String, default: "" },

    lore: { type: String, default: "" },

    allytips: {
      type: [String],
      default: [],
    },

    enemytips: {
      type: [String],
      default: [],
    },

    info: {
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      magic: { type: Number, default: 0 },
      difficulty: { type: Number, default: 0 },
    },

    stats: {
      hp: { type: Number, default: 0 },
      hpperlevel: { type: Number, default: 0 },

      mp: { type: Number, default: 0 },
      mpperlevel: { type: Number, default: 0 },

      movespeed: { type: Number, default: 0 },

      armor: { type: Number, default: 0 },
      armorperlevel: { type: Number, default: 0 },

      spellblock: { type: Number, default: 0 },
      spellblockperlevel: { type: Number, default: 0 },

      attackrange: { type: Number, default: 0 },

      hpregen: { type: Number, default: 0 },
      hpregenperlevel: { type: Number, default: 0 },

      mpregen: { type: Number, default: 0 },
      mpregenperlevel: { type: Number, default: 0 },

      crit: { type: Number, default: 0 },
      critperlevel: { type: Number, default: 0 },

      attackdamage: { type: Number, default: 0 },
      attackdamageperlevel: { type: Number, default: 0 },

      attackspeedperlevel: { type: Number, default: 0 },
      attackspeed: { type: Number, default: 0 },
    },

    abilities: {
      passive: {
        name: { type: String, default: "" },
        description: { type: String, default: "" },
        iconUrl: { type: String, default: "" },
      },

      spells: {
        type: [SpellSchema],
        default: [],
      },
    },

    i18n: {
      en: {
        type: Object,
        default: {},
      },

      es: {
        type: Object,
        default: {},
      },
    },

    ddragonVersion: {
      type: String,
      default: "",
    },
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

        ret.skins?.forEach((skin) => delete skin._id);
        ret.abilities?.spells?.forEach((spell) => delete spell._id);

        const {
          id,
          seed,
          owner,
          name,
          title,
          region,
          roles,
          positions,
          skins,
          iconUrl,
          splashUrl,
          lore,
          allytips,
          enemytips,
          info,
          stats,
          abilities,
          i18n,
          ddragonVersion,
          ...rest
        } = ret;

        return {
          id,
          seed,
          owner,
          name,
          title,
          region,
          roles,
          positions,
          skins,
          iconUrl,
          splashUrl,
          lore,
          allytips,
          enemytips,
          info,
          stats,
          abilities,
          i18n,
          ddragonVersion,
          ...rest,
        };
      },
    },
  }
);

ChampionSchema.loadClass(ChampionClass);

export const Champion = mongoose.model("Champion", ChampionSchema);