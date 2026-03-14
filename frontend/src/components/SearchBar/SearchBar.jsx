// Barra de búsqueda reutilizable (sin imágenes / sin svg)
// - Input controlado
// - Icono manual (char) + focus al click
// - Orden custom dropdown (A-Z / Z-A) con mismo look que "Todos"
// - Soporte multilenguaje (EN/ES)

import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SearchBar.css";

import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

const DEFAULT_SORT_OPTIONS = [
  { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" },
  { value: "name-desc", labelEN: "Z → A", labelES: "Z → A" },
];

export function SearchBar({
  value,
  onChange,
  lang = "EN",
  className = "",

  // Placeholder opcional (por si querés pasarlo desde Home / Items)
  placeholder,

  // Orden
  sortValue = "name-asc",
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  showSort = true,

  // UX
  disabled = false,
}) {
  const inputRef = useRef(null);

  // Dropdown (orden)
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const dict = useMemo(() => (lang === "EN" ? en : es), [lang]);

  const i18n = useMemo(() => {
    const ph =
      placeholder ??
      dict?.searchBar?.placeholder ??
      (lang === "EN" ? "Search..." : "Buscar...");

    const sortLabel =
      dict?.searchBar?.sortLabel ?? (lang === "EN" ? "Sort" : "Orden");

    const searchAria =
      dict?.searchBar?.searchAria ?? (lang === "EN" ? "Search" : "Buscar");

    return { ph, sortLabel, searchAria };
  }, [dict, lang, placeholder]);

  const currentSort = useMemo(() => {
    const found = sortOptions.find((o) => o.value === sortValue);
    if (found) return found;
    return sortOptions[0] || { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" };
  }, [sortOptions, sortValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange?.("");
    inputRef.current?.focus();
  };

  const handleSortToggle = () => {
    if (disabled || !onSortChange) return;
    setSortOpen((o) => !o);
  };

  const handlePickSort = (val) => {
    if (!onSortChange) return;
    onSortChange(val);
    setSortOpen(false);
  };

  return (
    <div className={`searchbar ${className}`}>
      {/* Input */}
      <div className="searchbar__inputWrap">
        <input
          ref={inputRef}
          type="text"
          className="searchbar__input"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={i18n.ph}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          aria-label={i18n.searchAria}
        />

        {/* Icono manual (sin imagen/svg) */}
        <button
          type="button"
          className="searchbar__iconBtn"
          onClick={handleIconClick}
          aria-label={i18n.searchAria}
          disabled={disabled}
        >
          <span className="searchbar__icon" aria-hidden="true">
            ⌕
          </span>
        </button>

        {/* Clear: aparece si hay texto */}
        {Boolean(value) && !disabled && (
          <button
            type="button"
            className="searchbar__clearBtn"
            onClick={handleClear}
            aria-label={lang === "EN" ? "Clear search" : "Limpiar búsqueda"}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {/* Orden (custom dropdown) */}
      {showSort && (
        <div className="searchbar__sort" ref={sortRef}>
          <span className="searchbar__sortLabel">{i18n.sortLabel}</span>

          <button
            type="button"
            className={`searchbar__sortBtn ${sortOpen ? "is-open" : ""}`}
            onClick={handleSortToggle}
            disabled={disabled || !onSortChange}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-label={lang === "EN" ? "Sort results" : "Ordenar resultados"}
          >
            <span className="searchbar__sortBtnText">
              {lang === "EN" ? currentSort.labelEN : currentSort.labelES}
            </span>
            <span className="searchbar__caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {sortOpen && (
            <ul className="searchbar__sortList" role="listbox" aria-label="Sort options">
              {sortOptions
                .filter((opt) => opt.value !== sortValue)
                .map((opt) => (
                  <li
                    key={opt.value}
                    className="searchbar__sortItem"
                    role="option"
                    aria-selected={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickSort(opt.value);
                    }}
                  >
                    {lang === "EN" ? opt.labelEN : opt.labelES}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
