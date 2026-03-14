// Home.jsx
// Página principal: listado y explorador de campeones.
// Mantiene SearchBar como está (no se toca).
// - Panel central premium (coherente con Navbar).
// - Dropdown sólido (no se “mete” debajo del contenido).
// - Grid y cards con tamaño cómodo + hover premium.
// - Sin dark/light mode.
// FIX: al entrar/volver al Home, evita que quede “scrolleado” por la ruta anterior
//      (misma idea que en ChampionDetail: scrollTo top en mount + cuando cambia lang)

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchBar } from "../../components/SearchBar/SearchBar";
import { useAuth } from "../../context/AuthContext";
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";
import { getChampions, getChampionById } from "../../services/api";

import "./Home.css";

/* Opciones de filtros según idioma */
const VIEW_OPTIONS_EN = [
  { value: "all", label: "All" },
  { value: "positions", label: "Positions" },
  { value: "classes", label: "Roles" },
  { value: "regions", label: "Regions" },
];

const VIEW_OPTIONS_ES = [
  { value: "all", label: "Todos" },
  { value: "positions", label: "Posiciones" },
  { value: "classes", label: "Roles" },
  { value: "regions", label: "Regiones" },
];

/* Orden de posiciones y clases (roles) */
const POSITION_ORDER = ["Top", "Jungle", "Mid", "ADC", "Support"];
const CLASSES_ORDER = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];

