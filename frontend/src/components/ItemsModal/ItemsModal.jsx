// ItemsModal.jsx
// Modal de detalle para objetos, armado, estadísticas y navegación entre items.

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaCoins,
  FaHammer,
  FaInfoCircle,
  FaMagic,
  FaShieldAlt,
  FaTags,
  FaTimes,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
import { getItemById } from "../../services/api";

import "./ItemsModal.css";

const ITEM_STAT_HIGHLIGHTS = [
  { terms: ["Daño de Ataque", "Attack Damage"], className: "itemsModal__stat--attack" },
  { terms: ["Penetración de Armadura", "Armor Penetration"], className: "itemsModal__stat--armorPen" },
  { terms: ["Letalidad", "Lethality"], className: "itemsModal__stat--lethality" },
  { terms: ["Velocidad de Ataque", "Attack Speed"], className: "itemsModal__stat--attackSpeed" },
  { terms: ["Aceleración de Habilidad", "Ability Haste"], className: "itemsModal__stat--haste" },
  { terms: ["Vida", "Health"], className: "itemsModal__stat--health" },
  { terms: ["Resistencia Mágica", "Resistencia Magica", "Magic Resist"], className: "itemsModal__stat--magicResist" },
  { terms: ["Armadura", "Armor"], className: "itemsModal__stat--armor" },
  { terms: ["Golpe Crítico", "Golpe Critico", "Critical Strike"], className: "itemsModal__stat--crit" },
  { terms: ["Velocidad de Movimiento", "Movement Speed", "Move Speed"], className: "itemsModal__stat--moveSpeed" },
  { terms: ["Robo de Vida", "Life Steal"], className: "itemsModal__stat--lifeSteal" },
  { terms: ["Regen. de Maná Básica", "Base Mana Regen"], className: "itemsModal__stat--mana" },
  { terms: ["Regen. de Vida Básica", "Base Health Regen"], className: "itemsModal__stat--health" },
  { terms: ["Poder de Habilidad", "Ability Power"], className: "itemsModal__stat--abilityPower" },
  { terms: ["Penetración de Magia", "Penetración Mágica", "Magic Penetration"], className: "itemsModal__stat--magicPen" },
  { terms: ["Omnivampirismo", "Omnivamp"], className: "itemsModal__stat--omnivamp" },
  { terms: ["Maná", "Mana"], className: "itemsModal__stat--mana" },
  { terms: ["Tenacidad", "Tenacity"], className: "itemsModal__stat--tenacity" },
];

function cleanDescription(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "<br />")
    .replace(/<\/?mainText>/gi, "")
    .replace(/<\/?stats>/gi, "")
    .replace(/<\/?rules>/gi, "")
    .replace(/<attention>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/attention>/gi, "</span>")
    .replace(/<passive>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/passive>/gi, "</span>")
    .replace(/<active>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/active>/gi, "</span>")
    .replace(/<unique>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/unique>/gi, "</span>")
    .replace(/^(?:\s|<br\s*\/?>)+/gi, "")
    .replace(/<\/span>\s*<br\s*\/?>\s*/gi, "</span> ")
    .replace(/(?:\s|<br\s*\/?>)+$/gi, "")
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br />")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeKey(value) {
  return String(value ?? "")
    .replaceAll("_", "")
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .toLowerCase();
}

function formatText(value) {
  if (!value) return "-";
  return String(value).replaceAll("_", " ");
}

function unwrapApiData(value) {
  if (value?.data?.data) return value.data.data;
  if (value?.data) return value.data;
  return value;
}

function normalizeItem(value) {
  const unwrapped = unwrapApiData(value);

  if (!unwrapped || typeof unwrapped !== "object") return null;

  return {
    ...unwrapped,
    id: unwrapped.id ?? unwrapped.itemId,
    itemId: unwrapped.itemId ?? unwrapped.id,
  };
}

function getItemId(item) {
  return item?.itemId ?? item?.id;
}

function getDescription(item) {
  return (
    item?.descriptionRaw ||
    item?.description ||
    item?.rawDescription ||
    item?.htmlDescription ||
    ""
  );
}

function getPlainDescription(item) {
  return item?.plaintext || item?.descriptionText || item?.plainText || "";
}

function normalizeRelatedItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => normalizeItem(item))
    .filter(Boolean);
}

function getFromItems(item) {
  return normalizeRelatedItems(
    item?.fromItems ||
      item?.fromItemDetails ||
      item?.fromDetails ||
      item?.from ||
      []
  );
}

function getIntoItems(item) {
  return normalizeRelatedItems(
    item?.intoItems ||
      item?.intoItemDetails ||
      item?.intoDetails ||
      item?.into ||
      []
  );
}

