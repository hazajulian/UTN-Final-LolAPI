import mongoose from "mongoose";
import axios from "axios";
import "dotenv/config";

import { Item } from "../../models/mongodb/item-modeldb.js";

const VERSION = "15.10.1";

async function fetchItems(locale) {
  const url =
    `https://ddragon.leagueoflegends.com/cdn/${VERSION}/data/${locale}/item.json`;

  const { data } = await axios.get(url);

  return data.data;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo connected");

    const locales = ["en_US", "es_ES"];

    for (const locale of locales) {
      console.log(`Loading ${locale}...`);

      const items = await fetchItems(locale);

      const docs = [];

      for (const [itemId, raw] of Object.entries(items)) {
        docs.push({
          itemId,
          locale,

          name: raw.name || "",

          plaintext: raw.plaintext || "",

          descriptionRaw: raw.description || "",
          descriptionText: raw.description || "",

          gold: {
            base: raw.gold?.base || 0,
            total: raw.gold?.total || 0,
            sell: raw.gold?.sell || 0,
            purchasable: raw.gold?.purchasable ?? true,
          },

          tags: raw.tags || [],

          from: raw.from || [],
          into: raw.into || [],

          maps: raw.maps || {},

          imageFull: raw.image?.full || "",

          iconUrl:
            `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/${raw.image?.full}`,

          ddragonVersion: VERSION,

          shopGroup: "hidden",
          shopSection: "",
          tier: "",

          roleGroups: [],

          isVisible: true,
        });
      }

      await Item.deleteMany({
        locale,
      });

      await Item.insertMany(docs);

      console.log(
        `${locale}: inserted ${docs.length} items`
      );
    }

    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();