// syncSeedDdragon.js
// Sincroniza campeones oficiales desde Riot Data Dragon.

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
const SPELL_KEYS = ["Q", "W", "E", "R"];

function cleanDdragonText(input = "") {
  return String(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
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

function normalizeSkinName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchJson(url, retries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${url}`);
      }

      return res.json();
    } catch (err) {
      lastError = err;

      if (attempt === retries) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}

async function imageExists(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) return true;
      if (res.status === 404) return false;
    } catch {
      if (attempt === retries) return false;

      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  return false;
}

async function getLatestVersion() {
  const versions = await fetchJson(`${DDRAGON}/api/versions.json`);

  return versions[0];
}

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

function isChromaSkin(skin) {
  const name = String(skin?.name || "");
  const normalized = normalizeSkinName(name);

  if (/\([^)]+\)/.test(name)) return true;
  if (normalized.includes("chroma")) return true;

  const chromaWords = [
    "ruby",
    "emerald",
    "sapphire",
    "obsidian",
    "pearl",
    "rose quartz",
    "turquoise",
    "catseye",
    "amethyst",
    "citrine",
    "aquamarine",
    "meteorite",
    "sandstone",
    "rainbow",
    "golden",
    "granite",
    "tanzanite",
    "formal",
    "emberwood",
  ];

  return chromaWords.some((word) => normalized.includes(word));
}

function getValidSkins(rawSkins = [], champName = "") {
  const seenNames = new Set();

  return rawSkins.filter((skin) => {
    const num = Number(skin?.num);
    const name = String(skin?.name || "").trim();

    if (!Number.isFinite(num)) return false;
    if (num < 0) return false;
    if (!name) return false;
    if (isChromaSkin(skin)) return false;

    let nameKey = normalizeSkinName(name);

    if (nameKey === "default") {
      nameKey = normalizeSkinName(champName);
    }

    if (seenNames.has(nameKey)) return false;

    seenNames.add(nameKey);

    return true;
  });
}

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

function getFiddleWikiKey(skinName, skinNum) {
  const normalized = normalizeSkinName(skinName);

  if (Number(skinNum) === 0 || normalized === "original" || normalized.includes("original")) {
    return "original";
  }

  if (normalized.includes("praetorian")) return null;

  if (normalized.includes("spectral")) return "spectral";
  if (normalized.includes("union jack")) return "unionjack";
  if (normalized.includes("bandito")) return "bandito";
  if (normalized.includes("pumpkinhead")) return "pumpkinhead";
  if (normalized.includes("fiddle me timbers") || (normalized.includes("timbers") && normalized.includes("fiddle"))) return "timbers";
  if (normalized.includes("surprise party")) return "surpriseparty";
  if (normalized.includes("dark candy")) return "darkcandy";
  if (normalized.includes("star nemesis")) return "starnemesis";
  if (normalized.includes("blood moon")) return "bloodmoon";
  if (normalized.includes("flora fatalis")) return "florafatalis";

  return null;
}

function pickLocaleFields(fullData) {
  const validSkins = getValidSkins(fullData.skins || [], fullData.name);

  return {
    name: fullData.name,
    title: fullData.title,
    lore: fullData.lore,
    allytips: fullData.allytips || [],
    enemytips: fullData.enemytips || [],
    skins: validSkins.map((skin) =>
      skin.name?.toLowerCase?.() === "default" ? fullData.name : skin.name
    ),
    abilities: {
      passive: {
        name: fullData.passive?.name || "",
        description: cleanDdragonText(fullData.passive?.description || ""),
      },
      spells: (fullData.spells || []).map((spell, index) => ({
        key: SPELL_KEYS[index] || String(index + 1),
        name: spell.name || "",
        description: cleanDdragonText(spell.description || ""),
      })),
    },
  };
}

async function runWithConcurrency(items, worker, concurrency = 3) {
  let index = 0;

  const runners = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const currentIndex = index++;

      await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
}

async function buildSkins({ version, champId, champName, fullImageName, rawSkins }) {
  const validSkins = getValidSkins(rawSkins, champName);
  const skins = [];

  if (rawSkins.length !== validSkins.length) {
    warn(`Skins filtered for ${champId}: raw=${rawSkins.length} valid=${validSkins.length}`);
  }

  for (const skin of validSkins) {
    const urls = buildUrls(version, champId, fullImageName, "", "", skin.num);

    let splashUrl = urls.skinSplashUrl;
    const loadingUrl = urls.skinLoadingUrl;

    if (champId === "Fiddlesticks") {
      const key = getFiddleWikiKey(skin.name, skin.num);
      const wikiUrl = key ? FIDDLE_WIKI_BY_KEY[key] : null;

      if (wikiUrl) {
        splashUrl = wikiUrl;
      }
    }

    const exists = await imageExists(splashUrl);

    if (!exists) {
      warn(`Skin skipped for ${champId}: "${skin.name}" num=${skin.num} image not found`);
      continue;
    }

    skins.push({
      name: skin.name?.toLowerCase?.() === "default" ? champName : skin.name,
      splashUrl,
      loadingUrl,
      imageUrl: splashUrl,
    });
  }

  return skins;
}

function buildAbilities(version, champId, fullImageName, fullData) {
  const passive = {
    name: fullData.passive?.name || "",
    description: cleanDdragonText(fullData.passive?.description || ""),
    iconUrl: buildUrls(
      version,
      champId,
      fullImageName,
      fullData.passive?.image?.full || "",
      "",
      0
    ).passiveIconUrl,
  };

  const spells = (fullData.spells || []).map((spell, index) => ({
    key: SPELL_KEYS[index] || String(index + 1),
    name: spell.name || "",
    description: cleanDdragonText(spell.description || ""),
    iconUrl: buildUrls(
      version,
      champId,
      fullImageName,
      "",
      spell.image?.full || "",
      0
    ).spellIconUrl,
  }));

  return {
    passive,
    spells,
  };
}

async function sync() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    info("Connected to MongoDB (syncSeedDdragon)");

    const version = await getLatestVersion();
    info(`Using Data Dragon version: ${version}`);

    const mapping = await readMapping();

    const onlyArg = process.argv.find((arg) => arg.startsWith("--only="));
    const onlyChampion = onlyArg ? onlyArg.split("=")[1] : null;

    const championList = await fetchJson(`${DDRAGON}/cdn/${version}/data/en_US/champion.json`);
    let champions = Object.values(championList.data);

    if (onlyChampion) {
      champions = champions.filter((champ) => champ.id === onlyChampion);

      info(`Running ONLY for champion: ${onlyChampion} (${champions.length})`);

      if (!champions.length) {
        warn(`Champion not found in list: ${onlyChampion}`);
        process.exit(0);
      }
    } else {
      info(`Found ${champions.length} champions`);
    }

    const worker = async (champ) => {
      const champId = champ.id;

      const enDetail = await fetchJson(
        `${DDRAGON}/cdn/${version}/data/en_US/champion/${champId}.json`
      );

      const esDetail = await fetchJson(
        `${DDRAGON}/cdn/${version}/data/es_MX/champion/${champId}.json`
      );

      const enFull = enDetail.data[champId];
      const esFull = esDetail.data[champId];

      const urlsBase = buildUrls(
        version,
        champId,
        enFull.image.full,
        enFull.passive?.image?.full || "",
        "",
        0
      );

      const skins = await buildSkins({
        version,
        champId,
        champName: enFull.name,
        fullImageName: enFull.image.full,
        rawSkins: enFull.skins || [],
      });

      const abilities = buildAbilities(version, champId, enFull.image.full, enFull);

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
        splashUrl: urlsBase.splashUrl,

        skins,

        lore: enFull.lore || "",
        allytips: enFull.allytips || [],
        enemytips: enFull.enemytips || [],
        info: enFull.info || {},
        stats: enFull.stats || {},
        abilities,

        i18n: {
          en: pickLocaleFields(enFull),
          es: pickLocaleFields(esFull),
        },

        ddragonVersion: version,
      };

      await Champion.replaceOne({ id: champId }, doc, { upsert: true });

      info(`Upserted ${champId} (skins=${skins.length})`);
    };

    await runWithConcurrency(champions, worker, 3);

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