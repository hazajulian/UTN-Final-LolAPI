// runes-controller.js
// Controla el listado y detalle de arboles de runas.

import { RuneTree } from "../models/mongodb/runeTree-modeldb.js";

import { info, warn, error } from "../utils/logger.js";

function toLocale(lang = "en") {
  return lang === "es" ? "es_MX" : "en_US";
}

// Obtiene todos los arboles de runas.
export async function listRuneTrees(req, res) {
  try {
    const locale = toLocale(req.query.lang || "en");

    const trees = await RuneTree.find({ locale }).sort({ treeId: 1 });

    info(`Fetched rune trees: total=${trees.length} locale=${locale}`);

    res.set("Cache-Control", "public, max-age=120");

    return res.json({
      meta: {
        total: trees.length,
        locale,
      },
      data: trees,
    });
  } catch (err) {
    error("Error listing rune trees", { err });
    throw err;
  }
}

// Obtiene el detalle de un arbol de runas.
export async function getRuneTreeByKey(req, res) {
  try {
    const { key } = req.params;
    const locale = toLocale(req.query.lang || "en");

    const tree = await RuneTree.findOne({
      locale,
      key: new RegExp(`^${key}$`, "i"),
    });

    if (!tree) {
      warn(`Rune tree not found: key=${key} locale=${locale}`);

      return res.status(404).json({
        message: "Rune tree not found",
      });
    }

    res.set("Cache-Control", "public, max-age=120");

    return res.json(tree);
  } catch (err) {
    error("Error fetching rune tree", { err });
    throw err;
  }
}