// syncSummonerSpells.js
// Sincroniza los Summoner Spells desde Riot Data Dragon y los guarda en MongoDB.

import "dotenv/config";
import mongoose from "mongoose";

import { SummonerSpell } from "../../models/mongodb/summonerSpell-modeldb.js";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const LOCALES = ["en_US", "es_MX"];

// Limpia HTML y entidades básicas de los textos de Riot.
function cleanText(input = "") {
  return String(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Obtiene JSON desde una URL.
async function fetchJson(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${url}`);
  }

  return res.json();
}

// Obtiene la última versión disponible de Data Dragon.
async function getLatestVersion() {
  const versions = await fetchJson(`${DDRAGON}/api/versions.json`);
  return versions[0];
}

// Construye la URL del icono del hechizo.
function buildIconUrl(version, imageFull = "") {
  if (!imageFull) return "";
  return `${DDRAGON}/cdn/${version}/img/spell/${imageFull}`;
}

// Sincroniza los hechizos de un idioma específico.
async function syncLocale(version, locale) {
  const url = `${DDRAGON}/cdn/${version}/data/${locale}/summoner.json`;
  const data = await fetchJson(url);

  const spells = Object.values(data.data || {});

  const docs = spells.map((spell) => ({
    spellId: spell.id,
    key: String(spell.key),
    locale,

    name: spell.name || "",
    description: cleanText(spell.description || ""),
    tooltip: cleanText(spell.tooltip || ""),

    maxrank: spell.maxrank || 1,
    cooldown: spell.cooldown || [],
    cooldownBurn: spell.cooldownBurn || "",

    modes: spell.modes || [],

    imageFull: spell.image?.full || "",
    iconUrl: buildIconUrl(version, spell.image?.full || ""),

    ddragonVersion: version,
  }));

  await SummonerSpell.deleteMany({ locale });

  if (docs.length) {
    await SummonerSpell.insertMany(docs);
  }

  console.log(`${locale}: inserted ${docs.length} summoner spells`);
}

// Ejecuta la sincronización completa.
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

    console.log("Summoner spells sync completed");
    process.exit(0);
  } catch (err) {
    console.error("Summoner spells sync failed:", err);
    process.exit(1);
  }
}

run();