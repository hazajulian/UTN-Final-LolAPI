// Runes.jsx
// Página principal de runas con buscador, filtros, orden y modal de detalle.

import { useEffect, useMemo, useState } from "react";

import { SearchBar } from "../../components/SearchBar/SearchBar";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./Runes.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3010";
const DDRAGON_CDN = "https://ddragon.leagueoflegends.com/cdn/img/";

function safeArr(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeList(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.runes)) return response.runes;
  if (Array.isArray(response?.runeTrees)) return response.runeTrees;
  if (Array.isArray(response?.items)) return response.items;

  if (Array.isArray(response?.data?.results)) return response.data.results;
  if (Array.isArray(response?.data?.runes)) return response.data.runes;
  if (Array.isArray(response?.data?.runeTrees)) return response.data.runeTrees;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  return [];
}

function getImageUrl(icon) {
  if (!icon) return "";
  if (String(icon).startsWith("http")) return icon;
  if (String(icon).startsWith("/")) return icon;

  return `${DDRAGON_CDN}${icon}`;
}

function cleanDescription(text) {
  return String(text || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getTreeId(tree) {
  return tree?.treeId || tree?.id || tree?.key || tree?.slug || tree?.name;
}

function getTreeName(tree) {
  return tree?.name || tree?.key || "Rune Tree";
}

function getTreeIcon(tree) {
  return getImageUrl(tree?.iconUrl || tree?.icon || tree?.imageUrl);
}

function getRuneId(rune) {
  return rune?.runeId || rune?.id || rune?.key || rune?.name;
}

function getRuneIcon(rune) {
  return getImageUrl(rune?.iconUrl || rune?.icon || rune?.imageUrl);
}

function getRuneShortDescription(rune) {
  return cleanDescription(
    rune?.shortDesc || rune?.description || rune?.summary || rune?.longDesc || ""
  );
}

function getRuneFullDescription(rune) {
  return cleanDescription(
    rune?.longDesc || rune?.shortDesc || rune?.description || rune?.summary || ""
  );
}

function sortTrees(list, sortValue) {
  return [...list].sort((a, b) => {
    const nameA = String(getTreeName(a));
    const nameB = String(getTreeName(b));

    if (sortValue === "name-desc") {
      return nameB.localeCompare(nameA, undefined, { sensitivity: "base" });
    }

    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });
}

function filterTreeRunes(tree, searchTerm) {
  const term = searchTerm.trim().toLowerCase();

  if (!term) return tree;

  const filteredSlots = safeArr(tree.slots)
    .map((slot) => {
      const runes = safeArr(slot.runes).filter((rune) => {
        const name = String(rune?.name || "").toLowerCase();
        const key = String(rune?.key || "").toLowerCase();
        const shortDesc = getRuneShortDescription(rune).toLowerCase();
        const fullDesc = getRuneFullDescription(rune).toLowerCase();

        return (
          name.includes(term) ||
          key.includes(term) ||
          shortDesc.includes(term) ||
          fullDesc.includes(term)
        );
      });

      return { ...slot, runes };
    })
    .filter((slot) => slot.runes.length > 0);

  return { ...tree, slots: filteredSlots };
}

function getSlotTitle(slotIndex, t) {
  const titles = t.slotTitles || [];

  return titles[slotIndex] || `${t.branch} ${slotIndex}`;
}

function splitDescription(text) {
  const clean = cleanDescription(text);

  if (!clean) return [];

  return clean
    .replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ0-9])/g, ".|")
    .replace(/;\s+/g, ";|")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function renderHighlightedText(text) {
  const pattern =
    /(\bFuerza Adaptable\b|\bAdaptive Force\b|\bPoder de Habilidad\b|\bAbility Power\b|\bDaño de Ataque\b|\bAttack Damage\b|\bAceleración de Habilidad\b|\bAbility Haste\b|\bVelocidad de Movimiento\b|\bMove Speed\b|\bMovement Speed\b|\bResistencia Mágica\b|\bMagic Resist\b|\bVelocidad de Ataque\b|\bAttack Speed\b|\bPenetración Mágica\b|\bMagic Penetration\b|\bVida Máxima\b|\bMaximum Health\b|\bMax Health\b|\bArmadura\b|\bArmor\b|\bLetalidad\b|\bLethality\b|\bCuración\b|\bHealing\b|\bHeal\b|\bEscudo\b|\bShield\b|\bManá\b|\bMana\b|\bVida\b|\bHealth\b|\+?\d+(?:[.,]\d+)?%)/gi;

  const parts = String(text).split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    pattern.lastIndex = 0;

    if (pattern.test(part)) {
      return (
        <strong className="runes-modal__textStrong" key={`${part}-${index}`}>
          {part}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function Runes() {
  const { language } = useLanguage();

  const t = translations[language].runes;
  const apiLang = language === "ES" ? "es" : "en";

  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState("all");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("name-asc");

  const [selectedRune, setSelectedRune] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const treeFilters = useMemo(() => sortTrees(trees, "name-asc"), [trees]);

  const filteredTrees = useMemo(() => {
    const byTree =
      selectedTree === "all"
        ? trees
        : trees.filter((tree) => String(getTreeId(tree)) === String(selectedTree));

    return sortTrees(byTree, sortValue)
      .map((tree) => filterTreeRunes(tree, search))
      .filter((tree) => safeArr(tree.slots).some((slot) => slot.runes.length > 0));
  }, [trees, selectedTree, search, sortValue]);

  const totalVisibleRunes = useMemo(() => {
    return filteredTrees.reduce((total, tree) => {
      const treeTotal = safeArr(tree.slots).reduce(
        (slotTotal, slot) => slotTotal + safeArr(slot.runes).length,
        0
      );

      return total + treeTotal;
    }, 0);
  }, [filteredTrees]);

  const selectedRuneText = selectedRune
    ? splitDescription(getRuneFullDescription(selectedRune.rune))
    : [];

  const openRuneModal = ({ rune, tree, slotIndex }) => {
    setSelectedRune({
      rune,
      treeName: getTreeName(tree),
      treeIcon: getTreeIcon(tree),
      slotTitle: getSlotTitle(slotIndex, t),
    });
  };

  const closeRuneModal = () => {
    setSelectedRune(null);
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

    async function loadRunes() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/v1/runes?lang=${apiLang}`, {
          signal: controller.signal,
          headers: { "Accept-Language": apiLang },
        });

        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();
        const list = normalizeList(data);

        if (alive) {
          setTrees(list);
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

    loadRunes();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [apiLang, t.error]);

  useEffect(() => {
    if (!selectedRune) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedRune(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("runes-modal-open");

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("runes-modal-open");
    };
  }, [selectedRune]);

  return (
    <main className="runes">
      {selectedRune && (
        <section
          className="runes-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selectedRune.rune?.name || t.detail}
          onClick={closeRuneModal}
        >
          <div className="runes-modal__inner" onClick={(event) => event.stopPropagation()}>
            <button
              className="runes-modal__close"
              type="button"
              onClick={closeRuneModal}
              aria-label={t.close}
              title={t.close}
            >
              ×
            </button>

            <header className="runes-modal__head">
              <div className="runes-modal__iconBox">
                {getRuneIcon(selectedRune.rune) ? (
                  <img
                    className="runes-modal__icon"
                    src={getRuneIcon(selectedRune.rune)}
                    alt={selectedRune.rune.name}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <span className="runes-modal__fallback">
                    {String(selectedRune.rune?.name || "?").charAt(0)}
                  </span>
                )}
              </div>

              <div className="runes-modal__titleBox">
                <span className="runes-modal__kicker">{t.detail}</span>
                <h2 className="runes-modal__title">{selectedRune.rune.name}</h2>

                <div className="runes-modal__meta">
                  <span>
                    {t.tree}: <strong>{selectedRune.treeName}</strong>
                  </span>

                  <span>
                    {t.branch}: <strong>{selectedRune.slotTitle}</strong>
                  </span>
                </div>
              </div>
            </header>

            <div className="runes-modal__body">
              <div className="runes-modal__text">
                {selectedRuneText.length > 0 ? (
                  selectedRuneText.map((paragraph, index) => (
                    <p className="runes-modal__line" key={`${paragraph}-${index}`}>
                      {renderHighlightedText(paragraph)}
                    </p>
                  ))
                ) : (
                  <p className="runes-modal__line">
                    {getRuneShortDescription(selectedRune.rune)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="runes__panel" aria-label={t.explorerAria}>
        <header className="runes__hero">
          <div className="runes__titleRow">
            <span className="runes__stick" aria-hidden="true" />
            <h1 className="runes__title">{t.title}</h1>
            <span className="runes__stick" aria-hidden="true" />
          </div>

          <div className="runes__searchWrap">
            <div className="runes__searchBarFrame">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t.search}
                sortValue={sortValue}
                onSortChange={setSortValue}
                showSort
              />
            </div>

            <div className="runes__rolesRow">
              <span className="runes__rolesLabel">{t.trees}</span>

              <div className="runes__chips">
                <button
                  type="button"
                  className={`runes__chip ${selectedTree === "all" ? "is-active" : ""}`}
                  onClick={() => setSelectedTree("all")}
                >
                  {t.all}
                </button>

                {treeFilters.map((tree) => {
                  const id = getTreeId(tree);

                  return (
                    <button
                      key={id}
                      type="button"
                      className={`runes__chip ${
                        String(selectedTree) === String(id) ? "is-active" : ""
                      }`}
                      onClick={() => setSelectedTree(id)}
                    >
                      {getTreeName(tree)}
                    </button>
                  );
                })}
              </div>

              <span className="runes__count">
                {t.showing} {totalVisibleRunes} {t.runes}
              </span>
            </div>

            <p className="runes__hint">{t.subtitle}</p>
          </div>
        </header>

        {loading && <p className="runes__status">{t.loading}</p>}

        {error && <p className="runes__status runes__status--error">{error}</p>}

        {!loading && !error && (
          <div className="runes__content">
            {filteredTrees.length > 0 ? (
              <section className="runes__trees" aria-label={t.treesAria}>
                {filteredTrees.map((tree) => (
                  <article className="runes__treeCard" key={getTreeId(tree)}>
                    <header className="runes__treeHead">
                      <div className="runes__treeIconBox">
                        {getTreeIcon(tree) ? (
                          <img
                            className="runes__treeIcon"
                            src={getTreeIcon(tree)}
                            alt=""
                            loading="lazy"
                            aria-hidden="true"
                          />
                        ) : (
                          <span className="runes__treeFallback" aria-hidden="true">
                            {String(getTreeName(tree)).charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="runes__treeText">
                        <h2 className="runes__treeTitle">{getTreeName(tree)}</h2>
                      </div>
                    </header>

                    <div className="runes__slots">
                      {safeArr(tree.slots).map((slot, slotIndex) => {
                        const runes = safeArr(slot.runes);
                        if (!runes.length) return null;

                        return (
                          <section
                            className="runes__slot"
                            key={`${getTreeId(tree)}-${slotIndex}`}
                          >
                            <h3 className="runes__slotTitle">
                              {getSlotTitle(slotIndex, t)}
                            </h3>

                            <div className="runes__grid">
                              {runes.map((rune) => (
                                <button
                                  type="button"
                                  className="runes__card"
                                  key={getRuneId(rune)}
                                  title={rune.name}
                                  onClick={() => openRuneModal({ rune, tree, slotIndex })}
                                >
                                  <span className="runes__iconBox">
                                    {getRuneIcon(rune) ? (
                                      <img
                                        className="runes__icon"
                                        src={getRuneIcon(rune)}
                                        alt={rune.name}
                                        loading="lazy"
                                      />
                                    ) : (
                                      <span className="runes__iconFallback">
                                        {String(rune?.name || "?").charAt(0)}
                                      </span>
                                    )}
                                  </span>

                                  <span className="runes__body">
                                    <span className="runes__name">{rune.name}</span>

                                    {getRuneShortDescription(rune) && (
                                      <span className="runes__desc">
                                        {getRuneShortDescription(rune)}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <div className="runes__empty">
                <p>{t.empty}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}