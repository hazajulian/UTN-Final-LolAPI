// RegionDetail.jsx
// Detalle visual de regiones con lore, campeones relacionados y galería.

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExpandAlt,
  FaTimes,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./RegionDetail.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3010";
const DDRAGON_VERSION = import.meta.env.VITE_DDRAGON_VERSION || "15.24.1";
console.log("DDRAGON_VERSION:", DDRAGON_VERSION);
const PLACEHOLDER_IMG = "https://static.thenounproject.com/png/104062-200.png";

function normalizeRegion(data) {
  return data?.data || data?.region || data;
}

function safeArr(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeChampionId(name) {
  const raw = String(name || "").trim();

  const specialCases = {
    "Nunu & Willump": "Nunu",
    "Maestro Yi": "MasterYi",
    "Master Yi": "MasterYi",
    Wukong: "MonkeyKing",
    LeBlanc: "Leblanc",
    "Kai'Sa": "Kaisa",
    "Cho'Gath": "Chogath",
    "Kha'Zix": "Khazix",
    "Rek'Sai": "RekSai",
    "Vel'Koz": "Velkoz",
    "Kog'Maw": "KogMaw",
    "Bel'Veth": "Belveth",
    "Dr. Mundo": "DrMundo",
    "Renata Glasc": "Renata",
    "Miss Fortune": "MissFortune",
    "Tahm Kench": "TahmKench",
    "Twisted Fate": "TwistedFate",
    "Jarvan IV": "JarvanIV",
    "Xin Zhao": "XinZhao",
  };

  if (specialCases[raw]) return specialCases[raw];

  return raw
    .replace(/['’.\s]/g, "")
    .replace(/&/g, "")
    .replace(/-/g, "");
}

function getChampionIcon(name) {
  const championId = normalizeChampionId(name);

  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championId}.png`;
}

function flattenGallery(sections) {
  return safeArr(sections).flatMap((section) =>
    safeArr(section.entries).map((entry) => ({
      ...entry,
      sectionTitle: section.title,
    }))
  );
}

export default function RegionDetail() {
  const { id } = useParams();
  const { language } = useLanguage();

  const t = translations[language].regionDetail;
  const apiLang = language === "ES" ? "es" : "en";

  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const galleryItems = useMemo(
    () => flattenGallery(region?.sections),
    [region?.sections]
  );

  const selectedEntry =
    selectedImageIndex !== null ? galleryItems[selectedImageIndex] : null;

  const closeGallery = () => setSelectedImageIndex(null);

  const goToPreviousImage = () => {
    if (!galleryItems.length || selectedImageIndex === null) return;

    setSelectedImageIndex((current) =>
      current === 0 ? galleryItems.length - 1 : current - 1
    );
  };

  const goToNextImage = () => {
    if (!galleryItems.length || selectedImageIndex === null) return;

    setSelectedImageIndex((current) =>
      current === galleryItems.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [id, language]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function loadRegion() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/v1/regions/${id}?lang=${apiLang}`, {
          signal: controller.signal,
          headers: { "Accept-Language": apiLang },
        });

        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();

        if (!alive) return;

        setRegion(normalizeRegion(data));
      } catch (error) {
        if (error.name === "AbortError") return;
        if (!alive) return;

        setRegion(null);
        setError(t.error);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadRegion();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id, apiLang, t.error]);

  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") goToPreviousImage();
      if (event.key === "ArrowRight") goToNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("rd-modal-open");

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("rd-modal-open");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageIndex, galleryItems.length]);

  if (loading) {
    return <main className="rd-state">{t.loading}</main>;
  }

  if (error || !region) {
    return <main className="rd-state rd-state--error">{error || t.error}</main>;
  }

  const {
    name,
    title,
    bannerUrl,
    iconUrl,
    crestUrl,
    summary,
    description,
    culture,
  } = region;

  const champions = safeArr(region.champions);
  const sections = safeArr(region.sections);

  return (
    <main className="rd">
      {selectedEntry && (
        <section
          className="rd-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedEntry.title}
          onClick={closeGallery}
        >
          <div className="rd-modal__inner" onClick={(event) => event.stopPropagation()}>
            <button
              className="rd-modal__close"
              type="button"
              onClick={closeGallery}
              aria-label={t.close}
              title={t.close}
            >
              <FaTimes />
            </button>

            <button
              className="rd-modal__arrow rd-modal__arrow--left"
              type="button"
              onClick={goToPreviousImage}
              aria-label={t.previous}
              title={t.previous}
            >
              <FaChevronLeft />
            </button>

            <button
              className="rd-modal__arrow rd-modal__arrow--right"
              type="button"
              onClick={goToNextImage}
              aria-label={t.next}
              title={t.next}
            >
              <FaChevronRight />
            </button>

            <div className="rd-modal__imageBox">
              <img
                className="rd-modal__image"
                src={selectedEntry.imageUrl || PLACEHOLDER_IMG}
                alt={selectedEntry.title}
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_IMG;
                }}
              />
            </div>

            <footer className="rd-modal__caption">
              <span className="rd-modal__section">{selectedEntry.sectionTitle}</span>
              <h3 className="rd-modal__title">{selectedEntry.title}</h3>
              <p className="rd-modal__text">{selectedEntry.text}</p>
              <span className="rd-modal__count">
                {selectedImageIndex + 1}/{galleryItems.length}
              </span>
            </footer>
          </div>
        </section>
      )}

      <section className="rd__panel">
        <header className="rd__hero">
          <img
            className="rd__heroImg"
            src={bannerUrl || PLACEHOLDER_IMG}
            alt={name}
            loading="eager"
            decoding="async"
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER_IMG;
            }}
          />

          <div className="rd__heroOverlay" />

          <div className="rd__heroContent">
            <div className="rd__heroText">
              <span className="rd__kicker">{t.region}</span>
              <h1 className="rd__title">{name}</h1>

              {title && <p className="rd__subtitle">{title}</p>}
              {summary && <p className="rd__intro">{summary}</p>}
            </div>

            <div className="rd__crestBox">
              <img
                className="rd__crest"
                src={crestUrl || iconUrl || PLACEHOLDER_IMG}
                alt={`${name} ${t.crestAlt}`}
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_IMG;
                }}
              />
            </div>
          </div>
        </header>

        <section className="rd__loreBlock">
          {summary && (
            <article className="rd__loreCard rd__loreCard--main">
              <h2 className="rd__sectionTitle">{t.summary}</h2>
              <p className="rd__text rd__text--lead">{summary}</p>
            </article>
          )}

          <div className="rd__loreColumns">
            {description && (
              <article className="rd__loreCard">
                <h2 className="rd__sectionTitle">{t.history}</h2>
                <p className="rd__text">{description}</p>
              </article>
            )}

            {culture && (
              <article className="rd__loreCard">
                <h2 className="rd__sectionTitle">{t.culture}</h2>
                <p className="rd__text">{culture}</p>
              </article>
            )}
          </div>
        </section>

        {champions.length > 0 && (
          <section className="rd__championsBlock">
            <div className="rd__blockHead">
              <h2 className="rd__sectionTitle">{t.champions}</h2>
            </div>

            <div className="rd__championsList">
              {champions.map((champion) => {
                const championId = normalizeChampionId(champion);

                return (
                  <Link
                    key={champion}
                    className="rd__championCard"
                    to={`/champions/${championId}`}
                    title={champion}
                  >
                    <span className="rd__championIconBox">
                      <img
                        className="rd__championIcon"
                        src={getChampionIcon(champion)}
                        alt={champion}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                      />
                    </span>

                    <span className="rd__championName">{champion}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="rd__galleryBlock">
          <div className="rd__blockHead">
            <h2 className="rd__sectionTitle">{t.gallery}</h2>
          </div>

          {sections.length ? (
            <div className="rd__sections">
              {sections.map((section) => (
                <article className="rd__regionSection" key={section.title}>
                  <header className="rd__regionSectionHead">
                    <h3 className="rd__regionSectionTitle">{section.title}</h3>
                  </header>

                  <div className="rd__entryGrid">
                    {safeArr(section.entries).map((entry, index) => {
                      const globalIndex = galleryItems.findIndex(
                        (item) =>
                          item.sectionTitle === section.title &&
                          item.title === entry.title &&
                          item.imageUrl === entry.imageUrl
                      );

                      return (
                        <article
                          className="rd__entryCard"
                          key={`${section.title}-${entry.title}-${index}`}
                        >
                          <button
                            className="rd__entryImageButton"
                            type="button"
                            onClick={() => setSelectedImageIndex(globalIndex)}
                            aria-label={`${t.expand}: ${entry.title}`}
                          >
                            <img
                              className="rd__entryImage"
                              src={entry.imageUrl || PLACEHOLDER_IMG}
                              alt={entry.title}
                              loading="lazy"
                              decoding="async"
                              onError={(event) => {
                                event.currentTarget.src = PLACEHOLDER_IMG;
                              }}
                            />

                            <span className="rd__entryExpand">
                              <FaExpandAlt />
                            </span>
                          </button>

                          <div className="rd__entryBody">
                            <h4 className="rd__entryTitle">{entry.title}</h4>
                            <p className="rd__entryText">{entry.text}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rd__empty">
              <p>{t.noSections}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}