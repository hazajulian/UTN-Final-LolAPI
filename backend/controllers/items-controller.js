// Controladores para Items (Tienda)
import { Item } from "../models/mongodb/item-modeldb.js";
import { info, warn, error } from "../utils/logger.js";

function toLocale(lang) {
  return lang === "es" ? "es_ES" : "en_US";
}

function parseCsv(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap(parseCsv);
  return String(val)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// filtro “shop limpio”
function applyShopOnly(filter, shopOnly) {
  if (!shopOnly) return;

  // saca 221xxx/222xxx
  filter.isVariant = false;

  // visibles/comprables
  filter.inStore = true;
  filter.hideFromAll = false;

  // ✅ solo SR
  filter.isSummonersRift = true;

  // ✅ no duplicados por nombre
  filter.isDuplicate = false;
}

export async function listItems(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const locale = toLocale(req.query.lang || "en");

  const search = req.query.search;
  const tags = parseCsv(req.query.tags);
  const roles = parseCsv(req.query.roles); // fighter,mage,tank...
  const tier = req.query.tier || "";
  const section = req.query.section || "";

  const minGold = req.query.minGold;
  const maxGold = req.query.maxGold;

  const sort = req.query.sort || "name";

  const includeHidden = Boolean(req.query.includeHidden);
  const shopOnly = req.query.shopOnly !== "false"; // default true

  try {
    const filter = { locale };

    if (!includeHidden) {
      applyShopOnly(filter, shopOnly);
    } else {
      // si incluye hidden, igual podemos limpiar variants si shopOnly
      if (shopOnly) filter.isVariant = false;
    }

    if (search) filter.name = { $regex: search, $options: "i" };
    if (tags.length) filter.tags = { $in: tags };

    if (roles.length) filter.roleGroups = { $in: roles };
    if (tier) filter.tier = tier;
    if (section) filter.shopSection = section;

    if (minGold != null || maxGold != null) {
      filter["gold.total"] = {};
      if (minGold != null) filter["gold.total"].$gte = Number(minGold);
      if (maxGold != null) filter["gold.total"].$lte = Number(maxGold);
    }

    const sortObj =
      sort === "gold_asc"
        ? { "gold.total": 1 }
        : sort === "gold_desc"
        ? { "gold.total": -1 }
        : { name: 1 };

    const [total, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .select("itemId name iconUrl gold tags plaintext locale tier shopSection roleGroups")
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
    ]);

    info(`Fetched items: locale=${locale} page=${page} limit=${limit} total=${total}`);
    res.set("Cache-Control", "public, max-age=60");

    return res.json({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: items,
    });
  } catch (err) {
    error("Error listing items", { err });
    throw err;
  }
}

export async function listAllItems(req, res) {
  const locale = toLocale(req.query.lang || "en");
  const includeHidden = Boolean(req.query.includeHidden);
  const shopOnly = req.query.shopOnly !== "false"; // default true

  try {
    const filter = { locale };

    if (!includeHidden) {
      applyShopOnly(filter, shopOnly);
    } else {
      if (shopOnly) filter.isVariant = false;
    }

    const items = await Item.find(filter)
      .select("itemId name iconUrl gold tags plaintext locale tier shopSection roleGroups")
      .sort({ name: 1 });

    info(`Fetched all items: locale=${locale} total=${items.length}`);
    res.set("Cache-Control", "public, max-age=120");

    return res.json({
      meta: { total: items.length, locale },
      data: items,
    });
  } catch (err) {
    error("Error listing all items", { err });
    throw err;
  }
}

