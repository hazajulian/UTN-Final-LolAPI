// SearchBar.jsx
// Barra reutilizable con input controlado, limpiar búsqueda y orden custom.

import React, { useEffect, useRef, useState } from "react";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./SearchBar.css";

const DEFAULT_SORT_OPTIONS = [
  { value: "name-asc", labelKey: "sortAZ" },
  { value: "name-desc", labelKey: "sortZA" },
];

export function SearchBar({
  value,
  onChange,
  className = "",
  placeholder,

  sortValue = "name-asc",
  onSortChange,
  sortOptions = DEFAULT_SORT_OPTIONS,
  showSort = true,

  disabled = false,
}) {
  const { language } = useLanguage();

  const inputRef = useRef(null);
  const sortRef = useRef(null);

  const [sortOpen, setSortOpen] = useState(false);

  const t = translations[language].searchBar;

  const currentSort =
    sortOptions.find((option) => option.value === sortValue) ||
    sortOptions[0] ||
    DEFAULT_SORT_OPTIONS[0];

  const getSortLabel = (option) => {
    if (option.labelKey) return t[option.labelKey];

    if (language === "EN") return option.labelEN || option.label || option.value;
    return option.labelES || option.label || option.value;
  };

  const handleIconClick = () => {
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange?.("");
    inputRef.current?.focus();
  };

  const handleSortToggle = () => {
    if (disabled || !onSortChange) return;
    setSortOpen((open) => !open);
  };

  const handlePickSort = (value) => {
    if (!onSortChange) return;

    onSortChange(value);
    setSortOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className={`searchbar ${className}`}>
      <div className="searchbar__inputWrap">
        <input
          ref={inputRef}
          type="text"
          className="searchbar__input"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder ?? t.placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          aria-label={t.searchAria}
        />

        <button
          type="button"
          className="searchbar__iconBtn"
          onClick={handleIconClick}
          aria-label={t.searchAria}
          disabled={disabled}
        >
          <span className="searchbar__icon" aria-hidden="true">
            ⌕
          </span>
        </button>

        {Boolean(value) && !disabled && (
          <button
            type="button"
            className="searchbar__clearBtn"
            onClick={handleClear}
            aria-label={t.clearSearch}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {showSort && (
        <div className="searchbar__sort" ref={sortRef}>
          <span className="searchbar__sortLabel">{t.sortLabel}</span>

          <button
            type="button"
            className={`searchbar__sortBtn ${sortOpen ? "is-open" : ""}`}
            onClick={handleSortToggle}
            disabled={disabled || !onSortChange}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-label={t.sortResultsAria}
          >
            <span className="searchbar__sortBtnText">
              {getSortLabel(currentSort)}
            </span>

            <span className="searchbar__caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {sortOpen && (
            <ul
              className="searchbar__sortList"
              role="listbox"
              aria-label={t.sortOptionsAria}
            >
              {sortOptions
                .filter((option) => option.value !== sortValue)
                .map((option) => (
                  <li
                    key={option.value}
                    className="searchbar__sortItem"
                    role="option"
                    aria-selected={false}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePickSort(option.value);
                    }}
                  >
                    {getSortLabel(option)}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}