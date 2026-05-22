// ItemsModal.jsx — Modal premium de items

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

import { getItemById } from "../../services/api";
import "./ItemsModal.css";

// Limpia el HTML raro de Data Dragon para evitar espacios iniciales excesivos.
function cleanDescription(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "<br />")

    // Elimina wrappers que a veces agregan saltos visuales raros.
    .replace(/<\/?mainText>/gi, "")
    .replace(/<\/?stats>/gi, "")
    .replace(/<\/?rules>/gi, "")

    // Convierte tags custom inline a spans controlables por CSS.
    .replace(/<attention>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/attention>/gi, "</span>")
    .replace(/<passive>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/passive>/gi, "</span>")
    .replace(/<active>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/active>/gi, "</span>")
    .replace(/<unique>/gi, '<span class="itemsModal__descHighlight">')
    .replace(/<\/unique>/gi, "</span>")

    // Saca saltos al inicio de toda la descripción.
    .replace(/^(?:\s|<br\s*\/?>)+/gi, "")

    // Saca saltos entre título de efecto y texto.
    .replace(/<\/span>\s*<br\s*\/?>\s*/gi, "</span> ")

    // Saca saltos al final.
    .replace(/(?:\s|<br\s*\/?>)+$/gi, "")

    // Reduce saltos múltiples.
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br />")

    .trim();
}

function getItemId(item) {
  return item?.itemId ?? item?.id;
}

function getDescription(item) {
  return item?.descriptionRaw || item?.description || "";
}

