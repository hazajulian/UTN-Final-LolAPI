// champions-controller.js
// Controla el listado y detalle de campeones oficiales.

import { Champion } from "../models/mongodb/champion-modeldb.js";

import { info, warn, error } from "../utils/logger.js";

function resolveLang(req) {
  const queryLang = String(req.query.lang || "").toLowerCase().trim();

  if (["es", "es-es", "es_ar", "es-ar", "es_es", "es_mx", "es-mx"].includes(queryLang)) {
    return "es";
  }

  if (["en", "en-us", "en_us"].includes(queryLang)) {
    return "en";
  }

  const acceptLanguage = String(req.headers["accept-language"] || "").toLowerCase();

  if (acceptLanguage.startsWith("es")) return "es";

  return "en";
}

function stripI18n(payload) {
  if (!payload || typeof payload !== "object") return payload;

  const champion = payload?.toObject ? payload.toObject() : payload;
  delete champion.i18n;

  return champion;
}

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

function sanitizeChampionAbilities(champion) {
  if (!champion || typeof champion !== "object") return champion;

  if (champion.abilities?.passive?.description) {
    champion.abilities.passive.description = cleanDdragonText(champion.abilities.passive.description);
  }

  if (Array.isArray(champion.abilities?.spells)) {
    champion.abilities.spells = champion.abilities.spells.map((spell) => ({
      ...spell,
      description: spell.description ? cleanDdragonText(spell.description) : spell.description,
    }));
  }

  return champion;
}

function applyI18n(championDoc, lang) {
  const champion = championDoc?.toObject ? championDoc.toObject() : championDoc;

  if (!champion?.i18n?.[lang]) return champion;

  const locale = champion.i18n[lang];

  if (locale.name) champion.name = locale.name;
  if (locale.title) champion.title = locale.title;
  if (locale.lore) champion.lore = locale.lore;

  if (Array.isArray(locale.allytips)) champion.allytips = locale.allytips;
  if (Array.isArray(locale.enemytips)) champion.enemytips = locale.enemytips;

  if (locale.abilities) {
    champion.abilities = champion.abilities || {};

    if (locale.abilities.passive) {
      champion.abilities.passive = champion.abilities.passive || {};
      champion.abilities.passive.name = locale.abilities.passive.name ?? champion.abilities.passive.name;
      champion.abilities.passive.description =
        locale.abilities.passive.description ?? champion.abilities.passive.description;
    }

    if (Array.isArray(champion.abilities.spells)) {
      champion.abilities.spells = champion.abilities.spells.map((spell, index) => {
        const localizedSpell = locale.abilities?.spells?.[index];

        if (!localizedSpell) return spell;

        return {
          ...spell,
          name: localizedSpell.name ?? spell.name,
          description: localizedSpell.description ?? spell.description,
        };
      });
    }
  }

  if (
    Array.isArray(locale.skins) &&
    Array.isArray(champion.skins) &&
    locale.skins.length === champion.skins.length
  ) {
    champion.skins = champion.skins.map((skin, index) => ({
      ...skin,
      name: locale.skins[index] ?? skin.name,
    }));
  }

  return champion;
}

function parseCsv(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(parseCsv);

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildChampionFilter(query) {
  const filter = { seed: true };

  const search = String(query.search || "").trim();
  const region = String(query.region || "").trim();
  const positions = parseCsv(query.positions);

  if (search) {
    const regex = { $regex: search, $options: "i" };

    filter.$or = [
      { id: regex },
      { name: regex },
      { title: regex },
      { region: regex },
      { roles: regex },
      { positions: regex },
    ];
  }

  if (region) {
    filter.region = { $regex: `^${region}$`, $options: "i" };
  }

  if (positions.length) {
    filter.positions = { $in: positions };
  }

  return filter;
}

function buildSort(sort = "name") {
  if (sort === "name_desc") return { name: -1 };
  if (sort === "region") return { region: 1, name: 1 };

  return { name: 1 };
}

// Lista campeones oficiales.
export async function listSeedChampions(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const lang = resolveLang(req);
  const filter = buildChampionFilter(req.query);

  try {
    const [total, items] = await Promise.all([
      Champion.countDocuments(filter),
      Champion.find(filter)
        .select("id name title iconUrl splashUrl region roles positions i18n")
        .sort(buildSort(req.query.sort))
        .skip(skip)
        .limit(limit),
    ]);

    const mapped = items.map((champion) => {
      const localized = applyI18n(champion, lang);
      const cleanPayload = stripI18n(localized);

      return sanitizeChampionAbilities(cleanPayload);
    });

    info(`Fetched seed champions: page=${page} limit=${limit} total=${total} lang=${lang}`);

    res.set("Vary", "Accept-Language");
    res.set("Cache-Control", "public, max-age=60");

    return res.json({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        lang,
      },
      data: mapped,
    });
  } catch (err) {
    error("Error listing seed champions", { err });
    throw err;
  }
}

// Obtiene el detalle de un campeon oficial.
export async function getChampionById(req, res) {
  const { id } = req.params;
  const lang = resolveLang(req);

  try {
    const champion = await Champion.findOne({
      seed: true,
      id: new RegExp(`^${id}$`, "i"),
    });

    if (!champion) {
      warn(`Champion not found: id=${id}`);

      return res.status(404).json({
        message: "Campeon no encontrado",
      });
    }

    const localized = applyI18n(champion, lang);
    const payload = stripI18n(localized);
    const finalPayload = sanitizeChampionAbilities(payload);

    info(`Fetched champion: id=${id} lang=${lang}`);

    res.set("Vary", "Accept-Language");
    res.set("Cache-Control", "public, max-age=120");

    return res.json(finalPayload);
  } catch (err) {
    error("Error fetching champion by id", { err });
    throw err;
  }
}