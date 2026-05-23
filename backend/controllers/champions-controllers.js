// Controladores públicos para campeones oficiales.
import { Champion } from "../models/mongodb/champion-modeldb.js";
import { info, warn, error } from "../utils/logger.js";

// Lang resolver: ?lang=es|en o Accept-Language.
function resolveLang(req) {
  const q = String(req.query.lang || "").toLowerCase().trim();

  if (["es", "es-es", "es_ar", "es-ar", "es_es", "es_mx", "es-mx"].includes(q)) {
    return "es";
  }

  if (["en", "en-us", "en_us"].includes(q)) {
    return "en";
  }

  const acceptLanguage = String(req.headers["accept-language"] || "").toLowerCase();
  if (acceptLanguage.startsWith("es")) return "es";

  return "en";
}

// Evita devolver i18n.en + i18n.es en el JSON final.
function stripI18n(payload) {
  if (!payload || typeof payload !== "object") return payload;

  const obj = payload?.toObject ? payload.toObject() : payload;
  delete obj.i18n;

  return obj;
}

// Limpia HTML básico de Data Dragon.
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

function sanitizeChampionAbilities(champObj) {
  if (!champObj || typeof champObj !== "object") return champObj;

  if (champObj.abilities?.passive?.description) {
    champObj.abilities.passive.description = cleanDdragonText(
      champObj.abilities.passive.description
    );
  }

  if (Array.isArray(champObj.abilities?.spells)) {
    champObj.abilities.spells = champObj.abilities.spells.map((spell) => ({
      ...spell,
      description: spell.description
        ? cleanDdragonText(spell.description)
        : spell.description,
    }));
  }

  return champObj;
}

// Aplica textos localizados del i18n embebido.
function applyI18n(champDoc, lang) {
  const champ = champDoc?.toObject ? champDoc.toObject() : champDoc;

  if (!champ?.i18n?.[lang]) return champ;

  const loc = champ.i18n[lang];

  if (loc.name) champ.name = loc.name;
  if (loc.title) champ.title = loc.title;
  if (loc.lore) champ.lore = loc.lore;

  if (Array.isArray(loc.allytips)) champ.allytips = loc.allytips;
  if (Array.isArray(loc.enemytips)) champ.enemytips = loc.enemytips;

  if (loc.abilities) {
    champ.abilities = champ.abilities || {};

    if (loc.abilities.passive) {
      champ.abilities.passive = champ.abilities.passive || {};
      champ.abilities.passive.name =
        loc.abilities.passive.name ?? champ.abilities.passive.name;
      champ.abilities.passive.description =
        loc.abilities.passive.description ?? champ.abilities.passive.description;
    }

    if (Array.isArray(champ.abilities.spells)) {
      champ.abilities.spells = champ.abilities.spells.map((spell, index) => {
        const localizedSpell = loc.abilities?.spells?.[index];

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
    Array.isArray(loc.skins) &&
    Array.isArray(champ.skins) &&
    loc.skins.length === champ.skins.length
  ) {
    champ.skins = champ.skins.map((skin, index) => ({
      ...skin,
      name: loc.skins[index] ?? skin.name,
    }));
  }

  return champ;
}

function parseCsv(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap(parseCsv);
  }

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

// Listar campeones oficiales.
export async function listSeedChampions(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const lang = resolveLang(req);
    const filter = buildChampionFilter(req.query);

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

// Obtener detalle de campeón oficial.
export async function getChampionById(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({
      seed: true,
      id: new RegExp(`^${id}$`, "i"),
    });

    if (!champ) {
      warn(`Champion not found: id=${id}`);

      return res.status(404).json({
        message: "Campeón no encontrado",
      });
    }

    const lang = resolveLang(req);

    const localized = applyI18n(champ, lang);
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