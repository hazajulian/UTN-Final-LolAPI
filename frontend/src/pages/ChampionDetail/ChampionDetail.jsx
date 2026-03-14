// ChampionDetail.jsx (layout v4) — COHERENT with Home
// FIXES / UPDATES:
// 1) Always scrolls to top on id/lang change
// 2) Translates REGION / ROLES / POSITIONS using local i18n dicts (en.js / es.js)
// 3) Dual skin rendering (wide splash + tall loading) — CSS decides what to show
// 4) Fast skins: preloads current + prev/next (both formats)
// 5) "View skin" opens an in-page overlay (modal) with close (X)
// 6) Fix console warning: use fetchPriority (NOT fetchpriority)
// 7) ✅ NEW: arrows INSIDE overlay (modal) + keyboard ← →

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaChevronLeft,
  FaChevronRight,
  FaExpandAlt,
  FaTimes,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

// UI i18n (labels + dicts)
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

import "./ChampionDetail.css";

const API_URL = "http://localhost:3010/api/v1";
const PLACEHOLDER_IMG = "https://static.thenounproject.com/png/104062-200.png";

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function preloadImage(src) {
  if (!src) return;
  const img = new Image();
  img.decoding = "async";
  img.src = src;
}

function preloadMany(srcs) {
  safeArr(srcs).forEach(preloadImage);
}

/** Try dicts in multiple places to avoid “no funciona” if your keys differ */
function getDict(t, key) {
  return (
    t?.[key] ||
    t?.championDetail?.[key] ||
    t?.championDetail?.dicts?.[key] ||
    {}
  );
}