function getStatClass(term) {
  const normalized = String(term).toLowerCase();

  const group = ITEM_STAT_HIGHLIGHTS.find((item) =>
    item.terms.some((stat) => stat.toLowerCase() === normalized)
  );

  return group?.className || "itemsModal__stat--default";
}

function translateByKey(value, dictionary = {}) {
  return dictionary[normalizeKey(value)] ?? formatText(value);
}

function highlightTextChunk(text) {
  if (!text) return text;

  const terms = ITEM_STAT_HIGHLIGHTS.flatMap((item) => item.terms).sort(
    (a, b) => b.length - a.length
  );

  const letters = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
  const pattern = new RegExp(
    `(^|[^${letters}])(${terms.map(escapeRegExp).join("|")})(?=$|[^${letters}])`,
    "g"
  );

  return String(text).replace(pattern, (fullMatch, prefix, match) => {
    const className = getStatClass(match);
    return `${prefix}<span class="itemsModal__stat ${className}">${match}</span>`;
  });
}

function highlightDescription(html = "") {
  const cleanHtml = cleanDescription(html);

  if (!cleanHtml) return "";

  const highlightSpanPattern =
    /(<span class="itemsModal__descHighlight">[\s\S]*?<\/span>)/g;

  return cleanHtml
    .split(highlightSpanPattern)
    .map((part) => {
      if (!part) return "";

      if (highlightSpanPattern.test(part)) {
        highlightSpanPattern.lastIndex = 0;
        return part;
      }

      highlightSpanPattern.lastIndex = 0;

      return part
        .split(/(<[^>]+>)/g)
        .map((chunk) => {
          if (chunk.startsWith("<") && chunk.endsWith(">")) return chunk;
          return highlightTextChunk(chunk);
        })
        .join("");
    })
    .join("");
}

