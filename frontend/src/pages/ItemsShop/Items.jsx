// Items.jsx — Items Shop

import { useEffect, useMemo, useRef, useState } from "react";

import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

import {
  getItemsAll,
  getItemsFiltersMeta,
  getItemById,
} from "../../services/api";

import { SearchBarItems } from "../../components/SearchBarItems/SearchBarItems";
import { ItemsModal } from "../../components/ItemsModal/ItemsModal";

import "./Items.css";

const SORT_OPTIONS = [
  { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" },
  { value: "name-desc", labelEN: "Z → A", labelES: "Z → A" },
];

const ITEM_GROUPS = ["main", "arena", "special"];

const FALLBACK_SECTIONS = [
  "starter",
  "consumable",
  "trinket",
  "distributed",
  "boots",
  "basic",
  "epic",
  "legendary",
  "champion_exclusive",
  "minion_turret",
  "arena_prismatic",
  "arena_anvil",
  "arena_exclusive",
];

const HIDDEN_SECTIONS = ["item"];

const ROLES = [
  "all",
  "tank",
  "mage",
  "marksman",
  "fighter",
  "assassin",
  "support",
];

const SECTION_LABEL_KEYS = {
  starter: "sectionStarter",
  consumable: "sectionConsumable",
  trinket: "sectionTrinket",
  distributed: "sectionDistributed",
  boots: "sectionBoots",
  basic: "sectionBasic",
  epic: "sectionEpic",
  legendary: "sectionLegendary",
  champion_exclusive: "sectionChampionExclusive",
  minion_turret: "sectionMinionTurret",
  arena_prismatic: "sectionArenaPrismatic",
  arena_anvil: "sectionArenaAnvil",
  arena_exclusive: "sectionArenaExclusive",
};

function normalizeList(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

function sortByName(list, sortValue) {
  const items = Array.isArray(list) ? [...list] : [];
  const direction = sortValue === "name-desc" ? -1 : 1;

  items.sort((a, b) => {
    const nameA = String(a?.name ?? "");
    const nameB = String(b?.name ?? "");

    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" }) * direction;
  });

  return items;
}

function getItemTags(item) {
  if (Array.isArray(item?.tags)) return item.tags.filter(Boolean).map(String);

  if (typeof item?.tags === "string") {
    return item.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function formatFallbackLabel(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Items({ lang = "EN" }) {
  const dict = useMemo(() => (lang === "EN" ? en : es), [lang]);

  const ui = useMemo(() => {
    const isEN = lang === "EN";
    const itemsDict = dict?.items ?? {};

    return {
      title: itemsDict.title ?? (isEN ? "Items" : "Objetos"),
      filterAll: itemsDict.filterAll ?? (isEN ? "All" : "Todos"),
      searchPh:
        itemsDict.searchPlaceholder ??
        (isEN ? "Search items..." : "Buscar objetos..."),
      hint:
        itemsDict.hint ??
        (isEN
          ? "Explore items and filter by section, tier and roles."
          : "Explorá items y filtrá por sección, tier y roles."),
      loading:
        itemsDict.loading ??
        (isEN ? "Loading items..." : "Cargando objetos..."),
      errorLoad:
        itemsDict.errorLoad ??
        (isEN ? "Could not load items." : "No se pudieron cargar los objetos."),
      rolesLabel: itemsDict.rolesLabel ?? "ROLES",
      countLabel: itemsDict.countLabel ?? (isEN ? "Showing" : "Mostrando"),
      sectionsHeader:
        itemsDict.filterSections ?? (isEN ? "Sections" : "Secciones"),
      tiersHeader: itemsDict.filterTiers ?? "Tiers",
      tierBasic: itemsDict.tierBasic ?? (isEN ? "Tier: Basic" : "Tier: Básico"),
      tierEpic: itemsDict.tierEpic ?? (isEN ? "Tier: Epic" : "Tier: Épico"),
      tierLegendary:
        itemsDict.tierLegendary ??
        (isEN ? "Tier: Legendary" : "Tier: Legendario"),
    };
  }, [dict, lang]);

  const roleLabels = useMemo(() => {
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

  const dropdownRef = useRef(null);

  const [rawSearch, setRawSearch] = useState("");
  const [sortValue, setSortValue] = useState("name-asc");

  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("all");
  const [tier, setTier] = useState("all");
  const [role, setRole] = useState("all");

  const [filtersMeta, setFiltersMeta] = useState(null);

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sube al inicio al cambiar idioma.
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [lang]);

  // Cierra el dropdown al hacer click afuera.
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Carga metadata de filtros.
  useEffect(() => {
    let alive = true;

    async function loadMeta() {
      try {
        const apiLang = lang === "EN" ? "en" : "es";

        const results = await Promise.all(
          ITEM_GROUPS.map((group) =>
            getItemsFiltersMeta({
              lang: apiLang,
              group,
              shopOnly: true,
              includeHidden: false,
            })
          )
        );

        if (!alive) return;

        const sections = results.flatMap((res) => {
          const list = res?.data?.sections;
          return Array.isArray(list) ? list : [];
        });

        const uniqueSections = Array.from(
          new Map(
            sections
              .filter((item) => item?.key)
              .map((item) => [item.key, item])
          ).values()
        );

        setFiltersMeta({ sections: uniqueSections });
      } catch {
        // La metadata no es crítica.
      }
    }

    loadMeta();

    return () => {
      alive = false;
    };
  }, [lang]);

  // Carga todos los items visibles.
  useEffect(() => {
    let alive = true;

    async function loadAllItems() {
      try {
        setLoading(true);
        setError(null);

        const apiLang = lang === "EN" ? "en" : "es";

        const results = await Promise.all(
          ITEM_GROUPS.map((group) =>
            getItemsAll({
              lang: apiLang,
              group,
              shopOnly: true,
              includeHidden: false,
              dedupe: true,
            })
          )
        );

        const list = results.flatMap((res) => normalizeList(res));

        if (!alive) return;

        const safeItems = list
          .filter((item) => item?.itemId && item?.name)
          .map((item) => ({
            ...item,
            id: item.itemId,
          }));

        setAllItems(safeItems);
      } catch {
        if (alive) setError(ui.errorLoad);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAllItems();

    return () => {
      alive = false;
    };
  }, [lang, ui.errorLoad]);

  const sectionOptions = useMemo(() => {
    const sections = filtersMeta?.sections;

    const list =
      Array.isArray(sections) && sections.length
        ? sections.map((item) => item?.key).filter(Boolean)
        : FALLBACK_SECTIONS;

    return list.filter(
      (sectionKey) =>
        !HIDDEN_SECTIONS.includes(String(sectionKey).toLowerCase())
    );
  }, [filtersMeta]);

  const sectionLabel = (sectionKey) => {
    const labelKey = SECTION_LABEL_KEYS[sectionKey];
    return dict?.items?.[labelKey] ?? formatFallbackLabel(sectionKey);
  };

  const dropdownLabel = useMemo(() => {
    if (tier !== "all") return `Tier: ${String(tier).toUpperCase()}`;
    if (section !== "all") return sectionLabel(section).toUpperCase();
    return ui.filterAll;
  }, [section, tier, ui.filterAll, dict]);

  function passesSection(item) {
    if (section === "all") return true;

    return (
      String(item?.shopSection ?? "").toLowerCase() ===
      String(section).toLowerCase()
    );
  }

  function passesTier(item) {
    if (tier === "all") return true;

    return (
      String(item?.shopGroup ?? "").toLowerCase() === "main" &&
      String(item?.tier ?? "").toLowerCase() === String(tier).toLowerCase()
    );
  }

  function passesRole(item) {
    if (role === "all") return true;

    const groups = Array.isArray(item?.roleGroups)
      ? item.roleGroups.map((group) => String(group).toLowerCase())
      : [];

    return groups.includes(String(role).toLowerCase());
  }

  function passesSearch(item, query) {
    if (!query) return true;

    const name = String(item?.name ?? "").toLowerCase();
    const plaintext = String(item?.plaintext ?? "").toLowerCase();
    const tags = getItemTags(item).join(" ").toLowerCase();
    const shopSection = String(item?.shopSection ?? "").toLowerCase();
    const shopGroup = String(item?.shopGroup ?? "").toLowerCase();

    return (
      name.includes(query) ||
      plaintext.includes(query) ||
      tags.includes(query) ||
      shopSection.includes(query) ||
      shopGroup.includes(query)
    );
  }

  const visibleItems = useMemo(() => {
    const query = rawSearch.trim().toLowerCase();

    const filtered = allItems
      .filter((item) => passesSection(item))
      .filter((item) => passesTier(item))
      .filter((item) => passesRole(item))
      .filter((item) => passesSearch(item, query));

    return sortByName(filtered, sortValue);
  }, [allItems, rawSearch, sortValue, section, tier, role]);

  function pickAll() {
    setSection("all");
    setTier("all");
    setOpen(false);
  }

  function pickSection(value) {
    setSection(value);
    setTier("all");
    setOpen(false);
  }

  function pickTier(value) {
    setTier(value);
    setSection("all");
    setOpen(false);
  }

  async function openModal(item) {
    try {
      const apiLang = lang === "EN" ? "en" : "es";
      const detail = await getItemById(item?.id ?? item?.itemId, {
        lang: apiLang,
      });

      setSelected({
        ...detail,
        description: detail?.descriptionRaw || "",
      });
    } catch {
      setSelected({
        ...item,
        description: item?.descriptionRaw || "",
      });
    } finally {
      setModalOpen(true);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(null);
  }

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
              <div className="items__filter" ref={dropdownRef}>
                <button
                  className={`items__filterBtn ${open ? "is-open" : ""}`}
                  type="button"
                  onClick={() => setOpen((value) => !value)}
                  aria-haspopup="listbox"
                  aria-expanded={open}
                >
                  <span className="items__filterLabel">{dropdownLabel}</span>
                  <span className="items__caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {open && (
                  <div
                    className="items__filterList"
                    role="listbox"
                    aria-label="Items filters"
                  >
                    <button
                      type="button"
                      className="items__filterItem items__filterItem--full"
                      onClick={pickAll}
                    >
                      {ui.filterAll}
                    </button>

                    <div className="items__filterGroupTitle">
                      {ui.sectionsHeader}
                    </div>

                    <div className="items__filterGrid">
                      {sectionOptions.map((itemSection) => (
                        <button
                          key={itemSection}
                          type="button"
                          className={`items__filterItem ${
                            section === itemSection ? "is-active" : ""
                          }`}
                          onClick={() => pickSection(itemSection)}
                        >
                          {sectionLabel(itemSection)}
                        </button>
                      ))}
                    </div>

                    <div className="items__filterGroupTitle">
                      {ui.tiersHeader}
                    </div>

                    <div className="items__filterGrid">
                      <button
                        type="button"
                        className={`items__filterItem ${
                          tier === "basic" ? "is-active" : ""
                        }`}
                        onClick={() => pickTier("basic")}
                      >
                        {ui.tierBasic}
                      </button>

                      <button
                        type="button"
                        className={`items__filterItem ${
                          tier === "epic" ? "is-active" : ""
                        }`}
                        onClick={() => pickTier("epic")}
                      >
                        {ui.tierEpic}
                      </button>

                      <button
                        type="button"
                        className={`items__filterItem ${
                          tier === "legendary" ? "is-active" : ""
                        }`}
                        onClick={() => pickTier("legendary")}
                      >
                        {ui.tierLegendary}
                      </button>
                    </div>
                  </div>
                )}
              </div>

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

            <div className="items__rolesRow" aria-label="Roles filter">
              <span className="items__rolesLabel">{ui.rolesLabel}</span>

              <div className="items__chips">
                {ROLES.map((itemRole) => (
                  <button
                    key={itemRole}
                    type="button"
                    className={`items__chip ${
                      role === itemRole ? "is-active" : ""
                    }`}
                    onClick={() => setRole(itemRole)}
                  >
                    {roleLabels[itemRole]}
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

        {loading && (
          <p className="items__status items__status--loading">{ui.loading}</p>
        )}

        {error && (
          <p className="items__status items__status--error">{error}</p>
        )}

        {!loading && !error && (
          <section className="items__grid" aria-label="Items grid">
            {visibleItems.map((item) => (
              <button
                key={`${item.shopGroup}-${item.id}`}
                type="button"
                className="items__item"
                title={item.name}
                onClick={() => openModal(item)}
              >
                <span className="items__iconFrame">
                  <img
                    className="items__icon"
                    src={item.iconUrl}
                    alt={item.name}
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

      <ItemsModal
        open={modalOpen}
        item={selected}
        onClose={closeModal}
        lang={lang}
      />
    </main>
  );
}