/** Normaliza valores para poder matchear keys distintas: "Mage" vs "MAGE", "Runeterra" vs "RUNETERRA", etc. */
function normalizeKey(v) {
  if (v === null || v === undefined) return "";
  const s = String(v).trim();
  return s
    .replace(/\s+/g, " ")
    .replace(/[’'"]/g, "")
    .replace(/[().,:/\\-]+/g, " ")
    .trim();
}

function buildKeyVariants(value) {
  const base = normalizeKey(value);
  if (!base) return [];

  const lower = base.toLowerCase();
  const upper = base.toUpperCase();

  const snakeLower = lower.replace(/\s+/g, "_");
  const snakeUpper = upper.replace(/\s+/g, "_");

  const dashLower = lower.replace(/\s+/g, "-");
  const dashUpper = upper.replace(/\s+/g, "-");

  // Title Case simple
  const title = lower.replace(/\b\w/g, (m) => m.toUpperCase());

  // Sin espacios (por si el dict viene pegado)
  const nospaceLower = lower.replace(/\s+/g, "");
  const nospaceUpper = upper.replace(/\s+/g, "");

  // Algunas APIs devuelven listas como string con comas
  return [
    base,
    lower,
    upper,
    title,
    snakeLower,
    snakeUpper,
    dashLower,
    dashUpper,
    nospaceLower,
    nospaceUpper,
  ];
}

function translateValue(t, dictKey, value) {
  if (!value) return "-";
  const dict = getDict(t, dictKey);
  if (!dict || typeof dict !== "object") return value;

  // Direct match first
  if (dict[value]) return dict[value];

  // Try variants (case/format)
  const variants = buildKeyVariants(value);
  for (const k of variants) {
    if (dict[k]) return dict[k];
  }

  return value;
}

function translateList(t, dictKey, values) {
  // values can be array OR comma-separated string
  let arr = [];

  if (Array.isArray(values)) {
    arr = values;
  } else if (typeof values === "string") {
    arr = values
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  } else {
    arr = [];
  }

  if (!arr.length) return "-";
  return arr.map((v) => translateValue(t, dictKey, v)).join(", ");
}

/**
 * Fiddlesticks special case:
 * Some skins from LoL Wiki / remaster may not have proper loading (vertical) like Data Dragon.
 * We keep wiki loadingUrl when it’s a wiki URL, but if loadingUrl is the old ddragon loading,
 * we can prefer splashUrl for the "tall" slot to avoid the outdated verticals.
 */
function resolveSkinUrls(champId, skin) {
  const splash = skin?.splashUrl || skin?.imageUrl || "";
  const loading = skin?.loadingUrl || "";

  // if there is no loading, fallback to splash
  if (!loading) {
    return {
      splashUrl: splash || PLACEHOLDER_IMG,
      loadingUrl: splash || PLACEHOLDER_IMG,
    };
  }

  // Keep wiki (or non-ddragon) loading if provided
  const isDdragonLoading =
    typeof loading === "string" && loading.includes("/cdn/img/champion/loading/");
  const isWiki =
    typeof loading === "string" && loading.includes("wiki.leagueoflegends.com");

  if (isWiki) {
    return {
      splashUrl: splash || PLACEHOLDER_IMG,
      loadingUrl: loading || splash || PLACEHOLDER_IMG,
    };
  }

  // Prefer splash for Fiddle "tall" on ddragon loading (outdated look) for most skins.
  if (champId === "Fiddlesticks" && isDdragonLoading && splash) {
    return {
      splashUrl: splash || PLACEHOLDER_IMG,
      loadingUrl: splash || PLACEHOLDER_IMG,
    };
  }

  return {
    splashUrl: splash || PLACEHOLDER_IMG,
    loadingUrl: loading || splash || PLACEHOLDER_IMG,
  };
}

export default function ChampionDetail({ lang = "EN" }) {
  const { id } = useParams();
  const { user } = useAuth();

  // UI text (labels + dicts)
  const t = lang === "ES" ? es : en;
  const apiLang = lang === "ES" ? "es" : "en";

  const favKey = user?.id ? `favorites_${user.id}` : null;

  const [champ, setChamp] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // Favorites
  const [isFav, setIsFav] = useState(false);

  // Skins
  const [skinIndex, setSkinIndex] = useState(0);
  const [skinLoaded, setSkinLoaded] = useState({ splash: false, loading: false });

  // Overlay
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const showToast = (txt) => {
    setToast(txt);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1600);
  };

  // ===========================
  // Always start at top when opening a champion
  // ===========================
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [id, lang]);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ===========================
  // Close overlay on ESC + navigate with arrows
  // ===========================
  useEffect(() => {
    if (!isOverlayOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setIsOverlayOpen(false);
      if (e.key === "ArrowLeft") prevSkin();
      if (e.key === "ArrowRight") nextSkin();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverlayOpen, skinIndex]);

  // ===========================
  // Fetch champion (API provides translations for lore/skills/etc)
  // ===========================
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);

        const url = `${API_URL}/champions/${id}?lang=${apiLang}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": apiLang },
        });

        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        // Fix default skin label (and avoid "default")
        if (data?.skins?.[0]?.name?.toLowerCase?.() === "default") {
          data.skins[0].name = data.name;
        }

        if (!mounted) return;

        setChamp(data);
        setSkinIndex(0);
        setSkinLoaded({ splash: false, loading: false });
        setIsOverlayOpen(false);
      } catch (e) {
        if (!mounted) return;
        setChamp(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id, apiLang]);

  // ===========================
  // Favorites from localStorage
  // ===========================
  useEffect(() => {
    if (!favKey) return;
    const favs = JSON.parse(localStorage.getItem(favKey)) || [];
    setIsFav(favs.includes(id));
  }, [id, favKey]);

  // ===========================
  // Derived data
  // ===========================
  const safeChamp = champ || {};

  const name = safeChamp.name || "";
  const title = safeChamp.title || "";

  const regionRaw = safeChamp.region || "-";
  const rolesRaw = safeChamp.roles || [];
  const positionsRaw = safeChamp.positions || [];

  const region =
    translateValue(t, "regions", regionRaw) === regionRaw
      ? translateValue(t, "region", regionRaw)
      : translateValue(t, "regions", regionRaw);

  const rolesTxtPrimary = translateList(t, "rolesDict", rolesRaw);
  const rolesTxtSafe =
    rolesTxtPrimary === "-" || rolesTxtPrimary === rolesRaw?.join?.(", ")
      ? translateList(t, "roles", rolesRaw)
      : rolesTxtPrimary;

  const posTxtPrimary = translateList(t, "positionsDict", positionsRaw);
  const posTxtSafe =
    posTxtPrimary === "-" || posTxtPrimary === positionsRaw?.join?.(", ")
      ? translateList(t, "positions", positionsRaw)
      : posTxtPrimary;

  const lore = safeChamp.lore || "";
  const allytips = safeChamp.allytips || [];
  const enemytips = safeChamp.enemytips || [];

  // Abilities (API already translated if ES)
  const origAbilities = safeChamp.abilities || { passive: {}, spells: [] };
  const passive = origAbilities.passive || {};
  const spells = safeArr(origAbilities.spells);

  // Skins
  const skins = safeArr(safeChamp.skins);
  const totalSkins = Math.max(1, skins.length);
  const idx = clamp(skinIndex, 0, totalSkins - 1);

  const currentSkin = skins[idx] || {};
  const champId = safeChamp.id || id || "";
  const { splashUrl: skinSplashUrl, loadingUrl: skinLoadingUrl } = resolveSkinUrls(
    champId,
    currentSkin
  );

  const skinName = currentSkin.name || t.championDetail?.noName || "No name";

  const prevIdx = idx === 0 ? totalSkins - 1 : idx - 1;
  const nextIdx = idx === totalSkins - 1 ? 0 : idx + 1;

  // Difficulty
  const infoObj = safeChamp.info || {};
  const diff = infoObj.difficulty || 0;
  const diffLevel = diff <= 3 ? 1 : diff <= 7 ? 2 : 3;
  const diffLabel =
    diffLevel === 1
      ? lang === "ES"
        ? "Fácil"
        : "Easy"
      : diffLevel === 2
      ? lang === "ES"
        ? "Media"
        : "Medium"
      : lang === "ES"
      ? "Difícil"
      : "Hard";

  // Stats translate (UI label translation)
  const stats = safeChamp.stats || {};
  const translateStat = (statKey) => {
    const dict = t.championDetail?.stats || {};
    return dict[statKey] || statKey;
  };

  // ===========================
  // Fast skins preload (current + neighbors, both formats)
  // ===========================
  useEffect(() => {
    if (!skins.length) return;

    const cur = resolveSkinUrls(champId, skins[idx] || {});
    const prev = resolveSkinUrls(champId, skins[prevIdx] || {});
    const next = resolveSkinUrls(champId, skins[nextIdx] || {});

    preloadMany([
      cur.splashUrl,
      cur.loadingUrl,
      prev.splashUrl,
      prev.loadingUrl,
      next.splashUrl,
      next.loadingUrl,
    ]);
  }, [champId, idx, prevIdx, nextIdx, skins]);

  // ===========================
  // Actions
  // ===========================
  const toggleFav = () => {
    if (!favKey) {
      showToast(lang === "ES" ? "Debes iniciar sesión" : "You must log in");
      return;
    }

    const favs = JSON.parse(localStorage.getItem(favKey)) || [];

    if (isFav) {
      const next = favs.filter((x) => x !== id);
      localStorage.setItem(favKey, JSON.stringify(next));
      setIsFav(false);
      showToast(lang === "ES" ? "Quitado de favoritos" : "Removed from favorites");
    } else {
      const next = [...favs, id];
      localStorage.setItem(favKey, JSON.stringify(next));
      setIsFav(true);
      showToast(lang === "ES" ? "Agregado a favoritos" : "Added to favorites");
    }
  };

  const goToSkin = (targetIdx) => {
    if (totalSkins <= 1) return;
    setSkinLoaded({ splash: false, loading: false });
    setSkinIndex(targetIdx);
  };

  const prevSkin = () => goToSkin(prevIdx);
  const nextSkin = () => goToSkin(nextIdx);

  const openOverlay = () => setIsOverlayOpen(true);
  const closeOverlay = () => setIsOverlayOpen(false);

  const overlayImg =
    skinSplashUrl || skinLoadingUrl || safeChamp.splashUrl || PLACEHOLDER_IMG;

  // ===========================
  // Render states
  // ===========================
  if (loading) {
    return (
      <div className="cd-loading">
        {t.championDetail?.loading || "Loading champion…"}
      </div>
    );
  }

  if (!champ) {
    return (
      <div className="cd-loading">
        {lang === "ES" ? "No se pudo cargar el campeón." : "Could not load champion."}
      </div>
    );
  }

  return (
    <div className="cd-wrap">
      {toast && <div className="cd-toast">{toast}</div>}

      {/* Overlay (in-page) */}
      {isOverlayOpen && (
        <div
          className="cd-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ES" ? "Vista de skin" : "Skin preview"}
          onClick={closeOverlay}
        >
          <div className="cd-overlayInner" onClick={(e) => e.stopPropagation()}>
            {/* ✅ overlay arrows */}
            <div className="cd-overlayNav" aria-label="skin navigation">
              <button
                className="cd-overlayArrow cd-overlayArrow--left"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevSkin();
                }}
                aria-label={lang === "ES" ? "Skin anterior" : "Previous skin"}
                title={lang === "ES" ? "Anterior" : "Previous"}
              >
                <FaChevronLeft />
              </button>

              <button
                className="cd-overlayArrow cd-overlayArrow--right"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextSkin();
                }}
                aria-label={lang === "ES" ? "Siguiente skin" : "Next skin"}
                title={lang === "ES" ? "Siguiente" : "Next"}
              >
                <FaChevronRight />
              </button>
            </div>

            <button
              className="cd-overlayClose"
              type="button"
              onClick={closeOverlay}
              aria-label={lang === "ES" ? "Cerrar" : "Close"}
              title={lang === "ES" ? "Cerrar" : "Close"}
            >
              <FaTimes />
            </button>

            <img
              className="cd-overlayImg"
              src={overlayImg}
              alt={skinName}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(e) => {
                if (e.currentTarget.dataset.fallback) return;
                e.currentTarget.dataset.fallback = "1";
                e.currentTarget.src = safeChamp.splashUrl || PLACEHOLDER_IMG;
              }}
            />

            <div className="cd-overlayCaption" title={skinName}>
              {skinName} ({idx + 1}/{totalSkins})
            </div>
          </div>
        </div>
      )}

      <section className="cd-panel">
        {/* Header */}
        <header className="cd-head">
          <div className="cd-title">
            <h1 className="cd-name">{name}</h1>
            <p className="cd-subtitle">{title}</p>
          </div>

          <button
            className="cd-fav"
            onClick={toggleFav}
            aria-label="favorite"
            aria-pressed={isFav}
            type="button"
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>
        </header>

        {/* TOP unified */}
        <section className="cd-topCard">
          {/* FULL-WIDTH Skin header */}
          <div className="cd-skinHeader">
            <div className="cd-skinHeaderLeft">
              <span className="cd-skinHeaderTitle">{name}</span>
              <span className="cd-skinHeaderCount">
                {idx + 1}/{totalSkins}
              </span>
            </div>

            <div className="cd-skinHeaderRight">
              <button className="cd-navBtn" onClick={prevSkin} aria-label="prev skin" type="button">
                <FaChevronLeft />
              </button>

              <button className="cd-navBtn" onClick={nextSkin} aria-label="next skin" type="button">
                <FaChevronRight />
              </button>

              <button
                className="cd-navBtn"
                onClick={openOverlay}
                aria-label={lang === "ES" ? "Ver skin" : "View skin"}
                type="button"
                title={lang === "ES" ? "Ver skin" : "View skin"}
              >
                <FaExpandAlt />
              </button>
            </div>
          </div>

          <div className="cd-topGrid">
            <div className="cd-skinBlock">
              <div className="cd-skinStage">
                <img
                  className={`cd-skinImg cd-skinImg--wide ${skinLoaded.splash ? "is-loaded" : ""}`}
                  src={skinSplashUrl || PLACEHOLDER_IMG}
                  alt={skinName}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => setSkinLoaded((s) => ({ ...s, splash: true }))}
                  onError={(e) => {
                    if (e.currentTarget.dataset.fallback) return;
                    e.currentTarget.dataset.fallback = "1";
                    e.currentTarget.src = safeChamp.splashUrl || PLACEHOLDER_IMG;
                  }}
                />

                <img
                  className={`cd-skinImg cd-skinImg--tall ${skinLoaded.loading ? "is-loaded" : ""}`}
                  src={skinLoadingUrl || skinSplashUrl || PLACEHOLDER_IMG}
                  alt={skinName}
                  loading="eager"
                  decoding="async"
                  data-skin-index={idx + 1}
                  onLoad={() => setSkinLoaded((s) => ({ ...s, loading: true }))}
                  onError={(e) => {
                    if (e.currentTarget.dataset.fallback) return;
                    e.currentTarget.dataset.fallback = "1";
                    e.currentTarget.src =
                      skinSplashUrl || safeChamp.splashUrl || PLACEHOLDER_IMG;
                  }}
                />
              </div>

              <div className="cd-skinCaption" title={skinName}>
                <span className="cd-skinCaptionK">{lang === "ES" ? "Skin" : "Skin"}</span>
                <span className="cd-skinCaptionV">{skinName}</span>
              </div>
            </div>

            <div className="cd-infoStack">
              <div className="cd-metaStrip" aria-label="meta strip">
                <div className="cd-metaPill">
                  <span className="cd-metaK">{t.championDetail?.region || "Region"}</span>
                  <span className="cd-metaV">{region}</span>
                </div>

                <div className="cd-metaPill">
                  <span className="cd-metaK">{t.championDetail?.roles || "Roles"}</span>
                  <span className="cd-metaV">{rolesTxtSafe}</span>
                </div>

                <div className="cd-metaPill">
                  <span className="cd-metaK">{t.championDetail?.positions || "Positions"}</span>
                  <span className="cd-metaV">{posTxtSafe}</span>
                </div>
              </div>

              <div className="cd-box">
                <h2 className="cd-h2">{t.championDetail?.lore || "Lore"}</h2>
                <p className="cd-p">{lore || t.championDetail?.noLore || "-"}</p>
              </div>

              <div className="cd-box cd-box--diff">
                <h2 className="cd-h2">{t.championDetail?.difficulty || "Difficulty"}</h2>

                <div className="cd-diffRow">
                  <div
                    className="cd-diffBar"
                    role="img"
                    aria-label={`${t.championDetail?.difficulty || "Difficulty"}: ${diff}/10`}
                    title={`${diff}/10`}
                  >
                    <span className={`cd-diffSeg ${diffLevel >= 1 ? "is-on" : ""}`} />
                    <span className={`cd-diffSeg ${diffLevel >= 2 ? "is-on" : ""}`} />
                    <span className={`cd-diffSeg ${diffLevel >= 3 ? "is-on" : ""}`} />
                  </div>

                  <span className="cd-diffLabel">{diffLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cd-tipsRow">
          <div className="cd-tipsHead">
            <h2 className="cd-h2">{lang === "ES" ? "Consejos" : "Tips"}</h2>
          </div>

          <div className="cd-tipsGrid">
            <div className="cd-tipBox cd-tipBox--ally">
              <h3 className="cd-h3">{lang === "ES" ? "Aliados" : "Allies"}</h3>
              <ul className="cd-list">
                {safeArr(allytips).length ? (
                  safeArr(allytips).map((x, i) => <li key={`ally-${i}`}>{x}</li>)
                ) : (
                  <li>{t.championDetail?.noTips || "-"}</li>
                )}
              </ul>
            </div>

            <div className="cd-tipBox cd-tipBox--enemy">
              <h3 className="cd-h3">{lang === "ES" ? "Enemigos" : "Enemies"}</h3>
              <ul className="cd-list">
                {safeArr(enemytips).length ? (
                  safeArr(enemytips).map((x, i) => <li key={`enemy-${i}`}>{x}</li>)
                ) : (
                  <li>{t.championDetail?.noTips || "-"}</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="cd-abilitiesBlock">
          <h2 className="cd-h2">{t.championDetail?.abilities || "Abilities"}</h2>

          <div className="cd-ability">
            <img className="cd-ico" src={passive?.iconUrl || PLACEHOLDER_IMG} alt="" />
            <div className="cd-abilityBody">
              <h3 className="cd-h3">
                {t.championDetail?.passive || "Passive"}:{" "}
                <span className="cd-abilityName">
                  {passive?.name || t.championDetail?.noName || "-"}
                </span>
              </h3>
              <p className="cd-p">
                {passive?.description || t.championDetail?.noDescription || "-"}
              </p>
            </div>
          </div>

          {safeArr(spells).map((s, i) => (
            <div className="cd-ability" key={`spell-${s?.key || i}`}>
              <img className="cd-ico" src={s.iconUrl || PLACEHOLDER_IMG} alt="" />
              <div className="cd-abilityBody">
                <h3 className="cd-h3">
                  {["Q", "W", "E", "R"][i]}:{" "}
                  <span className="cd-abilityName">
                    {s.name || t.championDetail?.noName || "-"}
                  </span>
                </h3>
                <p className="cd-p">
                  {s.description || t.championDetail?.noDescription || "-"}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="cd-statsBlock">
          <h2 className="cd-h2">{lang === "ES" ? "Estadísticas" : "Stats"}</h2>

          <div className="cd-stats">
            {Object.entries(stats).map(([k, v]) => (
              <div className="cd-stat" key={`stat-${k}`} title={`${translateStat(k)}: ${v}`}>
                <span className="cd-statK">{translateStat(k)}</span>
                <span className="cd-statV">{v}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
