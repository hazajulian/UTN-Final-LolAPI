// region-modeldb.js
// Define el modelo de regiones de Runaterra.

import mongoose from "mongoose";

const regionEntrySchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  {
    _id: false,
  }
);

const regionSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    entries: {
      type: [regionEntrySchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const regionSchema = new mongoose.Schema(
  {
    regionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    locale: {
      type: String,
      required: true,
      enum: ["en_US", "es_MX"],
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    bannerUrl: {
      type: String,
      required: true,
    },

    iconUrl: {
      type: String,
      required: true,
    },

    crestUrl: {
      type: String,
      required: true,
    },

    champions: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      required: true,
    },

    summary: {
      type: String,
      required: true,
    },

    culture: {
      type: String,
      default: "",
    },

    sections: {
      type: [regionSectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

regionSchema.index(
  {
    regionId: 1,
    locale: 1,
  },
  {
    unique: true,
  }
);

export const Region = mongoose.model("Region", regionSchema);