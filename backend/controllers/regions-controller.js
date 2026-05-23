import { Region } from "../models/mongodb/region-modeldb.js";

function normalizeLocale(lang) {
  return lang === "en" ? "en_US" : "es_MX";
}

export async function getRegions(req, res, next) {
  try {
    const locale = normalizeLocale(req.query.lang);

    const regions = await Region.find({ locale })
      .sort({ name: 1 })
      .select("-__v")
      .lean();

    res.json({
      total: regions.length,
      locale,
      results: regions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRegionById(req, res, next) {
  try {
    const { regionId } = req.params;
    const locale = normalizeLocale(req.query.lang);

    const region = await Region.findOne({ regionId, locale })
      .select("-__v")
      .lean();

    if (!region) {
      return res.status(404).json({
        message: "Region not found",
      });
    }

    res.json(region);
  } catch (error) {
    next(error);
  }
}