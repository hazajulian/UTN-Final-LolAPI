import "dotenv/config";
import mongoose from "mongoose";

import { Item } from "../../models/mongodb/item-modeldb.js";
import { info, warn, error } from "../../utils/logger.js";

const DDRAGON = "https://ddragon.leagueoflegends.com";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  return res.json();
}

async function getLatestVersion() {
  const versions = await fetchJson(`${DDRAGON}/api/versions.json`);
  return versions[0];
}

function iconUrl(version, imageFull) {
  return `${DDRAGON}/cdn/${version}/img/item/${imageFull}`;
}

function unescapeUnicodeHtml(s = "") {
  return String(s)
    .replace(/\\u003c/gi, "<")
    .replace(/\\u003e/gi, ">")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u0027/gi, "'")
    .replace(/\\u0022/gi, '"');
}

function htmlToText(html = "") {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ===========================
   Reglas de negocio (tiers/sections/roles)
   =========================== */

const BASIC_IDS = new Set([
  "1052", "1038", "1026", "1018", "1029", "1042", "1004", "2022",
  "1036", "1058", "1033", "1037", "1006", "1028", "1027",
]);

const EPIC_EXCEPTIONS = new Set(["3866"]); // Runic Compass
const LEGENDARY_EXCEPTIONS = new Set([
  "3877", "3867", "3869", "3870", "3876", "3871", "3041",
]);

function isVariantId(itemId) {
  return String(itemId).startsWith("22"); // 221xxx / 222xxx
}

function computeTier(itemId, goldTotal, inStore, hideFromAll, tags = []) {
  if (!inStore || hideFromAll) return "";
  if (isVariantId(itemId)) return "";

  if (BASIC_IDS.has(String(itemId))) return "basic";
  if (LEGENDARY_EXCEPTIONS.has(String(itemId))) return "legendary";
  if (EPIC_EXCEPTIONS.has(String(itemId))) return "epic";

  if (goldTotal > 1600) return "legendary";
  if (goldTotal >= 800 && goldTotal <= 1600) return "epic";

  return "";
}

function computeShopSection(itemId, goldTotal, inStore, hideFromAll, tags = [], tier = "") {
  if (!inStore || hideFromAll) return "";
  if (isVariantId(itemId)) return "";

  const tset = new Set(tags);

  if (tset.has("Trinket")) return "trinket";
  if (tset.has("Consumable")) return "consumable";
  if (tset.has("Boots")) return "boots";

  if (tier === "basic") return "basic";
  if (tier === "epic") return "epic";
  if (tier === "legendary") return "legendary";

  if (goldTotal > 0 && goldTotal <= 500) return "starter";

  return "";
}

function computeRoleGroups(tags = []) {
  const t = new Set(tags);
  const out = new Set();

  const has = (x) => t.has(x);

  if (has("GoldPer") || has("Vision")) out.add("support");
  if (has("Aura") && (has("Health") || has("Mana") || has("Armor") || has("MagicResist"))) out.add("support");

  if (has("Armor") || has("MagicResist") || has("Health") || has("Tenacity") || has("HealthRegen")) out.add("tank");

  if (has("SpellDamage") || has("Mana") || has("CooldownReduction") || has("MagicPenetration")) out.add("mage");

  if (has("CriticalStrike") || has("AttackSpeed") || (has("OnHit") && has("Damage"))) out.add("marksman");

  if (has("Stealth") || has("ArmorPenetration") || (has("NonbootsMovement") && has("Damage"))) out.add("assassin");

  if (has("Damage") && (has("Health") || has("Lifesteal") || has("SpellVamp"))) out.add("fighter");

  if (out.size === 0 && has("Damage")) out.add("fighter");

  return Array.from(out);
}

// ✅ Summoner's Rift map id = "11"
// Si el json no trae maps, lo consideramos SR por defecto.
// Si trae maps["11"] explícito, lo respetamos.
function isSummonersRift(rawMaps) {
  if (!rawMaps || typeof rawMaps !== "object") return true;
  if (Object.prototype.hasOwnProperty.call(rawMaps, "11")) return Boolean(rawMaps["11"]);
  return true;
}

function normalizeOneItem(itemId, raw, version, locale) {
  const gold = raw?.gold || {};
  const imageFull = raw?.image?.full || "";
  const descRaw = unescapeUnicodeHtml(raw?.description || "");

  const tags = Array.isArray(raw?.tags) ? raw.tags : [];
  const goldTotal = Number(gold?.total || 0);

  const inStore = Boolean(raw?.inStore ?? true);
  const hideFromAll = Boolean(raw?.hideFromAll ?? false);

  const variant = isVariantId(itemId);
  const tier = computeTier(String(itemId), goldTotal, inStore, hideFromAll, tags);
  const shopSection = computeShopSection(String(itemId), goldTotal, inStore, hideFromAll, tags, tier);
  const roleGroups = computeRoleGroups(tags);

  const sr = isSummonersRift(raw?.maps);

  return {
    itemId: String(itemId),
    locale,

    name: raw?.name || "",
    plaintext: raw?.plaintext || "",

    descriptionRaw: descRaw,
    descriptionText: htmlToText(descRaw),

    gold: {
      base: Number(gold?.base || 0),
      total: goldTotal,
      sell: Number(gold?.sell || 0),
      purchasable: Boolean(gold?.purchasable ?? true),
    },

    tags,

    from: Array.isArray(raw?.from) ? raw.from.map(String) : [],
    into: Array.isArray(raw?.into) ? raw.into.map(String) : [],

    maps: raw?.maps || {},

    imageFull,
    iconUrl: imageFull ? iconUrl(version, imageFull) : "",

    inStore,
    hideFromAll,
    requiredChampion: raw?.requiredChampion || "",
    requiredAlly: raw?.requiredAlly || "",

    ddragonVersion: version,

    isVariant: variant,
    tier,
    shopSection,
    roleGroups,

    // ✅ nuevo
    isSummonersRift: sr,

    // ✅ dedupe flags (por defecto)
    isDuplicate: false,
    duplicateOf: "",
  };
}

async function syncLocale(version, locale) {
  const url = `${DDRAGON}/cdn/${version}/data/${locale}/item.json`;
  const json = await fetchJson(url);

  const data = json?.data || {};
  const ids = Object.keys(data);

  info(`Items ${locale}: found=${ids.length}`);

  let created = 0;
  let updated = 0;

  for (const itemId of ids) {
    const raw = data[itemId];
    const doc = normalizeOneItem(itemId, raw, version, locale);

    const result = await Item.updateOne(
      { itemId: doc.itemId, locale: doc.locale },
      { $set: doc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const upserted = result?.upsertedCount || result?.upserted?.length || 0;
    if (upserted) created += 1;
    else updated += 1;
  }

  info(`Items ${locale}: created=${created} updated=${updated}`);
  return { locale, created, updated, total: ids.length };
}

// ✅ Deduplicación: mismo name -> dejamos 1 canonical (SR + más caro)
// y ocultamos el resto con hideFromAll/isDuplicate/duplicateOf
async function dedupeByName(locale) {
  const match = {
    locale,
    inStore: true,
    hideFromAll: false,
    isVariant: false,
    isSummonersRift: true,
  };

  const groups = await Item.aggregate([
    { $match: match },
    { $group: { _id: "$name", ids: { $push: "$itemId" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $project: { _id: 1, ids: 1, count: 1 } },
  ]);

  if (!groups.length) {
    info(`Dedupe ${locale}: no duplicates`);
    return { locale, duplicates: 0, hidden: 0 };
  }

  let hidden = 0;

  for (const g of groups) {
    const name = g._id;

    // Traemos docs y elegimos el mejor:
    // 1) mayor gold.total (más “actual/final” suele ser más caro)
    // 2) desempate: itemId mayor (no ideal pero estable)
    const docs = await Item.find({ locale, name, itemId: { $in: g.ids } })
      .select("itemId gold.total isSummonersRift hideFromAll inStore")
      .lean();

    const sorted = [...docs].sort((a, b) => {
      const ga = Number(a?.gold?.total || 0);
      const gb = Number(b?.gold?.total || 0);
      if (gb !== ga) return gb - ga;
      return String(b.itemId).localeCompare(String(a.itemId));
    });

    const keep = sorted[0];
    if (!keep) continue;

    const keepId = String(keep.itemId);

    const toHide = sorted
      .slice(1)
      .map((d) => String(d.itemId))
      .filter(Boolean);

    if (!toHide.length) continue;

    const result = await Item.updateMany(
      { locale, itemId: { $in: toHide } },
      {
        $set: {
          hideFromAll: true,
          isDuplicate: true,
          duplicateOf: keepId,
        },
      }
    );

    hidden += result?.modifiedCount || 0;

    // aseguramos que el canonical quede limpio
    await Item.updateOne(
      { locale, itemId: keepId },
      { $set: { isDuplicate: false, duplicateOf: "" } }
    );

    warn(`Dedupe ${locale}: "${name}" keep=${keepId} hide=${toHide.length}`);
  }

  info(`Dedupe ${locale}: groups=${groups.length} hidden=${hidden}`);
  return { locale, duplicates: groups.length, hidden };
}

async function sync() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    info("Connected to MongoDB (syncItems)");

    const version = await getLatestVersion();
    info(`Using Data Dragon version: ${version}`);

    const locales = ["en_US", "es_ES"];
    const results = [];

    for (const locale of locales) {
      try {
        results.push(await syncLocale(version, locale));
        // ✅ dedupe post-sync
        results.push(await dedupeByName(locale));
      } catch (e) {
        warn(`Failed syncing locale=${locale}`, { err: e?.message });
        throw e;
      }
    }

    info("syncItems finished OK", { results });
    process.exit(0);
  } catch (err) {
    error("syncItems failed", { err });
    process.exit(1);
  }
}

sync();
