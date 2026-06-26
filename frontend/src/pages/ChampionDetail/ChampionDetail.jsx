// ChampionDetail.jsx
// Detalle completo del campeón con skins, favoritos, habilidades y estadísticas.

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
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
import { api } from "../../services/api";

import "./ChampionDetail.css";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3010"}/api/v1`;
const PLACEHOLDER_IMG = "https://static.thenounproject.com/png/104062-200.png";

function safeArr(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
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

function normalizeKey(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .trim()
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

  return [
    base,
    lower,
    upper,
    lower.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    lower.replace(/\s+/g, "_"),
    upper.replace(/\s+/g, "_"),
    lower.replace(/\s+/g, "-"),
    upper.replace(/\s+/g, "-"),
    lower.replace(/\s+/g, ""),
    upper.replace(/\s+/g, ""),
  ];
}

function translateValue(dictionary = {}, value) {
  if (!value) return "-";
  if (dictionary[value]) return dictionary[value];

  const variants = buildKeyVariants(value);

  for (const key of variants) {
    if (dictionary[key]) return dictionary[key];
  }

  return value;
}

function translateList(dictionary = {}, values) {
  let list = [];

  if (Array.isArray(values)) {
    list = values;
  } else if (typeof values === "string") {
    list = values
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!list.length) return "-";

  return list.map((value) => translateValue(dictionary, value)).join(", ");
}

function resolveSkinUrls(champId, skin) {
  const splash = skin?.splashUrl || skin?.imageUrl || "";
  const loading = skin?.loadingUrl || "";

  if (!loading) {
    return {
      splashUrl: splash || PLACEHOLDER_IMG,
      loadingUrl: splash || PLACEHOLDER_IMG,
    };
  }

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

export default function ChampionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { language } = useLanguage();

  const t = translations[language].championDetail;
  const apiLang = language === "ES" ? "es" : "en";

  const [champ, setChamp] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const [isFav, setIsFav] = useState(false);

  const [skinIndex, setSkinIndex] = useState(0);
  const [skinLoaded, setSkinLoaded] = useState({ splash: false, loading: false });

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const showToast = (message) => {
    setToast(message);

    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setToast("");
    }, 1600);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [id, language]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadChampion() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/champions/${id}?lang=${apiLang}`, {
          signal: controller.signal,
          headers: { "Accept-Language": apiLang },
        });

        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();

        if (data?.skins?.[0]?.name?.toLowerCase?.() === "default") {
          data.skins[0].name = data.name;
        }

        if (!mounted) return;

        setChamp(data);
        setSkinIndex(0);
        setSkinLoaded({ splash: false, loading: false });
        setIsOverlayOpen(false);
      } catch {
        if (mounted) setChamp(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadChampion();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id, apiLang]);

  useEffect(() => {
    let alive = true;

    async function loadFavoriteState() {
      if (!user) {
        setIsFav(false);
        return;
      }

      try {
        const response = await api.get("/auth/favorites");
        const favorites = response.data?.favorites || [];

        if (!alive) return;

        setIsFav(
          favorites
            .map((favoriteId) => String(favoriteId).toLowerCase())
            .includes(String(id).toLowerCase())
        );
      } catch {
        if (alive) setIsFav(false);
      }
    }

    loadFavoriteState();

    return () => {
      alive = false;
    };
  }, [id, user]);

  const safeChamp = champ || {};

  const name = safeChamp.name || "";
  const title = safeChamp.title || "";

  const region = translateValue(t.regions, safeChamp.region || "-");
  const roles = translateList(t.rolesDict, safeChamp.roles || []);
  const positions = translateList(t.positionsDict, safeChamp.positions || []);

  const lore = safeChamp.lore || "";
  const allytips = safeChamp.allytips || [];
  const enemytips = safeChamp.enemytips || [];

  const abilities = safeChamp.abilities || { passive: {}, spells: [] };
  const passive = abilities.passive || {};
  const spells = safeArr(abilities.spells);

  const skins = safeArr(safeChamp.skins);
  const totalSkins = Math.max(1, skins.length);
  const currentIndex = clamp(skinIndex, 0, totalSkins - 1);

  const currentSkin = skins[currentIndex] || {};
  const champId = safeChamp.id || id || "";

  const { splashUrl: skinSplashUrl, loadingUrl: skinLoadingUrl } = resolveSkinUrls(
    champId,
    currentSkin
  );

  const skinName = currentSkin.name || t.noName;

  const prevIndex = currentIndex === 0 ? totalSkins - 1 : currentIndex - 1;
  const nextIndex = currentIndex === totalSkins - 1 ? 0 : currentIndex + 1;

  const info = safeChamp.info || {};
  const difficulty = info.difficulty || 0;
  const difficultyLevel = difficulty <= 3 ? 1 : difficulty <= 7 ? 2 : 3;

  const difficultyLabel =
    difficultyLevel === 1
      ? t.difficultyEasy
      : difficultyLevel === 2
      ? t.difficultyMedium
      : t.difficultyHard;

  const stats = safeChamp.stats || {};

  const translateStat = (statKey) => {
    return t.stats?.[statKey] || statKey;
  };

  const goToSkin = (targetIndex) => {
    if (totalSkins <= 1) return;

    setSkinLoaded({ splash: false, loading: false });
    setSkinIndex(targetIndex);
  };

  const prevSkin = () => goToSkin(prevIndex);
  const nextSkin = () => goToSkin(nextIndex);

  useEffect(() => {
    if (!isOverlayOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOverlayOpen(false);
      if (event.key === "ArrowLeft") prevSkin();
      if (event.key === "ArrowRight") nextSkin();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen, skinIndex]);

  useEffect(() => {
    if (!skins.length) return;

    const current = resolveSkinUrls(champId, skins[currentIndex] || {});
    const previous = resolveSkinUrls(champId, skins[prevIndex] || {});
    const next = resolveSkinUrls(champId, skins[nextIndex] || {});

    preloadMany([
      current.splashUrl,
      current.loadingUrl,
      previous.splashUrl,
      previous.loadingUrl,
      next.splashUrl,
      next.loadingUrl,
    ]);
  }, [champId, currentIndex, prevIndex, nextIndex, skins]);

  const toggleFav = async () => {
    if (!user) {
      showToast(t.mustLogin);
      return;
    }

    const previousState = isFav;
    const nextState = !isFav;

    setIsFav(nextState);
    showToast(nextState ? t.addedFavorite : t.removedFavorite);

    try {
      if (nextState) {
        await api.post(`/auth/favorites/${id}`);
      } else {
        await api.delete(`/auth/favorites/${id}`);
      }
    } catch (error) {
      setIsFav(previousState);
      showToast(error.response?.data?.message || t.favoriteUpdateError);
    }
  };

  const overlayImg =
    skinSplashUrl || skinLoadingUrl || safeChamp.splashUrl || PLACEHOLDER_IMG;

  if (loading) {
    return <div className="cd-loading">{t.loading}</div>;
  }

  if (!champ) {
    return <div className="cd-loading">{t.errorLoad}</div>;
  }

  return (
    <div className="cd-wrap">
      {toast && <div className="cd-toast">{toast}</div>}

      {isOverlayOpen && (
        <div
          className="cd-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t.skinPreview}
          onClick={() => setIsOverlayOpen(false)}
        >
          <div className="cd-overlayInner" onClick={(event) => event.stopPropagation()}>
            <div className="cd-overlayNav" aria-label={t.skinNavigation}>
              <button
                className="cd-overlayArrow cd-overlayArrow--left"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  prevSkin();
                }}
                aria-label={t.previousSkin}
                title={t.previous}
              >
                <FaChevronLeft />
              </button>

              <button
                className="cd-overlayArrow cd-overlayArrow--right"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  nextSkin();
                }}
                aria-label={t.nextSkin}
                title={t.next}
              >
                <FaChevronRight />
              </button>
            </div>

            <button
              className="cd-overlayClose"
              type="button"
              onClick={() => setIsOverlayOpen(false)}
              aria-label={t.close}
              title={t.close}
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
              onError={(event) => {
                if (event.currentTarget.dataset.fallback) return;

                event.currentTarget.dataset.fallback = "1";
                event.currentTarget.src = safeChamp.splashUrl || PLACEHOLDER_IMG;
              }}
            />

            <div className="cd-overlayCaption" title={skinName}>
              {skinName} ({currentIndex + 1}/{totalSkins})
            </div>
          </div>
        </div>
      )}

      <section className="cd-panel">
        <header className="cd-head">
          <div className="cd-title">
            <h1 className="cd-name">{name}</h1>
            <p className="cd-subtitle">{title}</p>
          </div>

          <button
            className="cd-fav"
            onClick={toggleFav}
            aria-label={isFav ? t.removeFromFavorites : t.addToFavorites}
            aria-pressed={isFav}
            type="button"
          >
            {isFav ? <FaHeart /> : <FaRegHeart />}
          </button>
        </header>

        <section className="cd-topCard">
          <div className="cd-skinHeader">
            <div className="cd-skinHeaderLeft">
              <span className="cd-skinHeaderTitle">{name}</span>
              <span className="cd-skinHeaderCount">
                {currentIndex + 1}/{totalSkins}
              </span>
            </div>

            <div className="cd-skinHeaderRight">
              <button
                className="cd-navBtn"
                onClick={prevSkin}
                aria-label={t.previousSkin}
                type="button"
              >
                <FaChevronLeft />
              </button>

              <button
                className="cd-navBtn"
                onClick={nextSkin}
                aria-label={t.nextSkin}
                type="button"
              >
                <FaChevronRight />
              </button>

              <button
                className="cd-navBtn"
                onClick={() => setIsOverlayOpen(true)}
                aria-label={t.viewSkin}
                title={t.viewSkin}
                type="button"
              >
                <FaExpandAlt />
              </button>
            </div>
          </div>

          <div className="cd-topGrid">
            <div className="cd-skinBlock">
              <div className="cd-skinStage">
                <img
                  className={`cd-skinImg cd-skinImg--wide ${
                    skinLoaded.splash ? "is-loaded" : ""
                  }`}
                  src={skinSplashUrl || PLACEHOLDER_IMG}
                  alt={skinName}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() =>
                    setSkinLoaded((state) => ({ ...state, splash: true }))
                  }
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallback) return;

                    event.currentTarget.dataset.fallback = "1";
                    event.currentTarget.src = safeChamp.splashUrl || PLACEHOLDER_IMG;
                  }}
                />

                <img
                  className={`cd-skinImg cd-skinImg--tall ${
                    skinLoaded.loading ? "is-loaded" : ""
                  }`}
                  src={skinLoadingUrl || skinSplashUrl || PLACEHOLDER_IMG}
                  alt={skinName}
                  loading="eager"
                  decoding="async"
                  data-skin-index={currentIndex + 1}
                  onLoad={() =>
                    setSkinLoaded((state) => ({ ...state, loading: true }))
                  }
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallback) return;

                    event.currentTarget.dataset.fallback = "1";
                    event.currentTarget.src =
                      skinSplashUrl || safeChamp.splashUrl || PLACEHOLDER_IMG;
                  }}
                />
              </div>

              <div className="cd-skinCaption" title={skinName}>
                <span className="cd-skinCaptionK">{t.skin}</span>
                <span className="cd-skinCaptionV">{skinName}</span>
              </div>
            </div>

            <div className="cd-infoStack">
              <div className="cd-metaStrip" aria-label={t.metaStrip}>
                <div className="cd-metaPill">
                  <span className="cd-metaK">{t.region}</span>
                  <span className="cd-metaV">{region}</span>
                </div>

                <div className="cd-metaPill">
                  <span className="cd-metaK">{t.roles}</span>
                  <span className="cd-metaV">{roles}</span>
                </div>

                <div className="cd-metaPill">
                  <span className="cd-metaK">{t.positions}</span>
                  <span className="cd-metaV">{positions}</span>
                </div>
              </div>

              <div className="cd-box">
                <h2 className="cd-h2">{t.lore}</h2>
                <p className="cd-p">{lore || t.noLore}</p>
              </div>

              <div className="cd-box cd-box--diff">
                <h2 className="cd-h2">{t.difficulty}</h2>

                <div className="cd-diffRow">
                  <div
                    className="cd-diffBar"
                    role="img"
                    aria-label={`${t.difficulty}: ${difficulty}/10`}
                    title={`${difficulty}/10`}
                  >
                    <span className={`cd-diffSeg ${difficultyLevel >= 1 ? "is-on" : ""}`} />
                    <span className={`cd-diffSeg ${difficultyLevel >= 2 ? "is-on" : ""}`} />
                    <span className={`cd-diffSeg ${difficultyLevel >= 3 ? "is-on" : ""}`} />
                  </div>

                  <span className="cd-diffLabel">{difficultyLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cd-tipsRow">
          <div className="cd-tipsHead">
            <h2 className="cd-h2">{t.tips}</h2>
          </div>

          <div className="cd-tipsGrid">
            <div className="cd-tipBox cd-tipBox--ally">
              <h3 className="cd-h3">{t.allies}</h3>

              <ul className="cd-list">
                {safeArr(allytips).length ? (
                  safeArr(allytips).map((tip, index) => (
                    <li key={`ally-${index}`}>{tip}</li>
                  ))
                ) : (
                  <li>{t.noTips}</li>
                )}
              </ul>
            </div>

            <div className="cd-tipBox cd-tipBox--enemy">
              <h3 className="cd-h3">{t.enemies}</h3>

              <ul className="cd-list">
                {safeArr(enemytips).length ? (
                  safeArr(enemytips).map((tip, index) => (
                    <li key={`enemy-${index}`}>{tip}</li>
                  ))
                ) : (
                  <li>{t.noTips}</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="cd-abilitiesBlock">
          <h2 className="cd-h2">{t.abilities}</h2>

          <div className="cd-ability">
            <img className="cd-ico" src={passive?.iconUrl || PLACEHOLDER_IMG} alt="" />

            <div className="cd-abilityBody">
              <h3 className="cd-h3">
                {t.passive}:{" "}
                <span className="cd-abilityName">{passive?.name || t.noName}</span>
              </h3>

              <p className="cd-p">{passive?.description || t.noDescription}</p>
            </div>
          </div>

          {safeArr(spells).map((spell, index) => (
            <div className="cd-ability" key={`spell-${spell?.key || index}`}>
              <img className="cd-ico" src={spell.iconUrl || PLACEHOLDER_IMG} alt="" />

              <div className="cd-abilityBody">
                <h3 className="cd-h3">
                  {["Q", "W", "E", "R"][index]}:{" "}
                  <span className="cd-abilityName">{spell.name || t.noName}</span>
                </h3>

                <p className="cd-p">{spell.description || t.noDescription}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="cd-statsBlock">
          <h2 className="cd-h2">{t.statsTitle}</h2>

          <div className="cd-stats">
            {Object.entries(stats).map(([key, value]) => (
              <div
                className="cd-stat"
                key={`stat-${key}`}
                title={`${translateStat(key)}: ${value}`}
              >
                <span className="cd-statK">{translateStat(key)}</span>
                <span className="cd-statV">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}