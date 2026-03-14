// Controladores para campeones seed y custom
import mongoose from 'mongoose';
import { Champion } from '../models/mongodb/champion-modeldb.js';
import { User } from '../models/mongodb/user-modeldb.js';
import { info, warn, error } from '../utils/logger.js';

function isOwner(champ, user) {
  if (!champ?.owner || !user?._id) return false;
  return String(champ.owner) === String(user._id);
}

// Lang resolver: ?lang=es|en, o Accept-Language (si empieza con "es" => es). default: en
function resolveLang(req) {
  const q = String(req.query.lang || '').toLowerCase().trim();

  if (q === 'es' || q === 'es-es' || q === 'es_ar' || q === 'es-ar' || q === 'es_es') return 'es';
  if (q === 'en' || q === 'en-us' || q === 'en_us' || q === 'en-us') return 'en';

  const al = String(req.headers['accept-language'] || '').toLowerCase();
  if (al.startsWith('es')) return 'es';
  return 'en';
}

// Para NO mezclar idiomas en el JSON final (evita ver i18n.en + i18n.es)
function stripI18n(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const obj = payload?.toObject ? payload.toObject() : payload;
  delete obj.i18n;
  return obj;
}

/* ============================================================
   Sanitizado mínimo para texto de Data Dragon (habilidades)
   - Convierte <br> -> saltos de línea
   - Elimina tags como <font>, <i>, <span>, etc.
   - Normaliza entidades comunes
   ============================================================ */
function cleanDdragonText(input = '') {
  return String(input)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '') // remove all remaining tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function sanitizeChampionAbilities(champObj) {
  if (!champObj || typeof champObj !== 'object') return champObj;

  // Abilities
  if (champObj.abilities) {
    if (champObj.abilities.passive?.description) {
      champObj.abilities.passive.description = cleanDdragonText(champObj.abilities.passive.description);
    }

    if (Array.isArray(champObj.abilities.spells)) {
      champObj.abilities.spells = champObj.abilities.spells.map((s) => {
        if (!s) return s;
        return {
          ...s,
          description: s.description ? cleanDdragonText(s.description) : s.description,
        };
      });
    }
  }

  return champObj;
}

// Aplica i18n embebido al documento de campeón
function applyI18n(champDoc, lang) {
  const champ = champDoc?.toObject ? champDoc.toObject() : champDoc;
  if (!champ || !champ.i18n || !champ.i18n[lang]) return champ;

  const loc = champ.i18n[lang] || {};

  // Base texts
  if (loc.name) champ.name = loc.name;
  if (loc.title) champ.title = loc.title;
  if (loc.lore) champ.lore = loc.lore;

  if (Array.isArray(loc.allytips)) champ.allytips = loc.allytips;
  if (Array.isArray(loc.enemytips)) champ.enemytips = loc.enemytips;

  // Abilities
  if (loc.abilities) {
    champ.abilities = champ.abilities || {};

    if (loc.abilities.passive) {
      champ.abilities.passive = champ.abilities.passive || {};
      champ.abilities.passive.name = loc.abilities.passive.name ?? champ.abilities.passive.name;
      champ.abilities.passive.description =
        loc.abilities.passive.description ?? champ.abilities.passive.description;
    }

    if (Array.isArray(champ.abilities.spells)) {
      champ.abilities.spells = champ.abilities.spells.map((s, i) => {
        const ls = loc.abilities?.spells?.[i] || null;
        if (!ls) return s;
        return {
          ...s,
          name: ls.name ?? s.name,
          description: ls.description ?? s.description,
        };
      });
    }
  }

  // Skins (solo nombres, mantiene imageUrl)
  if (
    Array.isArray(loc.skins) &&
    Array.isArray(champ.skins) &&
    loc.skins.length === champ.skins.length
  ) {
    champ.skins = champ.skins.map((s, i) => ({
      ...s,
      name: loc.skins[i] ?? s.name,
    }));
  }

  return champ;
}

