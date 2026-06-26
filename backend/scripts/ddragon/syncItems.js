// syncItems.js
// Sincroniza items desde Data Dragon y el catalogo curado del proyecto.

import mongoose from "mongoose";
import axios from "axios";
import "dotenv/config";

import { Item } from "../../models/mongodb/item-modeldb.js";
import { ITEM_CATALOG } from "./item-catalog.js";
import { MANUAL_ITEMS } from "./manual-items.js";

const DDRAGON_VERSION = "15.10.1";
const LOCALES = ["en_US", "es_MX"];

function cleanHtml(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildIconUrl(imageFull = "") {
  if (!imageFull) return "";
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${imageFull}`;
}

function hasMap(raw, mapId) {
  return raw?.maps?.[String(mapId)] === true;
}

function getGoldBase(raw) {
  return Number(raw?.gold?.base || 0);
}

function getGoldTotal(raw) {
  return Number(raw?.gold?.total || 0);
}

function getGoldSell(raw) {
  return Number(raw?.gold?.sell || 0);
}

function isPurchasable(raw) {
  return raw?.gold?.purchasable !== false;
}

function isVariantItem(itemId) {
  return /^22\d+/.test(String(itemId));
}

function normalizeRoleTag(tag = "") {
  return String(tag)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectRoles(tags = []) {
  const roles = new Set();
  const lower = tags.map(normalizeRoleTag);

  if (lower.includes("spelldamage") || lower.includes("abilitypower") || lower.includes("mana")) {
    roles.add("mage");
  }

  if (lower.includes("armor") || lower.includes("spellblock") || lower.includes("health")) {
    roles.add("tank");
  }

  if (lower.includes("criticalstrike") || lower.includes("attackspeed")) {
    roles.add("marksman");
  }

  if (lower.includes("damage") || lower.includes("lifesteal")) {
    roles.add("fighter");
  }

  if (lower.includes("armorpenetration")) {
    roles.add("assassin");
  }

  if (lower.includes("manaregen") || lower.includes("aura") || lower.includes("nonbootsmovement")) {
    roles.add("support");
  }

  return [...roles];
}

async function fetchDDragonItems(locale) {
  const url = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/${locale}/item.json`;
  const { data } = await axios.get(url);
  return data?.data || {};
}

function getManualItem(itemId, locale) {
  return MANUAL_ITEMS.find(
    (item) => String(item.itemId) === String(itemId) && item.locale === locale
  );
}

function getVisibleName(raw, catalogName) {
  return cleanHtml(raw?.name || catalogName) || catalogName;
}

function buildDDragonDoc({ catalogItem, raw, locale }) {
  const itemId = String(catalogItem.itemId);

  return {
    itemId,
    locale,

    catalogName: catalogItem.catalogName,
    catalogSection: catalogItem.section,
    catalogStatus: "approved",
    catalogOrder: catalogItem.catalogOrder,

    name: getVisibleName(raw, catalogItem.catalogName),
    plaintext: raw?.plaintext || "",

    descriptionRaw: raw?.description || "",
    descriptionText: cleanHtml(raw?.description || ""),

    gold: {
      base: getGoldBase(raw),
      total: getGoldTotal(raw),
      sell: getGoldSell(raw),
      purchasable: isPurchasable(raw),
    },

    tags: raw?.tags || [],
    from: raw?.from || [],
    into: raw?.into || [],
    maps: raw?.maps || {},

    imageFull: raw?.image?.full || "",
    iconUrl: buildIconUrl(raw?.image?.full || ""),

    inStore: raw?.inStore !== false,
    hideFromAll: raw?.hideFromAll === true,

    requiredChampion: raw?.requiredChampion || "",
    requiredAlly: raw?.requiredAlly || "",

    ddragonVersion: DDRAGON_VERSION,

    shopGroup: catalogItem.group,
    shopSection: catalogItem.section,
    tier: catalogItem.tier || "",

    roleGroups: detectRoles(raw?.tags || []),

    isSummonersRift: hasMap(raw, 11),
    isArena: catalogItem.group === "arena",

    isVariant: isVariantItem(itemId),
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",

    isVisible: true,
  };
}

function buildManualDoc({ catalogItem, manualItem, locale }) {
  const itemId = String(catalogItem.itemId);
  const tags = manualItem.tags || [];

  return {
    itemId,
    locale,

    catalogName: catalogItem.catalogName,
    catalogSection: catalogItem.section,
    catalogStatus: "manual",
    catalogOrder: catalogItem.catalogOrder,

    name: manualItem.name || catalogItem.catalogName,
    plaintext: manualItem.plaintext || "",

    descriptionRaw: manualItem.descriptionRaw || "",
    descriptionText: manualItem.descriptionText || cleanHtml(manualItem.descriptionRaw || ""),

    gold: {
      base: Number(manualItem.gold?.base || 0),
      total: Number(manualItem.gold?.total || 0),
      sell: Number(manualItem.gold?.sell || 0),
      purchasable: manualItem.gold?.purchasable !== false,
    },

    tags,
    from: manualItem.from || [],
    into: manualItem.into || [],
    maps: manualItem.maps || {},

    imageFull: manualItem.imageFull || "",
    iconUrl: manualItem.iconUrl || "",

    inStore: manualItem.inStore !== false,
    hideFromAll: manualItem.hideFromAll === true,

    requiredChampion: manualItem.requiredChampion || "",
    requiredAlly: manualItem.requiredAlly || "",

    ddragonVersion: "manual",

    shopGroup: catalogItem.group,
    shopSection: catalogItem.section,
    tier: catalogItem.tier || "",

    roleGroups: manualItem.roleGroups?.length ? manualItem.roleGroups : detectRoles(tags),

    isSummonersRift: manualItem.isSummonersRift ?? Boolean(manualItem.maps?.[11]),
    isArena: catalogItem.group === "arena",

    isVariant: false,
    isRemoved: false,
    isDuplicate: false,
    duplicateOf: "",

    isVisible: true,
  };
}

function logSectionCounts(locale, docs) {
  const counts = docs.reduce((acc, item) => {
    const key = `${item.shopGroup}/${item.shopSection}${item.tier ? `/${item.tier}` : ""}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(`${locale}: section counts`);
  console.table(
    Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({ key, total }))
  );
}

function logMissing(locale, missing) {
  if (!missing.length) {
    console.log(`${locale}: missing items=0`);
    return;
  }

  console.log(`${locale}: missing items=${missing.length}`);
  console.table(
    missing.map((item) => ({
      itemId: item.itemId,
      catalogName: item.catalogName,
      group: item.group,
      section: item.section,
      tier: item.tier || "",
    }))
  );
}

async function syncLocale(locale, itemsData) {
  console.log(`Syncing locale ${locale}...`);

  const docs = [];
  const missing = [];
  let manualCount = 0;
  let ddragonCount = 0;

  for (const catalogItem of ITEM_CATALOG) {
    const itemId = String(catalogItem.itemId);
    const raw = itemsData[itemId];

    if (raw) {
      docs.push(buildDDragonDoc({ catalogItem, raw, locale }));
      ddragonCount++;
      continue;
    }

    const manualItem = getManualItem(itemId, locale);

    if (manualItem) {
      docs.push(buildManualDoc({ catalogItem, manualItem, locale }));
      manualCount++;
      continue;
    }

    missing.push(catalogItem);
  }

  await Item.deleteMany({ locale });

  if (docs.length) {
    await Item.insertMany(docs, { ordered: false });
  }

  const main = docs.filter((item) => item.shopGroup === "main").length;
  const arena = docs.filter((item) => item.shopGroup === "arena").length;
  const special = docs.filter((item) => item.shopGroup === "special").length;

  console.log(`${locale}: approved visible=${docs.length}`);
  console.log(`${locale}: ddragon=${ddragonCount} manual=${manualCount}`);
  console.log(`${locale}: main=${main} arena=${arena} special=${special}`);

  logSectionCounts(locale, docs);
  logMissing(locale, missing);
}

async function run() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida en el archivo .env");
    }

    console.log("Connecting MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    console.log("Fetching Data Dragon locales...");

    const dataByLocale = {};

    for (const locale of LOCALES) {
      dataByLocale[locale] = await fetchDDragonItems(locale);
    }

    console.log(`Catalog total=${ITEM_CATALOG.length}`);

    for (const locale of LOCALES) {
      await syncLocale(locale, dataByLocale[locale]);
    }

    console.log("Items sync completed");
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
}

run();