/* Sort options compatibles con SearchBar */
const SORT_OPTIONS = [
  { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" },
  { value: "name-desc", labelEN: "Z → A", labelES: "Z → A" },
];

function normalizeList(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

function normalizeDetail(d) {
  return d?.data ? d.data : d;
}

function sortByName(list, sortValue) {
  const arr = Array.isArray(list) ? [...list] : [];
  const dir = sortValue === "name-desc" ? -1 : 1;

  arr.sort((a, b) => {
    const an = String(a?.name ?? "");
    const bn = String(b?.name ?? "");
    return an.localeCompare(bn, undefined, { sensitivity: "base" }) * dir;
  });

  return arr;
}

export default function Home({ lang = "EN" }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const storageKey = user ? `favorites_${user.id}` : "favorites_guest";
  const t = useMemo(() => (lang === "EN" ? en.home : es.home), [lang]);
  const VIEW_OPTIONS = useMemo(
    () => (lang === "EN" ? VIEW_OPTIONS_EN : VIEW_OPTIONS_ES),
    [lang]
  );

  /* -----------------------------
   States
  ----------------------------- */
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

  /* Filter dropdown */
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* -----------------------------
   Effects
  ----------------------------- */

  // ✅ FIX scroll (como en ChampionDetail)
  // Al llegar al Home desde otra ruta, si el usuario venía scrolleando, a veces queda “pegado” a ese scroll.
  // Esto fuerza top cuando se monta y cuando cambie el idioma (porque suele re-renderizar toda la vista).
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [lang]);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Persistir favoritos (aunque hoy no los muestres acá, no rompe nada)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  // Cargar todos los campeones (paginado)
  useEffect(() => {
    let alive = true;

    async function loadAllChampions() {
      try {
        setLoading(true);
        setError(null);

        const LIMIT = 100;
        let page = 1;
        let all = [];

        while (alive) {
          const res = await getChampions({ page, limit: LIMIT });
          const list = normalizeList(res);
          all = all.concat(list);

          const totalPages = res?.meta?.totalPages;
          if (totalPages) {
            if (page >= totalPages) break;
            page += 1;
            continue;
          }

          if (!list.length || list.length < LIMIT) break;
          page += 1;
        }

        if (alive) setAllChamps(all);
      } catch {
        if (alive) setError(t.errorLoad);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAllChampions();
    return () => {
      alive = false;
    };
  }, [t.errorLoad]);

  /* -----------------------------
   Derived
  ----------------------------- */
  const filteredChamps = useMemo(() => {
    const q = rawSearch.trim().toLowerCase();
    const base = q
      ? allChamps.filter((ch) => (ch.name || "").toLowerCase().includes(q))
      : allChamps;

    return sortByName(base, sortValue);
  }, [allChamps, rawSearch, sortValue]);

  const uniqueSearchChamps = useMemo(() => {
    const q = rawSearch.trim();
    if (!q) return [];

    const map = {};
    filteredChamps.forEach((ch) => {
      map[ch.id] = ch;
    });

    return sortByName(Object.values(map), sortValue);
  }, [filteredChamps, rawSearch, sortValue]);

  // Traer detalles solo si view === "classes" (para agrupar roles)
  useEffect(() => {
    let alive = true;

    async function loadDetails() {
      if (view !== "classes") {
        setChampDetails([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const details = await Promise.all(filteredChamps.map((ch) => getChampionById(ch.id)));
        const normalized = details.map(normalizeDetail);

        if (alive) setChampDetails(normalized);
      } catch {
        if (alive) setError(t.errorLoad);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      alive = false;
    };
  }, [view, filteredChamps, t.errorLoad]);

  const regionGroups = useMemo(() => {
    const groups = {};
    filteredChamps.forEach((ch) => {
      const r = ch.region || "Unknown";
      (groups[r] = groups[r] || []).push(ch);
    });

    // orden por region + orden interno por sortValue
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, champs]) => [region, sortByName(champs, sortValue)]);
  }, [filteredChamps, sortValue]);

  const classGroups = useMemo(() => {
    const map = {};
    champDetails.forEach((ch) =>
      (ch.roles || []).forEach((role) => {
        (map[role] = map[role] || []).push(ch);
      })
    );

    return CLASSES_ORDER.filter((c) => map[c]).map((c) => [c, sortByName(map[c], sortValue)]);
  }, [champDetails, sortValue]);

  /* -----------------------------
   Helpers
  ----------------------------- */
  const goToDetail = (id) => navigate(`/champions/${id}`);

  const translatePosition = (pos) => {
    switch (pos) {
      case "Top":
        return t.positionTop;
      case "Jungle":
        return t.positionJungle;
      case "Mid":
        return t.positionMid;
      case "ADC":
        return t.positionADC;
      case "Support":
        return t.positionSupport;
      default:
        return String(pos).toUpperCase();
    }
  };

  const translateClass = (cls) => {
    switch (cls) {
      case "Assassin":
        return t.roleAssassin;
      case "Fighter":
        return t.roleFighter;
      case "Mage":
        return t.roleMage;
      case "Marksman":
        return t.roleMarksman;
      case "Support":
        return t.roleSupport;
      case "Tank":
        return t.roleTank;
      default:
        return String(cls).toUpperCase();
    }
  };

  const translateRegion = (region) => {
    switch (region) {
      case "Bandle City":
        return t.regionBandle;
      case "Bilgewater":
        return t.regionBilge;
      case "Demacia":
        return t.regionDemacia;
      case "Freljord":
        return t.regionFreljord;
      case "Ionia":
        return t.regionIonia;
      case "Ixtal":
        return t.regionIxtal;
      case "Noxus":
        return t.regionNoxus;
      case "Piltover":
        return t.regionPiltover;
      case "Shadow Isles":
        return t.regionShadow;
      case "Shurima":
        return t.regionShurima;
      case "Targon":
        return t.regionTargon;
      case "Zaun":
        return t.regionZaun;
      case "Runeterra":
        return t.regionRuneterra;
      case "The Void":
        return t.regionVoid;
      default:
        return String(region).toUpperCase();
    }
  };

  const currentViewLabel = useMemo(
    () => VIEW_OPTIONS.find((o) => o.value === view)?.label || VIEW_OPTIONS[0]?.label,
    [VIEW_OPTIONS, view]
  );

  /* -----------------------------
   Render
  ----------------------------- */
  return (
    <main className="home">
      <section className="home__panel" aria-label="Champions explorer">
        <header className="home__hero">
          <div className="home__titleRow">
            <span className="home__stick" aria-hidden="true" />
            <h1 className="home__title">{t.title}</h1>
            <span className="home__stick" aria-hidden="true" />
          </div>

          <div className="home__searchWrap" aria-label="Search and filters">
            <div className="home__searchBarFrame">
              <div className="home__filter" ref={dropdownRef}>
                <button
                  className={`home__filterBtn ${open ? "is-open" : ""}`}
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={open}
                >
                  <span className="home__filterLabel">{currentViewLabel}</span>
                  <span className="home__caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {open && (
                  <ul className="home__filterList" role="listbox" aria-label="Filter view">
                    {VIEW_OPTIONS.filter((opt) => opt.value !== view).map((opt) => (
                      <li
                        key={opt.value}
                        className="home__filterItem"
                        role="option"
                        aria-selected={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          setView(opt.value);
                          setOpen(false);
                        }}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* SearchBar */}
              <SearchBar
                value={rawSearch}
                onChange={setRawSearch}
                lang={lang}
                className="search-bar"
                showSort={true}
                sortValue={sortValue}
                onSortChange={setSortValue}
                sortOptions={SORT_OPTIONS}
              />
            </div>

            <p className="home__hint">{rawSearch ? t.searchHint ?? "" : t.browseHint ?? ""}</p>
          </div>
        </header>

        {/* Estados */}
        {loading && <p className="home__status home__status--loading">{t.loading}</p>}
        {error && <p className="home__status home__status--error">{error}</p>}

        {!loading && !error && (
          <div className="home__content">
            {/* BUSQUEDA */}
            {rawSearch ? (
              <section className="home__grid" aria-label="Search results">
                {uniqueSearchChamps.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    className="home__card"
                    onClick={() => goToDetail(ch.id)}
                    title={ch.name}
                  >
                    <span className="home__thumb">
                      <img className="home__img" src={ch.iconUrl} alt={ch.name} loading="lazy" />
                    </span>
                    <span className="home__name">{ch.name}</span>
                  </button>
                ))}

                {uniqueSearchChamps.length === 0 && (
                  <div className="home__empty">
                    <p className="home__emptyTitle">{t.noChampionsFound}</p>
                    <p className="home__emptyText">{t.tryAnotherSearch}</p>
                  </div>
                )}
              </section>
            ) : (
              <>
                {/* ALL */}
                {view === "all" && (
                  <section className="home__grid" aria-label="All champions">
                    {filteredChamps.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        className="home__card"
                        onClick={() => goToDetail(ch.id)}
                        title={ch.name}
                      >
                        <span className="home__thumb">
                          <img className="home__img" src={ch.iconUrl} alt={ch.name} loading="lazy" />
                        </span>
                        <span className="home__name">{ch.name}</span>
                      </button>
                    ))}
                  </section>
                )}

                {/* POSITIONS */}
                {view === "positions" &&
                  POSITION_ORDER.map((pos) => {
                    const list = filteredChamps.filter((ch) => (ch.positions || []).includes(pos));
                    if (!list.length) return null;

                    return (
                      <section key={pos} className="home__section" aria-label={pos}>
                        <h2 className="home__sectionTitle">{translatePosition(pos)}</h2>
                        <div className="home__grid home__grid--section">
                          {list.map((ch) => (
                            <button
                              key={ch.id}
                              type="button"
                              className="home__card"
                              onClick={() => goToDetail(ch.id)}
                              title={ch.name}
                            >
                              <span className="home__thumb">
                                <img
                                  className="home__img"
                                  src={ch.iconUrl}
                                  alt={ch.name}
                                  loading="lazy"
                                />
                              </span>
                              <span className="home__name">{ch.name}</span>
                            </button>
                          ))}
                        </div>
                      </section>
                    );
                  })}

                {/* REGIONS */}
                {view === "regions" &&
                  regionGroups.map(([region, champs]) => (
                    <section key={region} className="home__section" aria-label={region}>
                      <h2 className="home__sectionTitle">{translateRegion(region)}</h2>
                      <div className="home__grid home__grid--section">
                        {champs.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            className="home__card"
                            onClick={() => goToDetail(ch.id)}
                            title={ch.name}
                          >
                            <span className="home__thumb">
                              <img className="home__img" src={ch.iconUrl} alt={ch.name} loading="lazy" />
                            </span>
                            <span className="home__name">{ch.name}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}

                {/* CLASSES */}
                {view === "classes" &&
                  classGroups.map(([cls, champs]) => (
                    <section key={cls} className="home__section" aria-label={cls}>
                      <h2 className="home__sectionTitle">{translateClass(cls)}</h2>
                      <div className="home__grid home__grid--section">
                        {champs.map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            className="home__card"
                            onClick={() => goToDetail(ch.id)}
                            title={ch.name}
                          >
                            <span className="home__thumb">
                              <img className="home__img" src={ch.iconUrl} alt={ch.name} loading="lazy" />
                            </span>
                            <span className="home__name">{ch.name}</span>
                          </button>
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
