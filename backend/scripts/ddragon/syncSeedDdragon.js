import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { Champion } from "../../models/mongodb/champion-modeldb.js";
import { info, warn, error } from "../../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DDRAGON = "https://ddragon.leagueoflegends.com";

/* ============================================================
   Sanitizado mínimo para texto Data Dragon
   - Convierte <br> -> saltos de línea
   - Elimina tags como <font>, <i>, <span>, etc.
   - Normaliza entidades comunes
   ============================================================ */
function cleanDdragonText(input = "") {
  return String(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "") // remove all tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/* ===========================
   Fetch con retry (evita "fetch failed")
   =========================== */
async function fetchText(url, { retries = 3, timeoutMs = 20000 } = {}) {
  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);

      if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
      return res.text();
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }

  throw lastErr;
}

async function fetchJson(url, opts) {
  const raw = await fetchText(url, opts);
  return JSON.parse(raw);
}

async function getLatestVersion() {
  const versions = await fetchJson(`${DDRAGON}/api/versions.json`);
  return versions[0];
}

// URLs oficiales Data Dragon
function buildUrls(version, champId, fullImageName, passiveImage, spellImage, skinNum) {
  return {
    iconUrl: `${DDRAGON}/cdn/${version}/img/champion/${fullImageName}`,

    splashUrl: `${DDRAGON}/cdn/img/champion/splash/${champId}_0.jpg`,
    loadingUrl: `${DDRAGON}/cdn/img/champion/loading/${champId}_0.jpg`,

    passiveIconUrl: `${DDRAGON}/cdn/${version}/img/passive/${passiveImage}`,
    spellIconUrl: `${DDRAGON}/cdn/${version}/img/spell/${spellImage}`,

    skinSplashUrl: `${DDRAGON}/cdn/img/champion/splash/${champId}_${skinNum}.jpg`,
    skinLoadingUrl: `${DDRAGON}/cdn/img/champion/loading/${champId}_${skinNum}.jpg`,
  };
}

async function readMapping() {
  const mappingPath = path.join(__dirname, "regions-and-positions.json");
  const raw = await fs.readFile(mappingPath, "utf-8");
  return JSON.parse(raw);
}

function pickLocaleFields(fullData) {
  return {
    name: fullData.name,
    title: fullData.title,
    lore: fullData.lore,
    allytips: fullData.allytips || [],
    enemytips: fullData.enemytips || [],
    skins: (fullData.skins || []).map((s) => s.name),
    abilities: {
      passive: {
        name: fullData.passive?.name || "",
        // limpiar HTML/tagueado
        description: cleanDdragonText(fullData.passive?.description || ""),
      },
      spells: (fullData.spells || []).map((sp) => ({
        key: sp.key,
        name: sp.name,
        // limpiar HTML/tagueado
        description: cleanDdragonText(sp.description || ""),
      })),
    },
  };
}

/* ============================================================
   ->Fiddlesticks wiki remaster (solo para skins necesarias)
   - MUY IMPORTANTE: Praetorian (skin 9) NO se overridea => DDragon
   - Links #/media => se convierten a Special:FilePath (estable)
   ============================================================ */

const FIDDLE_WIKI_BY_KEY = {
  original: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_OriginalSkin.jpg?71abb",
  spectral: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_SpectralSkin.jpg?93bec",
  unionjack: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_UnionJackSkin.jpg?d288a",
  bandito: "https://wiki.leagueoflegends.com/en-us/Special:FilePath/Fiddlesticks_BanditoSkin.jpg",
  pumpkinhead: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_PumpkinheadSkin.jpg?75ec3",
  timbers: "https://wiki.leagueoflegends.com/en-us/Special:FilePath/Fiddlesticks_FiddleMeTimbersSkin.jpg",
  surpriseparty: "https://wiki.leagueoflegends.com/en-us/Special:FilePath/Fiddlesticks_SurprisePartySkin.jpg",
  darkcandy: "https://wiki.leagueoflegends.com/en-us/Special:FilePath/Fiddlesticks_DarkCandySkin.jpg",
  starnemesis: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_StarNemesisSkin.jpg?7da38",
  bloodmoon: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_BloodMoonSkin.jpg?5a397",
  florafatalis: "https://wiki.leagueoflegends.com/en-us/images/Fiddlesticks_FloraFatalisSkin.jpg?b4055",
};

function normalizeSkinName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Devuelve la "key" del wiki según el nombre.
 * Si devuelve null => NO override (queda DDragon).
 */
