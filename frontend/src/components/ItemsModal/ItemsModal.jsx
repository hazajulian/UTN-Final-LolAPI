import { useEffect } from "react";
import "./ItemsModal.css";

export function ItemsModal({ open, item, onClose, lang = "EN" }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div
      className="itemsModal"
      role="dialog"
      aria-modal="true"
      aria-label={lang === "EN" ? "Item details" : "Detalle del objeto"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="itemsModal__panel">
        <button type="button" className="itemsModal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="itemsModal__header">
          <img className="itemsModal__icon" src={item.iconUrl} alt={item.name} />
          <div className="itemsModal__titleWrap">
            <h2 className="itemsModal__title">{item.name}</h2>
            <p className="itemsModal__sub">
              {item.tier?.toUpperCase()} • {item.shopSection?.toUpperCase()}
            </p>
          </div>
        </div>

        {item.description && (
          <p className="itemsModal__desc" dangerouslySetInnerHTML={{ __html: item.description }} />
        )}

        <div className="itemsModal__meta">
          <div className="itemsModal__metaRow">
            <span className="itemsModal__label">{lang === "EN" ? "Gold" : "Oro"}</span>
            <span className="itemsModal__value">
              {item.gold?.total ?? "-"} ({lang === "EN" ? "sell" : "venta"} {item.gold?.sell ?? "-"})
            </span>
          </div>

          {Array.isArray(item.roleGroups) && item.roleGroups.length > 0 && (
            <div className="itemsModal__metaRow">
              <span className="itemsModal__label">{lang === "EN" ? "Roles" : "Roles"}</span>
              <span className="itemsModal__value">{item.roleGroups.join(", ")}</span>
            </div>
          )}

          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="itemsModal__metaRow">
              <span className="itemsModal__label">{lang === "EN" ? "Stats" : "Stats"}</span>
              <span className="itemsModal__value">{item.tags.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
