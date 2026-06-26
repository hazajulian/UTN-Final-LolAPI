// Champions.jsx
// Página de campeones con listado, búsqueda, orden y agrupado.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { SearchBar } from "../../components/SearchBar/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
import { getChampions, getChampionById } from "../../services/api";

import "./Champions.css";

const FILTER_OPTIONS = [
  { value: "all", labelKey: "filterAll" },
  { value: "positions", labelKey: "filterPositions" },
  { value: "classes", labelKey: "filterClasses" },
  { value: "regions", labelKey: "filterRegions" },
];

const POSITION_ORDER = ["Top", "Jungle", "Mid", "ADC", "Support"];
const CLASS_ORDER = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];

const SORT_OPTIONS = [
  { value: "name-asc", labelKey: "sortAZ" },
  { value: "name-desc", labelKey: "sortZA" },
];

const POSITION_KEYS = {
  Top: "positionTop",
  Jungle: "positionJungle",
  Mid: "positionMid",
  ADC: "positionADC",
  Support: "positionSupport",
};

const CLASS_KEYS = {
  Assassin: "roleAssassin",
  Fighter: "roleFighter",
  Mage: "roleMage",
  Marksman: "roleMarksman",
  Support: "roleSupport",
  Tank: "roleTank",
};

const REGION_KEYS = {
  "Bandle City": "regionBandle",
  Bilgewater: "regionBilge",
  Demacia: "regionDemacia",
  Freljord: "regionFreljord",
  Ionia: "regionIonia",
  Ixtal: "regionIxtal",
  Noxus: "regionNoxus",
  Piltover: "regionPiltover",
  "Shadow Isles": "regionShadow",
  Shurima: "regionShurima",
  Targon: "regionTargon",
  Zaun: "regionZaun",
  Runeterra: "regionRuneterra",
  "The Void": "regionVoid",
};

function normalizeList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

function normalizeDetail(detail) {
  return detail?.data ? detail.data : detail;
}

function sortByName(list, sortValue) {
  const direction = sortValue === "name-desc" ? -1 : 1;
  const copy = Array.isArray(list) ? [...list] : [];

  return copy.sort((a, b) => {
    const firstName = String(a?.name ?? "");
    const secondName = String(b?.name ?? "");

    return (
      firstName.localeCompare(secondName, undefined, { sensitivity: "base" }) *
      direction
    );
  });
}

function translateFromMap(value, map, t) {
  return t[map[value]] ?? String(value).toUpperCase();
}

function ChampionCard({ champion }) {
  return (
    <Link
      to={`/champions/${champion.id}`}
      className="champions__card"
      title={champion.name}
    >
      <span className="champions__thumb">
        <img
          className="champions__img"
          src={champion.iconUrl}
          alt={champion.name}
          loading="lazy"
        />
      </span>

      <span className="champions__name">{champion.name}</span>
    </Link>
  );
}

