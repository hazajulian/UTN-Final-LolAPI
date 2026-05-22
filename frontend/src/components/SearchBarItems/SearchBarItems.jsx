// SearchBarItems.jsx — Buscador de items

import { useEffect, useMemo, useRef, useState } from "react";
import "./SearchBarItems.css";

import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

const DEFAULT_SORT_OPTIONS = [
  { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" },
  { value: "name-desc", labelEN: "Z → A", labelES: "Z → A" },
];

export function SearchBarItems({
  value,
  onChange,
  lang = "EN",

  placeholder,

  sortValue = "name-asc",
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  showSort = true,

  disabled = false,
}) {
  const inputRef = useRef(null);
  const sortRef = useRef(null);

  const [sortOpen, setSortOpen] = useState(false);

  const dict = useMemo(() => (lang === "EN" ? en : es), [lang]);

  const i18n = useMemo(() => {
    const items = dict?.items ?? {};

    return {
      placeholder:
        placeholder ??
        items.searchPlaceholder ??
        (lang === "EN" ? "Search items..." : "Buscar objetos..."),

      sortLabel:
        items.sortLabel ??
        (lang === "EN" ? "Sort" : "Orden"),

      searchAria:
        items.searchAria ??
        (lang === "EN" ? "Search items" : "Buscar objetos"),

      clearAria:
        items.clearSearch ??
        (lang === "EN" ? "Clear search" : "Limpiar búsqueda"),

      sortAria:
        items.sortAria ??
        (lang === "EN" ? "Sort items" : "Ordenar objetos"),
    };
  }, [dict, lang, placeholder]);

  const currentSort = useMemo(() => {
    const found = sortOptions.find((option) => option.value === sortValue);

    return (
      found ||
      sortOptions[0] || {
        value: "name-asc",
        labelEN: "A → Z",
        labelES: "A → Z",
      }
    );
  }, [sortOptions, sortValue]);

  // Cierra el orden al hacer click afuera.
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleIconClick() {
    inputRef.current?.focus();
  }

  function handleClear() {
    onChange?.("");
    inputRef.current?.focus();
  }

  function handleSortToggle() {
    if (disabled || !onSortChange) return;
    setSortOpen((open) => !open);
  }

  function handlePickSort(value) {
    if (!onSortChange) return;

    onSortChange(value);
    setSortOpen(false);
  }

  return (
    <div className="itemsSearchbar">
      <div className="itemsSearchbar__inputWrap">
        <input
          ref={inputRef}
          type="text"
          className="itemsSearchbar__input"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={i18n.placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          aria-label={i18n.searchAria}
        />

        {Boolean(value) && !disabled && (
          <button
            type="button"
            className="itemsSearchbar__clearBtn"
            onClick={handleClear}
            aria-label={i18n.clearAria}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        <button
          type="button"
          className="itemsSearchbar__iconBtn"
          onClick={handleIconClick}
          aria-label={i18n.searchAria}
          disabled={disabled}
        >
          <span className="itemsSearchbar__icon" aria-hidden="true">
            ⌕
          </span>
        </button>
      </div>

      {showSort && (
        <div className="itemsSearchbar__sort" ref={sortRef}>
          <span className="itemsSearchbar__sortLabel">{i18n.sortLabel}</span>

          <button
            type="button"
            className={`itemsSearchbar__sortBtn ${sortOpen ? "is-open" : ""}`}
            onClick={handleSortToggle}
            disabled={disabled || !onSortChange}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-label={i18n.sortAria}
          >
            <span className="itemsSearchbar__sortBtnText">
              {lang === "EN" ? currentSort.labelEN : currentSort.labelES}
            </span>

            <span className="itemsSearchbar__caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {sortOpen && (
            <ul
              className="itemsSearchbar__sortList"
              role="listbox"
              aria-label={i18n.sortAria}
            >
              {sortOptions
                .filter((option) => option.value !== sortValue)
                .map((option) => (
                  <li
                    key={option.value}
                    className="itemsSearchbar__sortItem"
                    role="option"
                    aria-selected={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePickSort(option.value);
                    }}
                  >
                    {lang === "EN" ? option.labelEN : option.labelES}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}