// Listar campeones oficiales (seed) con paginación
export async function listSeedChampions(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [total, items] = await Promise.all([
      Champion.countDocuments({ seed: true }),
      Champion.find({ seed: true })
        .select('id name title iconUrl splashUrl region positions i18n')
        .sort('name')
        .skip(skip)
        .limit(limit),
    ]);

    const lang = resolveLang(req);

    // i18n -> aplica y luego limpiamos i18n para NO mezclar idiomas en la respuesta
    const mapped = items.map((c) => {
      const base = stripI18n(applyI18n(c, lang));
      // Seguridad extra: limpia tags si quedaron (seed)
      return sanitizeChampionAbilities(base);
    });

    info(`Fetched seed champions: page=${page} limit=${limit} total=${total} lang=${lang}`);

    // Cache por idioma (si usás Accept-Language)
    res.set('Vary', 'Accept-Language');
    res.set('Cache-Control', 'public, max-age=60');

    return res.json({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: mapped,
    });
  } catch (err) {
    error('Error listing seed champions', { err });
    throw err;
  }
}

// Obtener campeón por ID (seed o custom)
export async function getChampionById(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({ id: new RegExp(`^${id}$`, 'i') });
    if (!champ) {
      warn(`Champion not found: id=${id}`);
      return res.status(404).json({ message: 'Campeón no encontrado' });
    }

    const lang = resolveLang(req);

    // Si es seed aplicamos i18n, si es custom lo dejamos tal cual
    const base = champ.seed ? applyI18n(champ, lang) : (champ?.toObject ? champ.toObject() : champ);

    // Limpiamos i18n del response para evitar “mezcla” visual
    const payload = stripI18n(base);

    // Limpieza final solo para seed (por si quedó algo viejo en DB)
    const finalPayload = champ.seed ? sanitizeChampionAbilities(payload) : payload;

    info(`Fetched champion: id=${id} lang=${lang}`);
    res.set('Vary', 'Accept-Language');
    res.set('Cache-Control', 'public, max-age=120');

    return res.json(finalPayload);
  } catch (err) {
    error('Error fetching champion by id', { err });
    throw err;
  }
}

// Crear campeón custom (requiere auth) y asociar al usuario
export async function createCustomChampion(req, res) {
  try {
    const data = { ...req.body, seed: false, owner: req.user._id };
    const created = await Champion.create(data);

    await User.findByIdAndUpdate(req.user._id, { $push: { customChampions: created._id } });

    info(`Created custom champion: id=${created.id}`);
    return res.status(201).json(created);
  } catch (err) {
    error('Error creating custom champion', { err });
    throw err;
  }
}

// Actualizar campeón custom (requiere auth) + ownership real
export async function updateChampion(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({ id: new RegExp(`^${id}$`, 'i') });
    if (!champ) {
      warn(`Update attempt on non-existent champion: id=${id}`);
      return res.status(404).json({ message: 'Campeón no encontrado' });
    }
    if (champ.seed) {
      warn(`Update attempt on seed champion: id=${id}`);
      return res.status(403).json({ message: 'No puedes modificar un campeón por defecto' });
    }
    if (!isOwner(champ, req.user)) {
      warn(`Forbidden update: not owner id=${id} user=${req.user?._id}`);
      return res.status(403).json({ message: 'No puedes modificar un campeón que no es tuyo' });
    }

    Object.assign(champ, req.body);
    const updated = await champ.save();

    info(`Updated custom champion: id=${id}`);
    return res.json(updated);
  } catch (err) {
    error('Error updating champion', { err });
    throw err;
  }
}

// Eliminar campeón custom (requiere auth) + ownership real
export async function deleteChampion(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({ id: new RegExp(`^${id}$`, 'i') });
    if (!champ) {
      warn(`Delete attempt on non-existent champion: id=${id}`);
      return res.status(404).json({ message: 'Campeón no encontrado' });
    }
    if (champ.seed) {
      warn(`Delete attempt on seed champion: id=${id}`);
      return res.status(403).json({ message: 'No puedes eliminar un campeón por defecto' });
    }
    if (!isOwner(champ, req.user)) {
      warn(`Forbidden delete: not owner id=${id} user=${req.user?._id}`);
      return res.status(403).json({ message: 'No puedes eliminar un campeón que no es tuyo' });
    }

    await User.findByIdAndUpdate(champ.owner, { $pull: { customChampions: champ._id } });

    await champ.deleteOne();
    info(`Deleted custom champion: id=${id}`);
    return res.json({ message: 'Campeón eliminado correctamente' });
  } catch (err) {
    error('Error deleting champion', { err });
    throw err;
  }
}

// Listar custom champions del usuario autenticado
export async function listMyChampions(req, res) {
  try {
    const userId = req.user._id;
    const champs = await Champion.find({ seed: false, owner: userId });
    info(`Fetched custom champions for user: userId=${userId}`);
    return res.json(champs);
  } catch (err) {
    error('Error listing custom champions', { err });
    throw err;
  }
}
