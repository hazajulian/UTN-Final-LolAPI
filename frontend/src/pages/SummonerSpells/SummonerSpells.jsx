// SummonerSpells.jsx
// Página de hechizos de invocador.
// - Usa SearchBar reutilizable.
// - Separa hechizos estándar de especiales.
// - Oculta placeholders y variantes confusas.
// - Soporte EN/ES.

import React, { useEffect, useMemo, useState } from "react";

import { SearchBar } from "../../components/SearchBar/SearchBar";
import { getSummonerSpells } from "../../services/api";

import "./SummonerSpells.css";

const STANDARD_SPELL_IDS = [
  "SummonerBarrier",
  "SummonerBoost",
  "SummonerExhaust",
  "SummonerFlash",
  "SummonerHaste",
  "SummonerHeal",
  "SummonerDot",
  "SummonerSmite",
  "SummonerTeleport",
  "SummonerMana",
  "SummonerSnowball",
];

const HIDDEN_SPELL_IDS = [
  "SummonerCherryFlash",
  "SummonerCherryHold",
  "Summoner_UltBookPlaceholder",
  "Summoner_UltBookSmitePlaceholder",

  // Variante duplicada de Marca / Snowball
  "SummonerSnowURFSnowball_Mark",
  "SummonerSnowball_Mark",
];

const IMPORTANT_MODES = ["CLASSIC", "ARAM", "URF", "NEXUSBLITZ", "ULTBOOK", "CHERRY"];

