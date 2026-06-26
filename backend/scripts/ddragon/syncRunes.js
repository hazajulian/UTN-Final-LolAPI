// syncRunes.js
// Sincroniza arboles de runas desde Riot Data Dragon.
import mongoose from "mongoose";
import "dotenv/config";

import { RuneTree } from "../../models/mongodb/runeTree-modeldb.js";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const LOCALES = ["en_US", "es_MX"];

function cleanText(input = "") {
  return String(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${url}`);
  }

  return res.json();
}

async function getLatestVersion() {
  const versions = await fetchJson(`${DDRAGON}/api/versions.json`);
  return versions[0];
}

function buildAssetUrl(icon = "") {
  if (!icon) return "";
  return `${DDRAGON}/cdn/img/${icon}`;
}

function buildRuneDoc(tree, locale, version) {
  return {
    treeId: tree.id,
    key: tree.key,
    locale,

    name: tree.name || "",
    icon: tree.icon || "",
    iconUrl: buildAssetUrl(tree.icon || ""),

    slots: (tree.slots || []).map((slot, slotIndex) => ({
      slotIndex,
      runes: (slot.runes || []).map((rune) => ({
        runeId: rune.id,
        key: rune.key || "",
        icon: rune.icon || "",
        iconUrl: buildAssetUrl(rune.icon || ""),
        name: rune.name || "",
        shortDesc: cleanText(rune.shortDesc || ""),
        longDesc: cleanText(rune.longDesc || ""),
      })),
    })),

    ddragonVersion: version,
  };
}

async function syncLocale(version, locale) {
  const url = `${DDRAGON}/cdn/${version}/data/${locale}/runesReforged.json`;
  const trees = await fetchJson(url);

  const docs = trees.map((tree) => buildRuneDoc(tree, locale, version));

  await RuneTree.deleteMany({ locale });

  if (docs.length) {
    await RuneTree.insertMany(docs);
  }

  console.log(`${locale}: inserted ${docs.length} rune trees`);
}

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const version = await getLatestVersion();
    console.log(`Using Data Dragon version: ${version}`);

    for (const locale of LOCALES) {
      await syncLocale(version, locale);
    }

    console.log("Runes sync completed");
    process.exit(0);
  } catch (err) {
    console.error("Runes sync failed:", err);
    process.exit(1);
  }
}

run();