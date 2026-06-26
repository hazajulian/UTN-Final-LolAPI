// items-controller.js
// Controla el listado, filtros y detalle de items.

import { Item } from "../models/mongodb/item-modeldb.js";
import { info, warn, error } from "../utils/logger.js";

function toLocale(lang = "en") {
  return lang === "es" ? "es_MX" : "en_US";
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

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;

  return String(value).toLowerCase() === "true";
}

function buildBaseFilter(query) {
  const locale = toLocale(query.lang || "en");
  const includeHidden = parseBoolean(query.includeHidden, false);

  const group = query.group || "all";
  const section = query.section || "";
  const tier = query.tier || "";

  const filter = { locale };

  if (!includeHidden) {
    filter.isVisible = true;
    filter.isRemoved = false;
    filter.isDuplicate = false;
    filter.shopGroup = { $ne: "hidden" };
  }

  if (group && group !== "all") {
    filter.shopGroup = group;
  }

  if (section) {
    filter.shopSection = section;
  }

  if (tier) {
    filter.tier = tier;
  }

  return filter;
}

function applySearch(filter, search) {
  if (!search) return filter;

  const regex = { $regex: search, $options: "i" };

  return {
    ...filter,
    $or: [
      { name: regex },
      { catalogName: regex },
      { plaintext: regex },
      { descriptionText: regex },
      { tags: regex },
    ],
  };
}

function applyGold(filter, minGold, maxGold) {
  if (minGold == null && maxGold == null) return filter;

  const goldFilter = {};

  if (minGold != null) {
    goldFilter.$gte = Number(minGold);
  }

  if (maxGold != null) {
    goldFilter.$lte = Number(maxGold);
  }

  return {
    ...filter,
    "gold.total": goldFilter,
  };
}

function buildSort(sort = "name") {
  if (sort === "gold_asc") return { "gold.total": 1, catalogOrder: 1 };
  if (sort === "gold_desc") return { "gold.total": -1, catalogOrder: 1 };

  return { catalogOrder: 1, name: 1 };
}

const ITEM_LIST_SELECT = [
  "itemId",
  "catalogName",
  "catalogStatus",
  "catalogOrder",
  "name",
  "plaintext",
  "iconUrl",
  "gold",
  "tags",
  "locale",
  "tier",
  "shopGroup",
  "shopSection",
  "roleGroups",
  "isArena",
  "isVisible",
].join(" ");

const ITEM_RELATION_SELECT = [
  "itemId",
  "catalogName",
  "name",
  "iconUrl",
  "gold",
  "tier",
  "shopGroup",
  "shopSection",
  "roleGroups",
  "catalogOrder",
].join(" ");

export async function listItems(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const search = req.query.search;
  const tags = parseCsv(req.query.tags);
  const roles = parseCsv(req.query.roles);
  const minGold = req.query.minGold;
  const maxGold = req.query.maxGold;
  const sort = req.query.sort || "name";

  try {
    let filter = buildBaseFilter(req.query);

    filter = applySearch(filter, search);
    filter = applyGold(filter, minGold, maxGold);

    if (tags.length) {
      filter.tags = { $in: tags };
    }

    if (roles.length) {
      filter.roleGroups = { $in: roles };
    }

    const [total, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .select(ITEM_LIST_SELECT)
        .sort(buildSort(sort))
        .skip(skip)
        .limit(limit),
    ]);

    info(`Fetched items: page=${page} limit=${limit} total=${total}`);
    res.set("Cache-Control", "public, max-age=60");

    return res.json({
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        locale: toLocale(req.query.lang || "en"),
        group: req.query.group || "all",
        section: req.query.section || null,
        tier: req.query.tier || null,
      },
      data: items,
    });
  } catch (err) {
    error("Error listing items", { err });
    throw err;
  }
}

