import mongoose from "mongoose";

const subSchemaOpts = { _id: false, id: false };

const RuneSchema = new mongoose.Schema(
  {
    runeId: { type: Number, required: true },
    key: { type: String, default: "" },
    icon: { type: String, default: "" },
    iconUrl: { type: String, default: "" },
    name: { type: String, required: true },
    shortDesc: { type: String, default: "" },
    longDesc: { type: String, default: "" },
  },
  subSchemaOpts
);

const RuneSlotSchema = new mongoose.Schema(
  {
    slotIndex: { type: Number, required: true },
    runes: { type: [RuneSchema], default: [] },
  },
  subSchemaOpts
);

const RuneTreeSchema = new mongoose.Schema(
  {
    treeId: { type: Number, required: true },
    key: { type: String, required: true },
    locale: { type: String, required: true, enum: ["en_US", "es_MX"] },

    name: { type: String, required: true },
    icon: { type: String, default: "" },
    iconUrl: { type: String, default: "" },

    slots: { type: [RuneSlotSchema], default: [] },

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

RuneTreeSchema.index({ locale: 1, treeId: 1 }, { unique: true });
RuneTreeSchema.index({ locale: 1, key: 1 });
RuneTreeSchema.index({ locale: 1, name: 1 });

export const RuneTree = mongoose.model("RuneTree", RuneTreeSchema);