function getPlainDescription(item) {
  return item?.plaintext || item?.descriptionText || "";
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

function normalizeRelatedItems(items) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function translateRole(role, isEN) {
  const roles = {
    assassin: isEN ? "Assassin" : "Asesino",
    fighter: isEN ? "Fighter" : "Luchador",
    mage: isEN ? "Mage" : "Mago",
    marksman: isEN ? "Marksman" : "Tirador",
    support: isEN ? "Support" : "Soporte",
    tank: isEN ? "Tank" : "Tanque",
  };

  return roles[normalizeKey(role)] ?? formatText(role);
}

function translateStat(stat, isEN) {
  const stats = {
    damage: isEN ? "Damage" : "Daño",
    attackdamage: isEN ? "Attack Damage" : "Daño de ataque",
    spelldamage: isEN ? "Ability Power" : "Poder de habilidad",
    abilitypower: isEN ? "Ability Power" : "Poder de habilidad",
    armorpenetration: isEN ? "Armor Penetration" : "Penetración de armadura",
    magicpenetration: isEN ? "Magic Penetration" : "Penetración mágica",
    criticalstrike: isEN ? "Critical Strike" : "Golpe crítico",
    attackspeed: isEN ? "Attack Speed" : "Velocidad de ataque",
    cooldownreduction: isEN ? "Ability Haste" : "Aceleración de habilidad",
    abilityhaste: isEN ? "Ability Haste" : "Aceleración de habilidad",
    health: isEN ? "Health" : "Vida",
    mana: isEN ? "Mana" : "Maná",
    movement: isEN ? "Movement Speed" : "Velocidad de movimiento",
    movementspeed: isEN ? "Movement Speed" : "Velocidad de movimiento",
    lifesteal: isEN ? "Life Steal" : "Robo de vida",
    armor: isEN ? "Armor" : "Armadura",
    spellblock: isEN ? "Magic Resist" : "Resistencia mágica",
    magicresist: isEN ? "Magic Resist" : "Resistencia mágica",
    consumable: isEN ? "Consumable" : "Consumible",
    slow: isEN ? "Slow" : "Ralentización",
    active: isEN ? "Active" : "Activa",
    lane: isEN ? "Lane" : "Línea",
    manaregen: isEN ? "Mana Regen" : "Regeneración de maná",
    onhit: isEN ? "On-Hit" : "Al impacto",
    nonbootsmovement: isEN ? "Movement Speed" : "Velocidad de movimiento",
    tank: isEN ? "Tank" : "Tanque",
    healthregen: isEN ? "Health Regen" : "Regeneración de vida",
    boots: isEN ? "Boots" : "Botas",
    tenacity: isEN ? "Tenacity" : "Tenacidad",
    jungle: isEN ? "Jungle" : "Jungla",
    spellvamp: isEN ? "Spell Vamp" : "Vampirismo de hechizo",
    allimpacto: isEN ? "On-Hit" : "Al impacto",
  };

  return stats[normalizeKey(stat)] ?? formatText(stat);
}

function translateSection(section, isEN) {
  const sections = {
    item: isEN ? "Item" : "Objeto",
    starter: isEN ? "Starter" : "Inicial",
    consumable: isEN ? "Consumable" : "Consumible",
    trinket: isEN ? "Trinket" : "Talismán",
    distributed: isEN ? "Distributed" : "Distribuido",
    boots: isEN ? "Boots" : "Botas",
    basic: isEN ? "Basic" : "Básico",
    epic: isEN ? "Epic" : "Épico",
    legendary: isEN ? "Legendary" : "Legendario",
    championexclusive: isEN ? "Champion Exclusive" : "Exclusivo de campeón",
    arenaexclusive: isEN ? "Arena Exclusive" : "Exclusivo de arena",
    arenaprismatic: isEN ? "Arena Prismatic" : "Prismático de arena",
    arenaanvil: isEN ? "Arena Anvil" : "Yunque de arena",
  };

  return sections[normalizeKey(section)] ?? formatText(section);
}

function translateTier(tier, isEN) {
  const tiers = {
    basic: isEN ? "Basic" : "Básico",
    epic: isEN ? "Epic" : "Épico",
    legendary: isEN ? "Legendary" : "Legendario",
  };

  return tiers[normalizeKey(tier)] ?? translateSection(tier, isEN);
}

export function ItemsModal({ open, item, onClose, lang = "EN" }) {
  const [currentItem, setCurrentItem] = useState(item);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const isEN = lang === "EN";
  const apiLang = isEN ? "en" : "es";

  const ui = useMemo(
    () => ({
      details: isEN ? "Item details" : "Detalle del objeto",
      close: isEN ? "Close" : "Cerrar",
      gold: isEN ? "Gold" : "Oro",
      total: "Total",
      base: "Base",
      sell: isEN ? "Sell" : "Venta",
      roles: "Roles",
      stats: isEN ? "Stats" : "Estadísticas",
      description: isEN ? "Description" : "Descripción",
      buildPath: isEN ? "Build Path" : "Árbol de armado",
      buildsInto: isEN ? "Builds Into" : "Se convierte en",
      clickHint: isEN ? "Click to inspect" : "Click para inspeccionar",
      loading: isEN ? "Loading item..." : "Cargando objeto...",
    }),
    [isEN]
  );

  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !currentItem) return null;

  const description = cleanDescription(getDescription(currentItem));
  const plaintext = getPlainDescription(currentItem);

  const fromItems = normalizeRelatedItems(currentItem.fromItems);
  const intoItems = normalizeRelatedItems(currentItem.intoItems);

  const roles = Array.isArray(currentItem.roleGroups) ? currentItem.roleGroups : [];
  const tags = Array.isArray(currentItem.tags) ? currentItem.tags : [];

  const gold = currentItem.gold ?? {};
  const totalGold = gold.total ?? "-";
  const baseGold = gold.base ?? "-";
  const sellGold = gold.sell ?? "-";

  async function handleOpenRelated(relatedItem) {
    const relatedId = getItemId(relatedItem);
    if (!relatedId) return;

    try {
      setLoadingRelated(true);

      const detail = await getItemById(relatedId, { lang: apiLang });

      setCurrentItem({
        ...detail,
        description: detail?.descriptionRaw || "",
      });
    } catch {
      setCurrentItem({
        ...relatedItem,
        description: relatedItem?.descriptionRaw || "",
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
        title={ui.clickHint}
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
          <span className="itemsModal__buildName">{relatedItem.name}</span>

          <span className="itemsModal__buildMeta">
            {relatedTier && <span>{translateTier(relatedTier, isEN)}</span>}

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
      aria-label={ui.details}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <article className="itemsModal__panel">
        <button
          type="button"
          className="itemsModal__close"
          onClick={onClose}
          aria-label={ui.close}
        >
          <FaTimes aria-hidden="true" />
        </button>

        {loadingRelated && <div className="itemsModal__loading">{ui.loading}</div>}

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
                  {translateTier(currentItem.tier, isEN)}
                </span>
              )}

              {currentItem.shopSection && (
                <span className="itemsModal__badge">
                  {translateSection(currentItem.shopSection, isEN)}
                </span>
              )}
            </div>
          </div>
        </header>

        <section className="itemsModal__goldGrid" aria-label={ui.gold}>
          <div className="itemsModal__goldCard">
            <FaCoins className="itemsModal__goldIcon" aria-hidden="true" />
            <span className="itemsModal__goldLabel">{ui.total}</span>
            <strong className="itemsModal__goldValue">{totalGold}</strong>
          </div>

          <div className="itemsModal__goldCard">
            <FaHammer className="itemsModal__goldIcon" aria-hidden="true" />
            <span className="itemsModal__goldLabel">{ui.base}</span>
            <strong className="itemsModal__goldValue">{baseGold}</strong>
          </div>

          <div className="itemsModal__goldCard">
            <FaCoins className="itemsModal__goldIcon" aria-hidden="true" />
            <span className="itemsModal__goldLabel">{ui.sell}</span>
            <strong className="itemsModal__goldValue">{sellGold}</strong>
          </div>
        </section>

        {(description || plaintext) && (
          <section className="itemsModal__section">
            <h3 className="itemsModal__sectionTitle">
              <FaMagic aria-hidden="true" />
              {ui.description}
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
                {ui.roles}
              </h3>

              <div className="itemsModal__chips">
                {roles.map((role) => (
                  <span key={role} className="itemsModal__chip">
                    {translateRole(role, isEN)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="itemsModal__metaBlock">
              <h3 className="itemsModal__sectionTitle">
                <FaTags aria-hidden="true" />
                {ui.stats}
              </h3>

              <div className="itemsModal__chips">
                {tags.map((tag) => (
                  <span key={tag} className="itemsModal__chip itemsModal__chip--soft">
                    {translateStat(tag, isEN)}
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
              {ui.buildPath}
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
              {ui.buildsInto}
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
      </article>
    </div>
  );
}