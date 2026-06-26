// Items.jsx
// Tienda de objetos con búsqueda, filtros, roles y modal de detalle.

import { useEffect, useMemo, useRef, useState } from "react";

import { SearchBarItems } from "../../components/SearchBarItems/SearchBarItems";
import { ItemsModal } from "../../components/ItemsModal/ItemsModal";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
import {
  getItemById,
  getItemsAll,
  getItemsFiltersMeta,
} from "../../services/api";

import "./Items.css";

const SORT_OPTIONS = [
  { value: "name-asc", labelKey: "sortAZ" },
  { value: "name-desc", labelKey: "sortZA" },
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

function normalizeList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

function sortByName(list, sortValue) {
  const direction = sortValue === "name-desc" ? -1 : 1;
  const items = Array.isArray(list) ? [...list] : [];

  return items.sort((a, b) => {
    const nameA = String(a?.name ?? "");
    const nameB = String(b?.name ?? "");

    return (
      nameA.localeCompare(nameB, undefined, { sensitivity: "base" }) *
      direction
    );
  });
}

function getItemTags(item) {
  if (Array.isArray(item?.tags)) {
    return item.tags.filter(Boolean).map(String);
  }

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

function unwrapApiData(value) {
  if (value?.data?.data) return value.data.data;
  if (value?.data) return value.data;
  return value;
}

export default function Items() {
  const { language } = useLanguage();

  const t = translations[language].items;
  const apiLang = language === "EN" ? "en" : "es";

  const dropdownRef = useRef(null);
  const itemDetailCache = useRef(new Map());
  const modalRequestRef = useRef(0);

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
  const [modalLoading, setModalLoading] = useState(false);

  const roleLabels = useMemo(
    () => ({
      all: t.all,
      tank: t.terms.roles.tank,
      mage: t.terms.roles.mage,
      marksman: t.terms.roles.marksman,
      fighter: t.terms.roles.fighter,
      assassin: t.terms.roles.assassin,
      support: t.terms.roles.support,
    }),
    [t]
  );

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
    return t[labelKey] ?? formatFallbackLabel(sectionKey);
  };

  const tierLabel = (tierKey) => {
    const label = t.terms?.tiers?.[tierKey] ?? formatFallbackLabel(tierKey);
    return `${t.tierLabel}: ${label}`;
  };

  const dropdownLabel = useMemo(() => {
    if (tier !== "all") return tierLabel(tier).toUpperCase();
    if (section !== "all") return sectionLabel(section).toUpperCase();

    return t.filterAll;
  }, [section, tier, t]);

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
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    itemDetailCache.current.clear();
  }, [apiLang]);

  useEffect(() => {
    let alive = true;

    async function loadMeta() {
      try {
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

        const sections = results.flatMap((response) => {
          const list = response?.data?.sections;
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
        // La metadata no es crítica para mostrar los items.
      }
    }

    loadMeta();

    return () => {
      alive = false;
    };
  }, [apiLang]);

  useEffect(() => {
    let alive = true;

    async function loadAllItems() {
      try {
        setLoading(true);
        setError(null);

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

        const list = results.flatMap((response) => normalizeList(response));

        if (!alive) return;

        const safeItems = list
          .filter((item) => item?.itemId && item?.name)
          .map((item) => ({
            ...item,
            id: item.itemId,
          }));

        setAllItems(safeItems);
      } catch {
        if (alive) setError(t.errorLoad);
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAllItems();

    return () => {
      alive = false;
    };
  }, [apiLang, t.errorLoad]);

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

  const pickAll = () => {
    setSection("all");
    setTier("all");
    setOpen(false);
  };

  const pickSection = (value) => {
    setSection(value);
    setTier("all");
    setOpen(false);
  };

  const pickTier = (value) => {
    setTier(value);
    setSection("all");
    setOpen(false);
  };

  async function openModal(item) {
    if (!item) return;

    const itemId = item?.id ?? item?.itemId;
    const requestId = modalRequestRef.current + 1;

    modalRequestRef.current = requestId;

    const fallbackItem = {
      ...item,
      description: item?.descriptionRaw || item?.description || "",
    };

    setSelected(fallbackItem);
    setModalOpen(true);

    if (!itemId) {
      setModalLoading(false);
      return;
    }

    const cacheKey = `${apiLang}-${itemId}`;
    const cachedItem = itemDetailCache.current.get(cacheKey);

    if (cachedItem) {
      setSelected(cachedItem);
      setModalLoading(false);
      return;
    }

    setModalLoading(true);

    try {
      const response = await getItemById(itemId, {
        lang: apiLang,
      });

      const detail = unwrapApiData(response);

      const fullItem = {
        ...fallbackItem,
        ...detail,
        id: detail?.id ?? detail?.itemId ?? fallbackItem.id,
        itemId: detail?.itemId ?? detail?.id ?? fallbackItem.itemId,
        description:
          detail?.descriptionRaw ||
          detail?.description ||
          fallbackItem.description,
      };

      itemDetailCache.current.set(cacheKey, fullItem);

      if (modalRequestRef.current !== requestId) return;

      setSelected(fullItem);
    } catch {
      if (modalRequestRef.current !== requestId) return;

      setSelected(fallbackItem);
    } finally {
      if (modalRequestRef.current === requestId) {
        setModalLoading(false);
      }
    }
  }

  const closeModal = () => {
    modalRequestRef.current += 1;
    setModalOpen(false);
    setModalLoading(false);
    setSelected(null);
  };

  return (
    <main className="items">
      <section className="items__panel" aria-label={t.shopAria}>
        <header className="items__hero">
          <div className="items__titleRow">
            <span className="items__stick" aria-hidden="true" />
            <h1 className="items__title">{t.title}</h1>
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
                  aria-label={t.filtersAria}
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
                    aria-label={t.filtersAria}
                  >
                    <button
                      type="button"
                      className={`items__filterItem items__filterItem--full ${
                        section === "all" && tier === "all" ? "is-active" : ""
                      }`}
                      onClick={pickAll}
                    >
                      {t.filterAll}
                    </button>

                    <div className="items__filterGroupTitle">
                      {t.filterSections}
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
                      {t.filterTiers}
                    </div>

                    <div className="items__filterGrid">
                      <button
                        type="button"
                        className={`items__filterItem ${
                          tier === "basic" ? "is-active" : ""
                        }`}
                        onClick={() => pickTier("basic")}
                      >
                        {tierLabel("basic")}
                      </button>

                      <button
                        type="button"
                        className={`items__filterItem ${
                          tier === "epic" ? "is-active" : ""
                        }`}
                        onClick={() => pickTier("epic")}
                      >
                        {tierLabel("epic")}
                      </button>

                      <button
                        type="button"
                        className={`items__filterItem ${
                          tier === "legendary" ? "is-active" : ""
                        }`}
                        onClick={() => pickTier("legendary")}
                      >
                        {tierLabel("legendary")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <SearchBarItems
                value={rawSearch}
                onChange={setRawSearch}
                placeholder={t.searchPlaceholder}
                showSort
                sortValue={sortValue}
                onSortChange={setSortValue}
                sortOptions={SORT_OPTIONS}
              />
            </div>

            <div className="items__rolesRow" aria-label={t.rolesFilterAria}>
              <span className="items__rolesLabel">{t.rolesLabel}</span>

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
                {t.countLabel}: <b>{visibleItems.length}</b>
              </span>
            </div>

            <p className="items__hint">{t.hint}</p>
          </div>
        </header>

        {loading && (
          <p className="items__status items__status--loading">{t.loading}</p>
        )}

        {error && <p className="items__status items__status--error">{error}</p>}

        {!loading && !error && (
          <section className="items__grid" aria-label={t.gridAria}>
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
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
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
        loading={modalLoading}
        onClose={closeModal}
      />
    </main>
  );
}