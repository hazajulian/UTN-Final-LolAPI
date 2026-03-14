// Items.jsx — Items Shop (LoL premium, coherente con Home)
// - Trae TODOS los items del shop (usa /items/all recomendado por tu swagger)
// - Filtros: Section + Tier (en dropdown), Roles (chips), Search local
// - Grid NO corta a 20 items
// - Click abre modal premium (ItemsModal) usando /items/:id

import { useEffect, useMemo, useRef, useState } from "react";

import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

import { getItemsAll, getItemsFiltersMeta, getItemById } from "../../services/api";

import { SearchBarItems } from "../../components/SearchBarItems/SearchBarItems";
import { ItemsModal } from "../../components/ItemsModal/ItemsModal";

import "./Items.css";

const SORT_OPTIONS = [
  { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" },
  { value: "name-desc", labelEN: "Z → A", labelES: "Z → A" },
];

function normalizeList(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
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

// Normaliza tags a array de strings (por si viene raro)
function getItemTags(it) {
  const t = it?.tags;
  if (Array.isArray(t)) return t.filter(Boolean).map(String);
  if (typeof t === "string") return t.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

export default function Items({ lang = "EN" }) {
  const dict = useMemo(() => (lang === "EN" ? en : es), [lang]);

  // i18n local (no obliga a tocar en/es.js hoy)
  const ui = useMemo(() => {
    const isEN = lang === "EN";
    return {
      title: isEN ? "Items" : "Objetos",
      filterAll: isEN ? "All" : "Todas",
      searchPh: isEN ? "Search items..." : "Buscar objetos...",
      hint: isEN
        ? "Explore items and filter by section, tier and roles."
        : "Explorá items y filtrá por sección, tier y roles.",
      loading: isEN ? "Loading items..." : "Cargando objetos...",
      errorLoad: isEN ? "Could not load items." : "No se pudieron cargar los objetos.",
      rolesLabel: isEN ? "ROLES" : "ROLES",
      countLabel: isEN ? "Showing" : "Mostrando",

      tierBasic: isEN ? "Tier: Basic" : "Tier: Basic",
      tierEpic: isEN ? "Tier: Epic" : "Tier: Epic",
      tierLegendary: isEN ? "Tier: Legendary" : "Tier: Legendary",

      tiersHeader: isEN ? "Tiers" : "Tiers",
      sectionsHeader: isEN ? "Sections" : "Secciones",
    };
  }, [lang]);

  const ROLE_LABELS = useMemo(() => {
    const isEN = lang === "EN";
    return {
      all: isEN ? "All" : "Todos",
      tank: isEN ? "Tank" : "Tanque",
      mage: isEN ? "Mage" : "Mago",
      marksman: isEN ? "Marksman" : "Tirador",
      fighter: isEN ? "Fighter" : "Luchador",
      assassin: isEN ? "Assassin" : "Asesino",
      support: isEN ? "Support" : "Soporte",
    };
  }, [lang]);

  // -----------------------------
  // States
  // -----------------------------
  const [rawSearch, setRawSearch] = useState("");
  const [sortValue, setSortValue] = useState("name-asc");

  // dropdown principal: “All / Section / Tier”
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [section, setSection] = useState("all"); // shopSection
  const [tier, setTier] = useState("all"); // basic/epic/legendary
  const [role, setRole] = useState("all"); // tank/mage...

  const [filtersMeta, setFiltersMeta] = useState(null);

  // catálogo completo (all)
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // modal
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [lang]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Meta filtros (sections/tiers/roles)
  useEffect(() => {
    let alive = true;

    async function loadMeta() {
      try {
        const apiLang = lang === "EN" ? "en" : "es";
        const res = await getItemsFiltersMeta({ lang: apiLang });

        // shape real del back:
        // { meta: {...}, data: { sections:[{key,total}], tiers:[...], roles:[...] } }
        if (!alive) return;
        setFiltersMeta(res?.data ?? null);
      } catch {
        // meta no es crítico
      }
    }

    loadMeta();
    return () => {
      alive = false;
    };
  }, [lang]);

  // Cargar catálogo completo usando /items/all
  useEffect(() => {
    let alive = true;

    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        const apiLang = lang === "EN" ? "en" : "es";
        const res = await getItemsAll({ lang: apiLang });
        const list = normalizeList(res);

        if (!alive) return;

        // Normalizo id y dejo campos del back tal cual (tier/shopSection/roleGroups)
        const safe = list
          .filter((it) => it && it.itemId && it.name)
          .map((it) => ({
            ...it,
            id: it.itemId, // para key/click
          }));

        setAllItems(safe);
      } catch {
        if (!alive) return;
        setError(ui.errorLoad);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAll();
    return () => {
      alive = false;
    };
  }, [lang, ui.errorLoad]);

  // -----------------------------
  // Dropdown label
  // -----------------------------
  const dropdownLabel = useMemo(() => {
    if (tier !== "all") return `Tier: ${String(tier).toUpperCase()}`;
    if (section !== "all") return String(section).toUpperCase();
    return ui.filterAll;
  }, [section, tier, ui.filterAll]);

  // -----------------------------
  // Options desde meta (fallback seguro)
  // -----------------------------
  const sectionOptions = useMemo(() => {
    const arr = filtersMeta?.sections;
    if (Array.isArray(arr) && arr.length) {
      return arr
        .map((x) => x?.key)
        .filter(Boolean);
    }
    return ["starter", "consumable", "trinket", "boots", "basic", "epic", "legendary"];
  }, [filtersMeta]);

  // -----------------------------
  // Filtering helpers (usando fields del BACK)
  // -----------------------------
  function passesSection(it) {
    if (section === "all") return true;
    return String(it?.shopSection ?? "").toLowerCase() === String(section).toLowerCase();
  }

  function passesTier(it) {
    if (tier === "all") return true;
    return String(it?.tier ?? "").toLowerCase() === String(tier).toLowerCase();
  }

  function passesRole(it) {
    if (role === "all") return true;

    const rg = Array.isArray(it?.roleGroups) ? it.roleGroups.map(String) : [];
    const rgLower = rg.map((x) => x.toLowerCase());
    return rgLower.includes(String(role).toLowerCase());
  }

  function passesSearch(it, q) {
    if (!q) return true;

    const name = String(it?.name ?? "").toLowerCase();
    const plaintext = String(it?.plaintext ?? "").toLowerCase();
    const tags = getItemTags(it).join(" ").toLowerCase();

    return name.includes(q) || plaintext.includes(q) || tags.includes(q);
  }

  // -----------------------------
  // Derived list (search + filters + sort local)
  // -----------------------------
  const visibleItems = useMemo(() => {
    const q = rawSearch.trim().toLowerCase();

    const filtered = allItems
      .filter((it) => passesSection(it))
      .filter((it) => passesTier(it))
      .filter((it) => passesRole(it))
      .filter((it) => passesSearch(it, q));

    return sortByName(filtered, sortValue);
  }, [allItems, rawSearch, sortValue, section, tier, role]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const pickAll = () => {
    setSection("all");
    setTier("all");
    setOpen(false);
  };

  const pickSection = (sec) => {
    setSection(sec);
    setTier("all"); // uno u otro
    setOpen(false);
  };

  const pickTier = (tval) => {
    setTier(tval);
    setSection("all"); // uno u otro
    setOpen(false);
  };

  const openModal = async (it) => {
    try {
      const apiLang = lang === "EN" ? "en" : "es";

      // Pedimos detalle real para descriptionRaw/descriptionText y build path
      const detail = await getItemById(it?.id ?? it?.itemId, { lang: apiLang });

      // Adaptamos a lo que espera ItemsModal:
      // - ItemsModal usa item.description (HTML)
      // - Back devuelve descriptionRaw (HTML) + descriptionText (plain)
      const mapped = {
        ...detail,
        description: detail?.descriptionRaw || "", // HTML para el modal
      };

      setSelected(mapped);
      setModalOpen(true);
    } catch {
      // Fallback: si falla detalle, abrimos con la data liviana
      setSelected({
        ...it,
        description: "", // no hay detalle
      });
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <main className="items">
      <section className="items__panel" aria-label="Items shop">
        <header className="items__hero">
          <div className="items__titleRow">
            <span className="items__stick" aria-hidden="true" />
            <h1 className="items__title">{ui.title}</h1>
            <span className="items__stick" aria-hidden="true" />
          </div>

          <div className="items__searchWrap">
            <div className="items__searchBarFrame">
              {/* Dropdown principal: All + Sections + Tier */}
              <div className="items__filter" ref={dropdownRef}>
                <button
                  className={`items__filterBtn ${open ? "is-open" : ""}`}
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={open}
                >
                  <span className="items__filterLabel">{dropdownLabel}</span>
                  <span className="items__caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {open && (
                  <div className="items__filterList" role="listbox" aria-label="Items filters">
                    <button type="button" className="items__filterItem" onClick={pickAll}>
                      {ui.filterAll}
                    </button>

                    <div className="items__filterGroupTitle">{ui.sectionsHeader}</div>
                    <div className="items__filterGrid">
                      {sectionOptions.map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          className="items__filterItem"
                          onClick={() => pickSection(sec)}
                        >
                          {String(sec).toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <div className="items__filterGroupTitle">{ui.tiersHeader}</div>
                    <div className="items__filterGrid">
                      <button
                        type="button"
                        className="items__filterItem"
                        onClick={() => pickTier("basic")}
                      >
                        {ui.tierBasic}
                      </button>
                      <button
                        type="button"
                        className="items__filterItem"
                        onClick={() => pickTier("epic")}
                      >
                        {ui.tierEpic}
                      </button>
                      <button
                        type="button"
                        className="items__filterItem"
                        onClick={() => pickTier("legendary")}
                      >
                        {ui.tierLegendary}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SearchBar de Items (la que mostraste) */}
              <SearchBarItems
                value={rawSearch}
                onChange={setRawSearch}
                lang={lang}
                placeholder={ui.searchPh}
                showSort={true}
                sortValue={sortValue}
                onSortChange={setSortValue}
                sortOptions={SORT_OPTIONS}
              />
            </div>

            {/* Roles */}
            <div className="items__rolesRow" aria-label="Roles filter">
              <span className="items__rolesLabel">{ui.rolesLabel}</span>

              <div className="items__chips">
                {["all", "tank", "mage", "marksman", "fighter", "assassin", "support"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`items__chip ${role === r ? "is-active" : ""}`}
                    onClick={() => setRole(r)}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>

              <span className="items__count">
                {ui.countLabel}: <b>{visibleItems.length}</b>
              </span>
            </div>

            <p className="items__hint">{ui.hint}</p>
          </div>
        </header>

        {loading && <p className="items__status items__status--loading">{ui.loading}</p>}
        {error && <p className="items__status items__status--error">{error}</p>}

        {!loading && !error && (
          <section className="items__grid" aria-label="Items grid">
            {visibleItems.map((it) => (
              <button
                key={it.id}
                type="button"
                className="items__item"
                title={it.name}
                onClick={() => openModal(it)}
              >
                <span className="items__iconFrame">
                  <img
                    className="items__icon"
                    src={it.iconUrl}
                    alt={it.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </span>
              </button>
            ))}
          </section>
        )}
      </section>

      {/* Modal premium */}
      <ItemsModal open={modalOpen} item={selected} onClose={closeModal} lang={lang} />
    </main>
  );
}