function getFiddleWikiKey(skinName, skinNum) {
  const n = normalizeSkinName(skinName);

  // Default
  if (Number(skinNum) === 0 || n === "original" || n.includes("original")) return "original";

  // Praetorian = la 9
  if (n.includes("praetorian")) return null;

  if (n.includes("spectral")) return "spectral";
  if (n.includes("union jack")) return "unionjack";
  if (n.includes("bandito")) return "bandito";
  if (n.includes("pumpkinhead")) return "pumpkinhead";

  if (n.includes("fiddle me timbers") || (n.includes("timbers") && n.includes("fiddle"))) return "timbers";
  if (n.includes("surprise party")) return "surpriseparty";
  if (n.includes("dark candy")) return "darkcandy";

  if (n.includes("star nemesis")) return "starnemesis";
  if (n.includes("blood moon")) return "bloodmoon";
  if (n.includes("flora fatalis")) return "florafatalis";

  return null;
}

/* ===========================
   Concurrencia limitada
   =========================== */
async function runWithConcurrency(items, worker, concurrency = 6) {
  let index = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      await worker(items[currentIndex], currentIndex);
    }
  });
  await Promise.all(runners);
}

async function sync() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    info("Connected to MongoDB (syncSeedDdragon)");

    const version = await getLatestVersion();
    info(`Using Data Dragon version: ${version}`);

    const mapping = await readMapping();

    const onlyArg = process.argv.find((a) => a.startsWith("--only="));
    const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

    const list = await fetchJson(`${DDRAGON}/cdn/${version}/data/en_US/champion.json`);
    let champs = Object.values(list.data);

    if (ONLY) {
      champs = champs.filter((c) => c.id === ONLY);
      info(`Running ONLY for champion: ${ONLY} (${champs.length})`);
      if (!champs.length) {
        warn(`Champion not found in list: ${ONLY}`);
        process.exit(0);
      }
    } else {
      info(`Found ${champs.length} champions`);
    }

    const worker = async (champ) => {
      const champId = champ.id;

      const enDetail = await fetchJson(`${DDRAGON}/cdn/${version}/data/en_US/champion/${champId}.json`);
      const enFull = enDetail.data[champId];

      const esDetail = await fetchJson(`${DDRAGON}/cdn/${version}/data/es_ES/champion/${champId}.json`);
      const esFull = esDetail.data[champId];

      const urlsBase = buildUrls(
        version,
        champId,
        enFull.image.full,
        enFull.passive?.image?.full || "",
        "",
        0
      );

      const skins = [];
      for (const s of enFull.skins || []) {
        const urls = buildUrls(version, champId, enFull.image.full, "", "", s.num);

        // por defecto: DDragon
        let splashUrl = urls.skinSplashUrl;   // horizontal
        let loadingUrl = urls.skinLoadingUrl; // vertical

        // override SOLO para Fiddlesticks, y SOLO en splashUrl (remaster)
        // pero Praetorian queda DDragon sí o sí (key=null)
        if (champId === "Fiddlesticks") {
          const key = getFiddleWikiKey(s.name, s.num);
          const wiki = key ? FIDDLE_WIKI_BY_KEY[key] : null;

          if (wiki) {
            splashUrl = wiki;      // desktop horizontal remaster
            // loadingUrl queda DDragon vertical (mobile real)
          }
        }

        // Compatibilidad front actual: imageUrl SIEMPRE = splashUrl (horizontal grande)
        skins.push({
          name: s.name,
          splashUrl,
          loadingUrl,
          imageUrl: splashUrl,
        });
      }

      const passive = {
        name: enFull.passive?.name || "",
        // limpiar HTML/tagueado
        description: cleanDdragonText(enFull.passive?.description || ""),
        iconUrl: urlsBase.passiveIconUrl,
      };

      const spells = (enFull.spells || []).map((sp) => ({
        key: sp.key,
        name: sp.name,
        // limpiar HTML/tagueado
        description: cleanDdragonText(sp.description || ""),
        iconUrl: buildUrls(version, champId, enFull.image.full, "", sp.image?.full || "", 0).spellIconUrl,
      }));

      const mapped = mapping[champId] || {};
      const region = mapped.region || "";
      const positions = mapped.positions || [];

      const doc = {
        id: champId,
        seed: true,

        name: enFull.name,
        title: enFull.title,
        roles: enFull.tags || [],
        region,
        positions,

        iconUrl: urlsBase.iconUrl,

        // Splash horizontal real para el campeón (como pediste)
        splashUrl: urlsBase.splashUrl,

        skins,

        lore: enFull.lore || "",
        allytips: enFull.allytips || [],
        enemytips: enFull.enemytips || [],
        info: enFull.info || {},
        stats: enFull.stats || {},
        abilities: { passive, spells },

        i18n: {
          en: pickLocaleFields(enFull),
          es: pickLocaleFields(esFull),
        },

        ddragonVersion: version,
      };

      await Champion.updateOne(
        { id: champId },
        { $set: doc, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      info(`Upserted ${champId} (skins=${skins.length})`);
    };

    await runWithConcurrency(champs, worker, 6);

    info("syncSeedDdragon finished OK");
    process.exit(0);
  } catch (err) {
    error("syncSeedDdragon failed", {
      message: err?.message || String(err),
      stack: err?.stack || "",
    });
    process.exit(1);
  }
}

sync();
