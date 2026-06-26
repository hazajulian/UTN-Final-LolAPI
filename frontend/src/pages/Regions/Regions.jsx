// Regions.jsx
// Página principal de regiones con cards compactas y acceso al detalle.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./Regions.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3010";

function normalizeList(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.regions)) return response.regions;
  if (Array.isArray(response?.items)) return response.items;

  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data?.regions)) return response.data.regions;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  return [];
}

function getRegionId(region) {
  return region?.regionId || region?.id || region?.slug || region?.key || region?.name;
}

function getRegionBanner(region) {
  return (
    region?.bannerUrl ||
    region?.imageUrl ||
    region?.splashUrl ||
    region?.backgroundUrl ||
    ""
  );
}

function getRegionCrest(region) {
  return region?.crestUrl || region?.iconUrl || "";
}

function getRegionDescription(region) {
  return (
    region?.summary ||
    region?.shortDescription ||
    region?.description ||
    region?.title ||
    ""
  );
}

function sortRegions(list) {
  return [...list].sort((a, b) =>
    String(a?.name || "").localeCompare(String(b?.name || ""), undefined, {
      sensitivity: "base",
    })
  );
}

export default function Regions() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = translations[language].regionsPage;
  const apiLang = language === "ES" ? "es" : "en";

  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goToDetail = (region) => {
    const id = getRegionId(region);
    if (!id) return;

    navigate(`/regions/${id}`);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [language]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function loadRegions() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/v1/regions?lang=${apiLang}`, {
          signal: controller.signal,
          headers: { "Accept-Language": apiLang },
        });

        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();
        const list = normalizeList(data);

        if (alive) {
          setRegions(sortRegions(list));
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        if (alive) {
          setError(t.error);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadRegions();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [apiLang, t.error]);

  return (
    <main className="region">
      <section className="region__panel" aria-label={t.explorerAria}>
        <header className="region__hero">
          <div className="region__titleRow">
            <span className="region__stick" aria-hidden="true" />
            <h1 className="region__title">{t.title}</h1>
            <span className="region__stick" aria-hidden="true" />
          </div>

          <p className="region__subtitle">{t.subtitle}</p>
        </header>

        {loading && <p className="region__status">{t.loading}</p>}

        {error && <p className="region__status region__status--error">{error}</p>}

        {!loading && !error && (
          <div className="region__content">
            {regions.length > 0 ? (
              <section className="region__grid" aria-label={t.allRegionsAria}>
                {regions.map((region) => {
                  const id = getRegionId(region);
                  const banner = getRegionBanner(region);
                  const crest = getRegionCrest(region);
                  const description = getRegionDescription(region);
                  const name = region?.name || t.unknownRegion;

                  return (
                    <button
                      key={id}
                      type="button"
                      className="region__card"
                      onClick={() => goToDetail(region)}
                      title={name}
                    >
                      <span className="region__banner">
                        {banner ? (
                          <img
                            className="region__img"
                            src={banner}
                            alt={name}
                            loading="lazy"
                          />
                        ) : (
                          <span className="region__fallback">{name}</span>
                        )}

                        <span className="region__shade" aria-hidden="true" />
                      </span>

                      <span className="region__body">
                        <span className="region__head">
                          <span className="region__crestBox">
                            {crest ? (
                              <img
                                className="region__crest"
                                src={crest}
                                alt=""
                                loading="lazy"
                                aria-hidden="true"
                              />
                            ) : (
                              <span className="region__crestFallback" aria-hidden="true">
                                {String(name || "?").charAt(0)}
                              </span>
                            )}
                          </span>

                          <span className="region__nameBox">
                            <span className="region__name">{name}</span>

                            {region.title && (
                              <span className="region__tagline">{region.title}</span>
                            )}
                          </span>
                        </span>

                        {description && (
                          <span className="region__desc">{description}</span>
                        )}

                        <span className="region__bottom">
                          <span className="region__cta">{t.viewRegion}</span>
                          <span className="region__arrow" aria-hidden="true">
                            →
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </section>
            ) : (
              <div className="region__empty">
                <p>{t.empty}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}