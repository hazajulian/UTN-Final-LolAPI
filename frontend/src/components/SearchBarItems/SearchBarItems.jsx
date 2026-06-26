// SearchBarItems.jsx
// Buscador reutilizable para Items con orden custom.

import { useEffect, useRef, useState } from "react";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./SearchBarItems.css";

const DEFAULT_SORT_OPTIONS = [
  { value: "name-asc", labelKey: "sortAZ" },
  { value: "name-desc", labelKey: "sortZA" },
];

export function SearchBarItems({
  value,
  onChange,

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

  const t = translations[language].items;

  const currentSort =
    sortOptions.find((option) => option.value === sortValue) ||
    sortOptions[0] ||
    DEFAULT_SORT_OPTIONS[0];

  const getSortLabel = (option) => {
    if (option.labelKey) {
      return t[option.labelKey];
    }

    if (language === "EN") {
      return option.labelEN || option.label || option.value;
    }

    return option.labelES || option.label || option.value;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

    setSortOpen((open) => !open);
  };

  const handlePickSort = (value) => {
    if (!onSortChange) return;

    onSortChange(value);
    setSortOpen(false);
  };

  return (
    <div className="itemsSearchbar">
      <div className="itemsSearchbar__inputWrap">
        <input
          ref={inputRef}
          type="text"
          className="itemsSearchbar__input"
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder ?? t.searchPlaceholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          aria-label={t.searchAria}
        />

        {Boolean(value) && !disabled && (
          <button
            type="button"
            className="itemsSearchbar__clearBtn"
            onClick={handleClear}
            aria-label={t.clearSearch}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        <button
          type="button"
          className="itemsSearchbar__iconBtn"
          onClick={handleIconClick}
          aria-label={t.searchAria}
          disabled={disabled}
        >
          <span className="itemsSearchbar__icon" aria-hidden="true">
            ⌕
          </span>
        </button>
      </div>

      {showSort && (
        <div className="itemsSearchbar__sort" ref={sortRef}>
          <span className="itemsSearchbar__sortLabel">
            {t.sortLabel}
          </span>

          <button
            type="button"
            className={`itemsSearchbar__sortBtn ${sortOpen ? "is-open" : ""}`}
            onClick={handleSortToggle}
            disabled={disabled || !onSortChange}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-label={t.sortAria}
          >
            <span className="itemsSearchbar__sortBtnText">
              {getSortLabel(currentSort)}
            </span>

            <span className="itemsSearchbar__caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {sortOpen && (
            <ul
              className="itemsSearchbar__sortList"
              role="listbox"
              aria-label={t.sortAria}
            >
              {sortOptions
                .filter((option) => option.value !== sortValue)
                .map((option) => (
                  <li
                    key={option.value}
                    className="itemsSearchbar__sortItem"
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