export async function listAllItems(req, res) {
  try {
    const filter = buildBaseFilter(req.query);

    const items = await Item.find(filter)
      .select(ITEM_LIST_SELECT)
      .sort({ catalogOrder: 1, name: 1 });

    info(`Fetched all items: total=${items.length}`);
    res.set("Cache-Control", "public, max-age=120");

    return res.json({
      meta: {
        total: items.length,
        locale: toLocale(req.query.lang || "en"),
        group: req.query.group || "all",
        section: req.query.section || null,
        tier: req.query.tier || null,
      },
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
    const item = await Item.findOne({
      itemId: String(id),
      locale,
      isVisible: true,
      isRemoved: false,
      isDuplicate: false,
    });

    if (!item) {
      warn(`Item not found: itemId=${id} locale=${locale}`);

      return res.status(404).json({
        message: lang === "es" ? "Objeto no encontrado" : "Item not found",
      });
    }

    const fromIds = Array.isArray(item.from) ? item.from : [];
    const intoIds = Array.isArray(item.into) ? item.into : [];

    const [fromItems, intoItems] = await Promise.all([
      fromIds.length
        ? Item.find({
            locale,
            itemId: { $in: fromIds.map(String) },
            isVisible: true,
            isRemoved: false,
            isDuplicate: false,
          })
            .select(ITEM_RELATION_SELECT)
            .lean()
        : Promise.resolve([]),

      intoIds.length
        ? Item.find({
            locale,
            itemId: { $in: intoIds.map(String) },
            isVisible: true,
            isRemoved: false,
            isDuplicate: false,
          })
            .select(ITEM_RELATION_SELECT)
            .lean()
        : Promise.resolve([]),
    ]);

    const fromMap = new Map(fromItems.map((fromItem) => [String(fromItem.itemId), fromItem]));
    const intoMap = new Map(intoItems.map((intoItem) => [String(intoItem.itemId), intoItem]));

    const payload = item.toJSON();

    // Mantiene el orden original de la receta.
    payload.fromItems = fromIds.map((itemId) => fromMap.get(String(itemId))).filter(Boolean);
    payload.intoItems = intoIds.map((itemId) => intoMap.get(String(itemId))).filter(Boolean);

    res.set("Cache-Control", "public, max-age=120");

    return res.json(payload);
  } catch (err) {
    error("Error fetching item detail", { err });
    throw err;
  }
}

export async function listItemTags(req, res) {
  try {
    const filter = buildBaseFilter(req.query);
    const tags = await Item.distinct("tags", filter);

    return res.json({
      meta: {
        total: tags.length,
        locale: toLocale(req.query.lang || "en"),
        group: req.query.group || "all",
      },
      data: tags.filter(Boolean).sort(),
    });
  } catch (err) {
    error("Error listing item tags", { err });
    throw err;
  }
}

export async function itemsMeta(req, res) {
  try {
    const locale = toLocale(req.query.lang || "en");

    const [total, visible, main, arena, special, manual] = await Promise.all([
      Item.countDocuments({ locale }),
      Item.countDocuments({ locale, isVisible: true }),
      Item.countDocuments({ locale, isVisible: true, shopGroup: "main" }),
      Item.countDocuments({ locale, isVisible: true, shopGroup: "arena" }),
      Item.countDocuments({ locale, isVisible: true, shopGroup: "special" }),
      Item.countDocuments({ locale, isVisible: true, catalogStatus: "manual" }),
    ]);

    return res.json({
      data: {
        locale,
        total,
        visible,
        manual,
        groups: {
          main,
          arena,
          special,
        },
      },
    });
  } catch (err) {
    error("Error fetching items meta", { err });
    throw err;
  }
}

export async function itemsFiltersMeta(req, res) {
  try {
    const filter = buildBaseFilter(req.query);

    const [sectionsRaw, tiersRaw, rolesRaw, tagsRaw] = await Promise.all([
      Item.aggregate([
        { $match: filter },
        { $group: { _id: "$shopSection", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Item.aggregate([
        { $match: filter },
        { $match: { tier: { $ne: "" } } },
        { $group: { _id: "$tier", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Item.aggregate([
        { $match: filter },
        { $unwind: "$roleGroups" },
        { $group: { _id: "$roleGroups", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Item.aggregate([
        { $match: filter },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.json({
      meta: {
        locale: toLocale(req.query.lang || "en"),
        group: req.query.group || "all",
      },
      data: {
        sections: sectionsRaw
          .filter((section) => section._id)
          .map((section) => ({
            key: section._id,
            total: section.total,
          })),

        tiers: tiersRaw
          .filter((tier) => tier._id)
          .map((tier) => ({
            key: tier._id,
            total: tier.total,
          })),

        roles: rolesRaw
          .filter((role) => role._id)
          .map((role) => ({
            key: role._id,
            total: role.total,
          })),

        tags: tagsRaw
          .filter((tag) => tag._id)
          .map((tag) => ({
            key: tag._id,
            total: tag.total,
          })),
      },
    });
  } catch (err) {
    error("Error fetching items filters meta", { err });
    throw err;
  }
}