export default function Champions() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const t = translations[language].champions;
  const apiLang = language === "EN" ? "en" : "es";
  const storageKey = user ? `favorites_${user.id}` : "favorites_guest";

  const dropdownRef = useRef(null);

  const [rawSearch, setRawSearch] = useState("");
  const [view, setView] = useState("all");
  const [sortValue, setSortValue] = useState("name-asc");

  const [allChamps, setAllChamps] = useState([]);
  const [champDetails, setChampDetails] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);

  const filterOptions = useMemo(
    () =>
      FILTER_OPTIONS.map((option) => ({
        ...option,
        label: t[option.labelKey],
      })),
    [t]
  );

  const currentViewLabel =
    filterOptions.find((option) => option.value === view)?.label ||
    filterOptions[0]?.label;

  const filteredChamps = useMemo(() => {
    const query = rawSearch.trim().toLowerCase();

    const base = query
      ? allChamps.filter((champion) =>
          String(champion.name || "").toLowerCase().includes(query)
        )
      : allChamps;

    return sortByName(base, sortValue);
  }, [allChamps, rawSearch, sortValue]);

  const uniqueSearchChamps = useMemo(() => {
    if (!rawSearch.trim()) return [];

    const unique = {};

    filteredChamps.forEach((champion) => {
      unique[champion.id] = champion;
    });

    return sortByName(Object.values(unique), sortValue);
  }, [filteredChamps, rawSearch, sortValue]);

  const regionGroups = useMemo(() => {
    const groups = {};

    filteredChamps.forEach((champion) => {
      const region = champion.region || "Unknown";
      groups[region] = groups[region] || [];
      groups[region].push(champion);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, champions]) => [region, sortByName(champions, sortValue)]);
  }, [filteredChamps, sortValue]);

  const classGroups = useMemo(() => {
    const groups = {};

    champDetails.forEach((champion) => {
      (champion.roles || []).forEach((role) => {
        groups[role] = groups[role] || [];
        groups[role].push(champion);
      });
    });

    return CLASS_ORDER.filter((role) => groups[role]).map((role) => [
      role,
      sortByName(groups[role], sortValue),
    ]);
  }, [champDetails, sortValue]);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  useEffect(() => {
    let isMounted = true;

    async function loadAllChampions() {
      try {
        setLoading(true);
        setError(null);

        const limit = 100;
        let page = 1;
        let champions = [];

        while (isMounted) {
          const response = await getChampions({ page, limit, lang: apiLang });
          const list = normalizeList(response);

          champions = champions.concat(list);

          const totalPages = response?.meta?.totalPages;

          if (totalPages) {
            if (page >= totalPages) break;

            page += 1;
            continue;
          }

          if (!list.length || list.length < limit) break;

          page += 1;
        }

        if (isMounted) {
          setAllChamps(champions);
        }
      } catch {
        if (isMounted) {
          setError(t.errorLoad);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllChampions();

    return () => {
      isMounted = false;
    };
  }, [apiLang, t.errorLoad]);

  useEffect(() => {
    let isMounted = true;

    async function loadChampionDetails() {
      if (view !== "classes") {
        setChampDetails([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const details = await Promise.all(
          filteredChamps.map((champion) =>
            getChampionById(champion.id, { lang: apiLang })
          )
        );

        if (isMounted) {
          setChampDetails(details.map(normalizeDetail));
        }
      } catch {
        if (isMounted) {
          setError(t.errorLoad);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadChampionDetails();

    return () => {
      isMounted = false;
    };
  }, [apiLang, view, filteredChamps, t.errorLoad]);

  return (
    <main className="champions">
      <section className="champions__panel" aria-label={t.explorerAria}>
        <header className="champions__hero">
          <div className="champions__titleRow">
            <span className="champions__stick" aria-hidden="true" />
            <h1 className="champions__title">{t.title}</h1>
            <span className="champions__stick" aria-hidden="true" />
          </div>

          <div className="champions__searchWrap" aria-label={t.searchFiltersAria}>
            <div className="champions__searchBarFrame">
              <div className="champions__filter" ref={dropdownRef}>
                <button
                  className={`champions__filterBtn ${
                    filterOpen ? "is-open" : ""
                  }`}
                  type="button"
                  onClick={() => setFilterOpen((open) => !open)}
                  aria-haspopup="listbox"
                  aria-expanded={filterOpen}
                  aria-label={t.filterViewAria}
                >
                  <span className="champions__filterLabel">
                    {currentViewLabel}
                  </span>

                  <span className="champions__caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {filterOpen && (
                  <ul
                    className="champions__filterList"
                    role="listbox"
                    aria-label={t.filterViewAria}
                  >
                    {filterOptions
                      .filter((option) => option.value !== view)
                      .map((option) => (
                        <li
                          key={option.value}
                          className="champions__filterItem"
                          role="option"
                          aria-selected={false}
                          onClick={(event) => {
                            event.stopPropagation();
                            setView(option.value);
                            setFilterOpen(false);
                          }}
                        >
                          {option.label}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              <SearchBar
                value={rawSearch}
                onChange={setRawSearch}
                className="search-bar"
                placeholder={t.searchPlaceholder}
                showSort
                sortValue={sortValue}
                onSortChange={setSortValue}
                sortOptions={SORT_OPTIONS}
              />
            </div>

            <p className="champions__hint">
              {rawSearch ? t.searchHint : t.browseHint}
            </p>
          </div>
        </header>

        {loading && (
          <p className="champions__status champions__status--loading">
            {t.loading}
          </p>
        )}

        {error && (
          <p className="champions__status champions__status--error">{error}</p>
        )}

        {!loading && !error && (
          <div className="champions__content">
            {rawSearch ? (
              <section
                className="champions__grid"
                aria-label={t.searchResultsAria}
              >
                {uniqueSearchChamps.map((champion) => (
                  <ChampionCard key={champion.id} champion={champion} />
                ))}

                {uniqueSearchChamps.length === 0 && (
                  <div className="champions__empty">
                    <p className="champions__emptyTitle">
                      {t.noChampionsFound}
                    </p>
                    <p className="champions__emptyText">
                      {t.tryAnotherSearch}
                    </p>
                  </div>
                )}
              </section>
            ) : (
              <>
                {view === "all" && (
                  <section
                    className="champions__grid"
                    aria-label={t.allChampionsAria}
                  >
                    {filteredChamps.map((champion) => (
                      <ChampionCard key={champion.id} champion={champion} />
                    ))}
                  </section>
                )}

                {view === "positions" &&
                  POSITION_ORDER.map((position) => {
                    const champions = filteredChamps.filter((champion) =>
                      (champion.positions || []).includes(position)
                    );

                    if (!champions.length) return null;

                    return (
                      <section
                        key={position}
                        className="champions__section"
                        aria-label={translateFromMap(position, POSITION_KEYS, t)}
                      >
                        <h2 className="champions__sectionTitle">
                          {translateFromMap(position, POSITION_KEYS, t)}
                        </h2>

                        <div className="champions__grid champions__grid--section">
                          {champions.map((champion) => (
                            <ChampionCard
                              key={champion.id}
                              champion={champion}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}

                {view === "regions" &&
                  regionGroups.map(([region, champions]) => (
                    <section
                      key={region}
                      className="champions__section"
                      aria-label={translateFromMap(region, REGION_KEYS, t)}
                    >
                      <h2 className="champions__sectionTitle">
                        {translateFromMap(region, REGION_KEYS, t)}
                      </h2>

                      <div className="champions__grid champions__grid--section">
                        {champions.map((champion) => (
                          <ChampionCard
                            key={champion.id}
                            champion={champion}
                          />
                        ))}
                      </div>
                    </section>
                  ))}

                {view === "classes" &&
                  classGroups.map(([role, champions]) => (
                    <section
                      key={role}
                      className="champions__section"
                      aria-label={translateFromMap(role, CLASS_KEYS, t)}
                    >
                      <h2 className="champions__sectionTitle">
                        {translateFromMap(role, CLASS_KEYS, t)}
                      </h2>

                      <div className="champions__grid champions__grid--section">
                        {champions.map((champion) => (
                          <ChampionCard
                            key={champion.id}
                            champion={champion}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}