export async function getItemById(req, res) {
  const { id } = req.params;
  const lang = req.query.lang || "en";
  const locale = toLocale(lang);

  try {
    const item = await Item.findOne({ itemId: String(id), locale });
    if (!item) {
      warn(`Item not found: itemId=${id} locale=${locale}`);
      return res.status(404).json({ message: "Item no encontrado" });
    }

    const fromIds = Array.isArray(item.from) ? item.from : [];
    const intoIds = Array.isArray(item.into) ? item.into : [];

    const [fromItems, intoItems] = await Promise.all([
      fromIds.length
        ? Item.find({ locale, itemId: { $in: fromIds } })
            .select("itemId name iconUrl gold.total tier shopSection roleGroups")
            .lean()
        : Promise.resolve([]),

      intoIds.length
        ? Item.find({ locale, itemId: { $in: intoIds } })
            .select("itemId name iconUrl gold.total tier shopSection roleGroups")
            .lean()
        : Promise.resolve([]),
    ]);

    const byId = (arr) => new Map(arr.map((x) => [String(x.itemId), x]));
    const fromMap = byId(fromItems);
    const intoMap = byId(intoItems);

    const fromOrdered = fromIds.map((x) => fromMap.get(String(x))).filter(Boolean);
    const intoOrdered = intoIds.map((x) => intoMap.get(String(x))).filter(Boolean);

    info(`Fetched item: itemId=${id} locale=${locale}`);
    res.set("Cache-Control", "public, max-age=180");

    const payload = item.toJSON();
    payload.fromItems = fromOrdered;
    payload.intoItems = intoOrdered;

    return res.json(payload);
  } catch (err) {
    error("Error fetching item by id", { err });
    throw err;
  }
}

export async function itemsMeta(req, res) {
  try {
    const last = await Item.findOne().sort({ updatedAt: -1 }).select("ddragonVersion updatedAt");
    return res.json({
      module: "items",
      ddragonVersion: last?.ddragonVersion || "",
      locales: ["en_US", "es_ES"],
      updatedAt: last?.updatedAt || null,
    });
  } catch (err) {
    error("Error fetching items meta", { err });
    throw err;
  }
}

// GET /api/v1/items/tags
export async function listItemTags(req, res) {
  try {
    const lang = req.query.lang || "en";
    const locale = lang === "es" ? "es_ES" : "en_US";
    const includeHidden = Boolean(req.query.includeHidden);
    const shopOnly = req.query.shopOnly !== "false"; // default true

    const match = { locale };
    if (!includeHidden && shopOnly) {
      match.isVariant = false;
      match.inStore = true;
      match.hideFromAll = false;
      match.isSummonersRift = true;
      match.isDuplicate = false;
    } else if (!includeHidden) {
      match.inStore = true;
      match.hideFromAll = false;
    } else if (shopOnly) {
      match.isVariant = false;
    }

    const rows = await Item.aggregate([
      { $match: match },
      { $unwind: "$tags" },
      { $match: { tags: { $type: "string", $ne: "" } } },
      { $group: { _id: "$tags" } },
      { $sort: { _id: 1 } },
    ]);

    const tags = rows.map((r) => r._id);

    res.set("Cache-Control", "public, max-age=300");
    return res.json({
      meta: { locale, total: tags.length },
      data: tags,
    });
  } catch (err) {
    throw err;
  }
}

// GET /api/v1/items/meta/filters
export async function itemsFiltersMeta(req, res) {
  try {
    const lang = req.query.lang || "en";
    const locale = toLocale(lang);
    const includeHidden = Boolean(req.query.includeHidden);
    const shopOnly = req.query.shopOnly !== "false"; // default true

    const match = { locale };
    if (!includeHidden && shopOnly) {
      match.isVariant = false;
      match.inStore = true;
      match.hideFromAll = false;
      match.isSummonersRift = true;
      match.isDuplicate = false;
    } else if (!includeHidden) {
      match.inStore = true;
      match.hideFromAll = false;
    } else if (shopOnly) {
      match.isVariant = false;
    }

    const [sectionsRows, tiersRows, rolesRows] = await Promise.all([
      Item.aggregate([
        { $match: match },
        { $match: { shopSection: { $ne: "" } } },
        { $group: { _id: "$shopSection", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Item.aggregate([
        { $match: match },
        { $match: { tier: { $ne: "" } } },
        { $group: { _id: "$tier", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Item.aggregate([
        { $match: match },
        { $unwind: "$roleGroups" },
        { $match: { roleGroups: { $type: "string", $ne: "" } } },
        { $group: { _id: "$roleGroups", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.json({
      meta: { locale, shopOnly, includeHidden },
      data: {
        sections: sectionsRows.map((x) => ({ key: x._id, total: x.total })),
        tiers: tiersRows.map((x) => ({ key: x._id, total: x.total })),
        roles: rolesRows.map((x) => ({ key: x._id, total: x.total })),
      },
    });
  } catch (err) {
    throw err;
  }
}
