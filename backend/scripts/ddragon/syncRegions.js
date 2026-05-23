import mongoose from "mongoose";
import dotenv from "dotenv";
import { Region } from "../../models/mongodb/region-modeldb.js";
import { MANUAL_REGIONS } from "./manual-regions.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
}

function validateRegions(regions) {
  const requiredFields = [
    "regionId",
    "locale",
    "name",
    "title",
    "bannerUrl",
    "iconUrl",
    "crestUrl",
    "champions",
    "description",
    "summary",
    "sections",
  ];

  for (const region of regions) {
    for (const field of requiredFields) {
      if (region[field] === undefined) {
        throw new Error(
          `Missing field "${field}" in region "${region.regionId || "unknown"}"`
        );
      }
    }
  }
}

async function syncRegions() {
  try {
    await connectDB();

    validateRegions(MANUAL_REGIONS);

    await Region.deleteMany({});
    await Region.insertMany(MANUAL_REGIONS);

    console.log(`Regions synced: ${MANUAL_REGIONS.length}`);
  } catch (error) {
    console.error("Error syncing regions:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

syncRegions();