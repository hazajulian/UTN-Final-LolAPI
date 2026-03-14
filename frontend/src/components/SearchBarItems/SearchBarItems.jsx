import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const dict = useMemo(() => (lang === "EN" ? en : es), [lang]);

  const i18n = useMemo(() => {
    const ph =
      placeholder ??
      dict?.items?.searchPlaceholder ??
      (lang === "EN" ? "Search items..." : "Buscar objetos...");

    const sortLabel =
      dict?.items?.sortLabel ?? (lang === "EN" ? "Sort" : "Orden");

    const searchAria =
      dict?.items?.searchAria ?? (lang === "EN" ? "Search items" : "Buscar objetos");

    return { ph, sortLabel, searchAria };
  }, [dict, lang, placeholder]);

  const currentSort = useMemo(() => {
    const found = sortOptions.find((o) => o.value === sortValue);
    if (found) return found;
    return sortOptions[0] || { value: "name-asc", labelEN: "A → Z", labelES: "A → Z" };
  }, [sortOptions, sortValue]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleIconClick = () => inputRef.current?.focus();

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
    <div className="itemsSearchbar">
      {/* Input */}
      <div className="itemsSearchbar__inputWrap">
        <input
          ref={inputRef}
          type="text"
          className="itemsSearchbar__input"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={i18n.ph}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          aria-label={i18n.searchAria}
        />

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

        {Boolean(value) && !disabled && (
          <button
            type="button"
            className="itemsSearchbar__clearBtn"
            onClick={handleClear}
            aria-label={lang === "EN" ? "Clear search" : "Limpiar búsqueda"}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
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
          >
            <span className="itemsSearchbar__sortBtnText">
              {lang === "EN" ? currentSort.labelEN : currentSort.labelES}
            </span>
            <span className="itemsSearchbar__caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {sortOpen && (
            <ul className="itemsSearchbar__sortList" role="listbox" aria-label="Sort options">
              {sortOptions
                .filter((opt) => opt.value !== sortValue)
                .map((opt) => (
                  <li
                    key={opt.value}
                    className="itemsSearchbar__sortItem"
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