export function ItemsModal({ open, item, loading = false, onClose }) {
  const { language } = useLanguage();

  const [currentItem, setCurrentItem] = useState(() => normalizeItem(item));
  const [loadingRelated, setLoadingRelated] = useState(false);

  const t = translations[language].items.modal;
  const itemTerms = translations[language].items.terms;
  const apiLang = language === "EN" ? "en" : "es";

  useEffect(() => {
    setCurrentItem(normalizeItem(item));
  }, [item]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const description = useMemo(() => {
    return highlightDescription(getDescription(currentItem));
  }, [currentItem]);

  const plaintext = getPlainDescription(currentItem);

  const fromItems = useMemo(() => {
    return getFromItems(currentItem);
  }, [currentItem]);

  const intoItems = useMemo(() => {
    return getIntoItems(currentItem);
  }, [currentItem]);

  const roles = Array.isArray(currentItem?.roleGroups)
    ? currentItem.roleGroups
    : [];

  const tags = Array.isArray(currentItem?.tags) ? currentItem.tags : [];

  const gold = currentItem?.gold ?? {};
  const totalGold = gold.total ?? "-";
  const baseGold = gold.base ?? "-";
  const sellGold = gold.sell ?? "-";

  if (!open) return null;

  const isLoading = loading || loadingRelated;

  async function handleOpenRelated(relatedItem) {
    const relatedId = getItemId(relatedItem);
    if (!relatedId) return;

    const fallbackRelated = normalizeItem(relatedItem);

    try {
      setLoadingRelated(true);

      const response = await getItemById(relatedId, { lang: apiLang });
      const detail = normalizeItem(response);

      setCurrentItem({
        ...fallbackRelated,
        ...detail,
        description:
          detail?.descriptionRaw ||
          detail?.description ||
          fallbackRelated?.descriptionRaw ||
          fallbackRelated?.description ||
          "",
      });
    } catch {
      setCurrentItem({
        ...fallbackRelated,
        description:
          fallbackRelated?.descriptionRaw ||
          fallbackRelated?.description ||
          "",
      });
    } finally {
      setLoadingRelated(false);
    }
  }

  function RelatedItemCard({ relatedItem, variant = "from" }) {
    const relatedGold = relatedItem?.gold?.total;
    const relatedTier = relatedItem?.tier || relatedItem?.shopSection;

    return (
      <button
        type="button"
        className="itemsModal__buildCard"
        onClick={() => handleOpenRelated(relatedItem)}
        title={t.clickHint}
      >
        <span className="itemsModal__buildIconFrame">
          <img
            className="itemsModal__buildIcon"
            src={relatedItem.iconUrl}
            alt={relatedItem.name}
            loading="lazy"
          />
        </span>

        <span className="itemsModal__buildInfo">
          <span className="itemsModal__buildName">
            {relatedItem.name || relatedItem.itemId || relatedItem.id}
          </span>

          <span className="itemsModal__buildMeta">
            {relatedTier && (
              <span>{translateByKey(relatedTier, itemTerms.tiers)}</span>
            )}

            {relatedGold != null && (
              <span className="itemsModal__buildGold">
                <FaCoins aria-hidden="true" />
                {relatedGold}
              </span>
            )}
          </span>
        </span>

        <span
          className={`itemsModal__buildAction ${
            variant === "into" ? "itemsModal__buildAction--up" : ""
          }`}
          aria-hidden="true"
        >
          {variant === "into" ? <FaArrowUp /> : <FaInfoCircle />}
        </span>
      </button>
    );
  }

  return (
    <div
      className="itemsModal"
      role="dialog"
      aria-modal="true"
      aria-label={t.details}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <article className="itemsModal__panel">
        <button
          type="button"
          className="itemsModal__close"
          onClick={onClose}
          aria-label={t.close}
        >
          <FaTimes aria-hidden="true" />
        </button>

        {isLoading && <div className="itemsModal__loading">{t.loading}</div>}

        {currentItem && (
          <>
            <header className="itemsModal__header">
              <span className="itemsModal__iconFrame">
                <img
                  className="itemsModal__icon"
                  src={currentItem.iconUrl}
                  alt={currentItem.name}
                />
              </span>

              <div className="itemsModal__titleWrap">
                <h2 className="itemsModal__title">{currentItem.name}</h2>

                <div className="itemsModal__badges">
                  {currentItem.tier && (
                    <span className="itemsModal__badge itemsModal__badge--gold">
                      {translateByKey(currentItem.tier, itemTerms.tiers)}
                    </span>
                  )}

                  {currentItem.shopSection && (
                    <span className="itemsModal__badge">
                      {translateByKey(currentItem.shopSection, itemTerms.sections)}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <section className="itemsModal__goldGrid" aria-label={t.gold}>
              <div className="itemsModal__goldCard">
                <FaCoins className="itemsModal__goldIcon" aria-hidden="true" />
                <span className="itemsModal__goldLabel">{t.total}</span>
                <strong className="itemsModal__goldValue">{totalGold}</strong>
              </div>

              <div className="itemsModal__goldCard">
                <FaHammer className="itemsModal__goldIcon" aria-hidden="true" />
                <span className="itemsModal__goldLabel">{t.base}</span>
                <strong className="itemsModal__goldValue">{baseGold}</strong>
              </div>

              <div className="itemsModal__goldCard">
                <FaCoins className="itemsModal__goldIcon" aria-hidden="true" />
                <span className="itemsModal__goldLabel">{t.sell}</span>
                <strong className="itemsModal__goldValue">{sellGold}</strong>
              </div>
            </section>

            {(description || plaintext) && (
              <section className="itemsModal__section">
                <h3 className="itemsModal__sectionTitle">
                  <FaMagic aria-hidden="true" />
                  {t.description}
                </h3>

                {description ? (
                  <div
                    className="itemsModal__desc"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                ) : (
                  <p className="itemsModal__plain">{plaintext}</p>
                )}
              </section>
            )}

            <section className="itemsModal__meta">
              {roles.length > 0 && (
                <div className="itemsModal__metaBlock">
                  <h3 className="itemsModal__sectionTitle">
                    <FaShieldAlt aria-hidden="true" />
                    {t.roles}
                  </h3>

                  <div className="itemsModal__chips">
                    {roles.map((role) => (
                      <span key={role} className="itemsModal__chip">
                        {translateByKey(role, itemTerms.roles)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="itemsModal__metaBlock">
                  <h3 className="itemsModal__sectionTitle">
                    <FaTags aria-hidden="true" />
                    {t.stats}
                  </h3>

                  <div className="itemsModal__chips">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="itemsModal__chip itemsModal__chip--soft"
                      >
                        {translateByKey(tag, itemTerms.stats)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {fromItems.length > 0 && (
              <section className="itemsModal__section">
                <h3 className="itemsModal__sectionTitle">
                  <FaHammer aria-hidden="true" />
                  {t.buildPath}
                </h3>

                <div className="itemsModal__buildGrid">
                  {fromItems.map((relatedItem) => (
                    <RelatedItemCard
                      key={`from-${getItemId(relatedItem)}`}
                      relatedItem={relatedItem}
                      variant="from"
                    />
                  ))}
                </div>
              </section>
            )}

            {intoItems.length > 0 && (
              <section className="itemsModal__section">
                <h3 className="itemsModal__sectionTitle">
                  <FaArrowUp aria-hidden="true" />
                  {t.buildsInto}
                </h3>

                <div className="itemsModal__buildGrid">
                  {intoItems.map((relatedItem) => (
                    <RelatedItemCard
                      key={`into-${getItemId(relatedItem)}`}
                      relatedItem={relatedItem}
                      variant="into"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </article>
    </div>
  );
}