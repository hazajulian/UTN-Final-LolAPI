// SummonerSpells.jsx
// Página de hechizos de invocador con búsqueda, orden y secciones.

import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineClock, HiSparkles } from "react-icons/hi2";

import { SearchBar } from "../../components/SearchBar/SearchBar";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
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
  "SummonerSnowURFSnowball_Mark",
  "Summoner_UltBookPlaceholder",
  "Summoner_UltBookSmitePlaceholder",
];

const IMPORTANT_MODES = [
  "CLASSIC",
  "ARAM",
  "URF",
  "NEXUSBLITZ",
  "ULTBOOK",
  "CHERRY",
  "KINGPORO",
];

const SORT_OPTIONS = [
  { value: "name-asc", labelKey: "sortAZ" },
  { value: "name-desc", labelKey: "sortZA" },
  { value: "cooldown-asc", labelKey: "cooldownAsc" },
  { value: "cooldown-desc", labelKey: "cooldownDesc" },
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

function getCategoryLabel(category, t) {
  return t.categories?.[category] || t.categories?.special || category;
}

function SpellCard({ spell, t }) {
  const category = getSpellCategory(spell);
  const categoryLabel = getCategoryLabel(category, t);
  const cooldown = getCooldownText(spell);
  const description = cleanDescription(spell?.description);
  const modes = getVisibleModes(spell?.modes);

  return (
    <article className={`summoner__card summoner__card--${category}`}>
      <header className="summoner__cardHeader">
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
      </header>

      <div className="summoner__meta">
        <div className="summoner__metaBox">
          <span className="summoner__metaIconBox" aria-hidden="true">
            <HiOutlineClock className="summoner__metaIcon" />
          </span>

          <div className="summoner__metaText">
            <span className="summoner__metaLabel">{t.cooldown}</span>
            <strong className="summoner__metaValue">{cooldown}</strong>
          </div>
        </div>

        <div className="summoner__metaBox">
          <span className="summoner__metaIconBox" aria-hidden="true">
            <HiSparkles className="summoner__metaIcon" />
          </span>

          <div className="summoner__metaText">
            <span className="summoner__metaLabel">{t.modes}</span>
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
          <span className="summoner__tag">{t.noModes}</span>
        )}
      </div>
    </article>
  );
}

function SpellSection({ title, subtitle, spells, t }) {
  if (!spells.length) return null;

  return (
    <section className="summoner__section">
      <div className="summoner__sectionHead">
        <h2 className="summoner__sectionTitle">{title}</h2>
        {subtitle && <p className="summoner__sectionSubtitle">{subtitle}</p>}
      </div>

      <div className="summoner__grid">
        {spells.map((spell, index) => (
          <SpellCard
            key={`${spell.spellId}-${spell.locale || index}`}
            spell={spell}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

export default function SummonerSpells() {
  const { language } = useLanguage();

  const t = translations[language].summonerSpells;
  const apiLang = language === "ES" ? "es" : "en";

  const [spells, setSpells] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [status, setStatus] = useState("loading");

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
      } catch {
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
    return spells.filter((spell) => {
      if (!spell?.spellId) return false;
      return !HIDDEN_SPELL_IDS.includes(spell.spellId);
    });
  }, [spells]);

  const filteredSpells = useMemo(() => {
    const query = normalizeText(search);

    const filtered = visibleSpells.filter((spell) => {
      if (!query) return true;

      const name = normalizeText(spell?.name);
      const description = normalizeText(spell?.description);
      const spellId = normalizeText(spell?.spellId);
      const category = normalizeText(
        getCategoryLabel(getSpellCategory(spell), t)
      );
      const modes = safeArray(spell?.modes).map(normalizeText).join(" ");

      return (
        name.includes(query) ||
        description.includes(query) ||
        spellId.includes(query) ||
        category.includes(query) ||
        modes.includes(query)
      );
    });

    return sortSpells(filtered, sort);
  }, [visibleSpells, search, sort, t]);

  const standardSpells = useMemo(() => {
    return filteredSpells.filter(
      (spell) => getSpellCategory(spell) === "standard"
    );
  }, [filteredSpells]);

  const specialSpells = useMemo(() => {
    return filteredSpells.filter(
      (spell) => getSpellCategory(spell) !== "standard"
    );
  }, [filteredSpells]);

  return (
    <main className="summoner">
      <section className="summoner__panel">
        <div className="summoner__content">
          <header className="summoner__hero">
            <div className="summoner__titleRow">
              <span className="summoner__stick" aria-hidden="true" />
              <h1 className="summoner__title">{t.title}</h1>
              <span className="summoner__stick" aria-hidden="true" />
            </div>

            <div className="summoner__searchWrap">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t.searchPlaceholder}
                sortValue={sort}
                onSortChange={setSort}
                sortOptions={SORT_OPTIONS}
                showSort
              />
            </div>

            <p className="summoner__subtitle">{t.subtitle}</p>
          </header>

          {status === "loading" && (
            <p className="summoner__status">{t.loading}</p>
          )}

          {status === "error" && (
            <p className="summoner__status summoner__status--error">
              {t.error}
            </p>
          )}

          {status === "success" && filteredSpells.length === 0 && (
            <div className="summoner__empty">
              <h2 className="summoner__emptyTitle">{t.empty}</h2>
            </div>
          )}

          {status === "success" && filteredSpells.length > 0 && (
            <>
              <SpellSection
                title={t.standardTitle}
                subtitle={t.standardSubtitle}
                spells={standardSpells}
                t={t}
              />

              <SpellSection
                title={t.specialTitle}
                subtitle={t.specialSubtitle}
                spells={specialSpells}
                t={t}
              />
            </>
          )}
        </div>
      </section>
    </main>
  );
}