import { SummonerSpell } from "../models/mongodb/summonerSpell-modeldb.js";
import { info, warn, error } from "../utils/logger.js";

function toLocale(lang = "en") {
  return lang === "es" ? "es_MX" : "en_US";
}

export async function listSummonerSpells(req, res) {
  try {
    const locale = toLocale(req.query.lang || "en");

    const spells = await SummonerSpell.find({ locale }).sort({ name: 1 });

    info(`Fetched summoner spells: total=${spells.length} locale=${locale}`);

    res.set("Cache-Control", "public, max-age=120");

    return res.json({
      meta: {
        total: spells.length,
        locale,
      },
      data: spells,
    });
  } catch (err) {
    error("Error listing summoner spells", { err });
    throw err;
  }
}

export async function getSummonerSpellById(req, res) {
  try {
    const { id } = req.params;
    const locale = toLocale(req.query.lang || "en");

    const spell = await SummonerSpell.findOne({
      locale,
      spellId: new RegExp(`^${id}$`, "i"),
    });

    if (!spell) {
      warn(`Summoner spell not found: id=${id} locale=${locale}`);

      return res.status(404).json({
        message: "Summoner spell not found",
      });
    }

    res.set("Cache-Control", "public, max-age=120");

    return res.json(spell);
  } catch (err) {
    error("Error fetching summoner spell", { err });
    throw err;
  }
}