const SORT_OPTIONS = [
  { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" },
  { value: "name-desc", labelEN: "Z → A", labelES: "Z → A" },
  { value: "cooldown-asc", labelEN: "Cooldown ↑", labelES: "Enfriamiento ↑" },
  { value: "cooldown-desc", labelEN: "Cooldown ↓", labelES: "Enfriamiento ↓" },
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function cleanDescription(text) {
  if (!text) return "-";

  return String(text)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCooldownValue(spell) {
  const raw = spell?.cooldownBurn || safeArray(spell?.cooldown)[0] || "0";
  const parsed = Number.parseFloat(raw);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getCooldownText(spell) {
  const raw = spell?.cooldownBurn || safeArray(spell?.cooldown)[0];

  if (raw === undefined || raw === null || raw === "") return "-";
  return `${raw}s`;
}

function getSpellCategory(spell) {
  if (STANDARD_SPELL_IDS.includes(spell?.spellId)) return "standard";

  const modes = safeArray(spell?.modes);

  if (modes.includes("CHERRY")) return "arena";
  if (modes.includes("ULTBOOK")) return "ultimate";
  if (modes.includes("KINGPORO")) return "poro";

  return "special";
}

function getVisibleModes(modes = []) {
  const cleanModes = safeArray(modes);

  const important = IMPORTANT_MODES.filter((mode) => cleanModes.includes(mode));
  const extra = cleanModes
    .filter((mode) => !IMPORTANT_MODES.includes(mode))
    .filter((mode) => !mode.includes("WIP"))
    .filter((mode) => !mode.includes("TUTORIAL"))
    .filter((mode) => !mode.includes("PRACTICETOOL"))
    .slice(0, 2);

  return [...important, ...extra].slice(0, 4);
}

function getCategoryLabel(category, lang) {
  const labels = {
    standard: lang === "ES" ? "Estándar" : "Standard",
    arena: lang === "ES" ? "Arena" : "Arena",
    ultimate: lang === "ES" ? "Libro Definitivo" : "Ultimate Spellbook",
    poro: lang === "ES" ? "Rey Poro" : "Poro King",
    special: lang === "ES" ? "Especial" : "Special",
  };

  return labels[category] || labels.special;
}

function sortSpells(list, sortValue) {
  const sorted = [...list];

  sorted.sort((a, b) => {
    if (sortValue === "name-desc") {
      return String(b.name || "").localeCompare(String(a.name || ""));
    }

    if (sortValue === "cooldown-asc") {
      return getCooldownValue(a) - getCooldownValue(b);
    }

    if (sortValue === "cooldown-desc") {
      return getCooldownValue(b) - getCooldownValue(a);
    }

    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  return sorted;
}

function SpellCard({ spell, lang }) {
  const category = getSpellCategory(spell);
  const categoryLabel = getCategoryLabel(category, lang);
  const cooldown = getCooldownText(spell);
  const description = cleanDescription(spell?.description);
  const modes = getVisibleModes(spell?.modes);

  const texts = {
    cooldown: lang === "ES" ? "Enfriamiento" : "Cooldown",
    modes: lang === "ES" ? "Modos" : "Modes",
    noModes: lang === "ES" ? "Sin modos" : "No modes",
  };

  return (
    <article className={`summoner__card summoner__card--${category}`}>
      <div className="summoner__cardHeader">
        <div className="summoner__iconFrame">
          <img
            className="summoner__icon"
            src={spell?.iconUrl}
            alt={spell?.name || ""}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="summoner__titleBox">
          <div className="summoner__titleTop">
            <h3 className="summoner__name">{spell?.name || "-"}</h3>
            <span className={`summoner__category summoner__category--${category}`}>
              {categoryLabel}
            </span>
          </div>

          <span className="summoner__spellId">{spell?.spellId || "-"}</span>
        </div>
      </div>

      <div className="summoner__meta">
        <div className="summoner__metaBox">
          <span className="summoner__metaIcon" aria-hidden="true">
            ◴
          </span>

          <div>
            <span className="summoner__metaLabel">{texts.cooldown}</span>
            <strong className="summoner__metaValue">{cooldown}</strong>
          </div>
        </div>

        <div className="summoner__metaBox">
          <span className="summoner__metaIcon" aria-hidden="true">
            ✦
          </span>

          <div>
            <span className="summoner__metaLabel">{texts.modes}</span>
            <strong className="summoner__metaValue">
              {safeArray(spell?.modes).length}
            </strong>
          </div>
        </div>
      </div>

      <p className="summoner__description">{description}</p>

      <div className="summoner__modes">
        {modes.length ? (
          modes.map((mode) => (
            <span className="summoner__tag" key={`${spell?.spellId}-${mode}`}>
              {mode}
            </span>
          ))
        ) : (
          <span className="summoner__tag">{texts.noModes}</span>
        )}
      </div>
    </article>
  );
}

function SpellSection({ title, subtitle, spells, lang, emptyText }) {
  if (!spells.length) return null;

  return (
    <section className="summoner__section">
      <div className="summoner__sectionHead">
        <h2 className="summoner__sectionTitle">{title}</h2>
        {subtitle && <p className="summoner__sectionSubtitle">{subtitle}</p>}
      </div>

      <div className="summoner__grid">
        {spells.length ? (
          spells.map((spell) => (
            <SpellCard
              key={`${spell.spellId}-${spell.locale || lang}`}
              spell={spell}
              lang={lang}
            />
          ))
        ) : (
          <div className="summoner__empty">
            <h3 className="summoner__emptyTitle">{emptyText}</h3>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SummonerSpells({ lang = "EN" }) {
  const apiLang = lang === "ES" ? "es" : "en";

  const [spells, setSpells] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [status, setStatus] = useState("loading");

  const texts = {
    title: lang === "ES" ? "Hechizos" : "Summoner Spells",

    subtitle:
      lang === "ES"
        ? "Explorá los hechizos disponibles, sus enfriamientos y modos de juego."
        : "Explore available spells, cooldowns and game modes.",

    searchPlaceholder:
      lang === "ES" ? "Buscar hechizo..." : "Search spell...",

    standardTitle: lang === "ES" ? "Hechizos estándar" : "Standard Spells",

    standardSubtitle:
      lang === "ES"
        ? "Los hechizos principales usados en partidas clásicas y modos habituales."
        : "Main spells used in classic matches and regular modes.",

    specialTitle:
      lang === "ES" ? "Hechizos especiales" : "Featured Game Mode Spells",

    specialSubtitle:
      lang === "ES"
        ? "Hechizos o variantes disponibles en modos temporales, Arena o eventos."
        : "Spells or variants available in featured modes, Arena or events.",

    info:
      lang === "ES"
        ? "La lista separa los hechizos principales de variantes especiales para evitar duplicados visuales."
        : "The list separates standard spells from special variants to avoid visual duplicates.",

    loading: lang === "ES" ? "Cargando hechizos..." : "Loading spells...",

    error:
      lang === "ES"
        ? "No se pudieron cargar los hechizos."
        : "Could not load summoner spells.",

    empty:
      lang === "ES"
        ? "No se encontraron hechizos."
        : "No spells found.",

    showing: lang === "ES" ? "Mostrando" : "Showing",
  };

  useEffect(() => {
    let mounted = true;

    async function loadSpells() {
      try {
        setStatus("loading");

        const data = await getSummonerSpells({ lang: apiLang });

        const list = Array.isArray(data)
          ? data
          : data?.results || data?.spells || data?.data || [];

        if (!mounted) return;

        setSpells(list);
        setStatus("success");
      } catch (error) {
        if (!mounted) return;
        setSpells([]);
        setStatus("error");
      }
    }

    loadSpells();

    return () => {
      mounted = false;
    };
  }, [apiLang]);

  const visibleSpells = useMemo(() => {
    const seen = new Set();

    return spells.filter((spell) => {
      if (!spell?.spellId) return false;
      if (HIDDEN_SPELL_IDS.includes(spell.spellId)) return false;

      // Evita duplicados exactos por seguridad.
      const key = `${spell.spellId}-${spell.locale || apiLang}`;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [spells, apiLang]);

  const filteredSpells = useMemo(() => {
    const query = normalizeText(search);

    const filtered = visibleSpells.filter((spell) => {
      if (!query) return true;

      const name = normalizeText(spell?.name);
      const description = normalizeText(spell?.description);
      const spellId = normalizeText(spell?.spellId);
      const category = normalizeText(getCategoryLabel(getSpellCategory(spell), lang));

      return (
        name.includes(query) ||
        description.includes(query) ||
        spellId.includes(query) ||
        category.includes(query)
      );
    });

    return sortSpells(filtered, sort);
  }, [visibleSpells, search, sort, lang]);

  const standardSpells = useMemo(() => {
    return filteredSpells.filter((spell) => getSpellCategory(spell) === "standard");
  }, [filteredSpells]);

  const specialSpells = useMemo(() => {
    return filteredSpells.filter((spell) => getSpellCategory(spell) !== "standard");
  }, [filteredSpells]);

  return (
    <main className="summoner">
      <section className="summoner__panel">
        <div className="summoner__content">
          <header className="summoner__hero">
            <div className="summoner__titleRow">
              <span className="summoner__stick" aria-hidden="true" />
              <h1 className="summoner__title">{texts.title}</h1>
              <span className="summoner__stick" aria-hidden="true" />
            </div>

            <div className="summoner__searchWrap">
              <SearchBar
                value={search}
                onChange={setSearch}
                lang={lang}
                placeholder={texts.searchPlaceholder}
                sortValue={sort}
                onSortChange={setSort}
                sortOptions={SORT_OPTIONS}
                showSort
              />
            </div>

            <p className="summoner__subtitle">{texts.subtitle}</p>

            <div className="summoner__summary">
              <span>
                {texts.showing}: {filteredSpells.length}/{visibleSpells.length}
              </span>
            </div>

            <p className="summoner__info">{texts.info}</p>
          </header>

          {status === "loading" && (
            <p className="summoner__status">{texts.loading}</p>
          )}

          {status === "error" && (
            <p className="summoner__status summoner__status--error">
              {texts.error}
            </p>
          )}

          {status === "success" && filteredSpells.length === 0 && (
            <div className="summoner__empty">
              <h2 className="summoner__emptyTitle">{texts.empty}</h2>
            </div>
          )}

          {status === "success" && filteredSpells.length > 0 && (
            <>
              <SpellSection
                title={texts.standardTitle}
                subtitle={texts.standardSubtitle}
                spells={standardSpells}
                lang={lang}
                emptyText={texts.empty}
              />

              <SpellSection
                title={texts.specialTitle}
                subtitle={texts.specialSubtitle}
                spells={specialSpells}
                lang={lang}
                emptyText={texts.empty}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}