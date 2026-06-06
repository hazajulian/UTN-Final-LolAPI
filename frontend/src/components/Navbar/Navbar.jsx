// Navbar.jsx
// Header principal: links + menú unificado en mobile + dropdown desktop.
// - Header fijo arriba.
// - Mobile: un solo menú con toda la navegación.
// - Desktop: links principales al centro + menú a la derecha.
// - Idioma EN/ES persistido en localStorage.
// - Cierra menús al click fuera y al navegar.
// - Auto-hide al scrollear.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

import "./Navbar.css";

export function Navbar({ lang, setLang }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef(null);
  const menuRef = useRef(null);

  const t = useMemo(() => (lang === "EN" ? en : es), [lang]);

  const closeMenu = () => setMenuOpen(false);

  const toggleLanguage = () => {
    const next = lang === "EN" ? "ES" : "EN";
    setLang(next);
    localStorage.setItem("lang", next);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      const headerEl = headerRef.current;
      if (!headerEl) return;

      if (!headerEl.contains(e.target)) {
        setMenuOpen(false);
        return;
      }

      const menuEl = menuRef.current;
      if (menuEl && !menuEl.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const headerEl = headerRef.current;
      if (!headerEl) return;

      const y = window.scrollY;

      if (y < 12) {
        headerEl.classList.remove("navbar--hidden");
        lastY = y;
        return;
      }

      if (y > lastY) headerEl.classList.add("navbar--hidden");
      else headerEl.classList.remove("navbar--hidden");

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="navbar" ref={headerRef}>
        <nav className="navbar__inner" aria-label="Primary navigation">
          {/* LEFT: Official League of Legends link */}
          <div className="navbar__left">
            <a
              className="navbar__brand"
              href="https://www.leagueoflegends.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Open official League of Legends site"
            >
              <span className="navbar__brand-text">League of Legends</span>
              <span className="navbar__brand-short" aria-hidden="true">
                LoL
              </span>
            </a>
          </div>

          {/* CENTER: Main desktop links */}
          <div className="navbar__center" aria-label="Main links">
            <NavLink to="/" className="navbar__link" onClick={closeMenu}>
              {t.navbar?.champions ?? "Champions"}
            </NavLink>

            <span className="navbar__sep" aria-hidden="true">
              |
            </span>

            <NavLink to="/items" className="navbar__link" onClick={closeMenu}>
              {t.navbar?.itemsShop ?? "Items"}
            </NavLink>

            <span className="navbar__sep" aria-hidden="true">
              |
            </span>

            <NavLink
              to="/summoner-spells"
              className="navbar__link"
              onClick={closeMenu}
            >
              {t.navbar?.summonerSpells ?? "Summoner Spells"}
            </NavLink>

            <span className="navbar__sep" aria-hidden="true">
              |
            </span>

            <NavLink to="/runes" className="navbar__link" onClick={closeMenu}>
              {t.navbar?.runes ?? "Runes"}
            </NavLink>

            <span className="navbar__sep" aria-hidden="true">
              |
            </span>

            <NavLink to="/regions" className="navbar__link" onClick={closeMenu}>
              {t.navbar?.regions ?? "Regions"}
            </NavLink>
          </div>

          {/* RIGHT: Unified menu */}
          <div className="navbar__right" ref={menuRef}>
            <button
              className={`navbar__menu-trigger ${menuOpen ? "is-open" : ""}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="navbar__menu-label">
                {t.navbar?.menu ?? "Menu"}
              </span>
              <span className="navbar__menu-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            {menuOpen && (
              <div className="navbar__menu" role="menu" aria-label="Site menu">
                {/* Mobile-only primary links */}
                <div className="navbar__menu-section navbar__menu-section--primary">
                  <NavLink
                    to="/"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.champions ?? "Champions"}
                  </NavLink>

                  <NavLink
                    to="/items"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.itemsShop ?? "Items"}
                  </NavLink>

                  <NavLink
                    to="/summoner-spells"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.summonerSpells ?? "Summoner Spells"}
                  </NavLink>

                  <NavLink
                    to="/runes"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.runes ?? "Runes"}
                  </NavLink>

                  <NavLink
                    to="/regions"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.regions ?? "Regions"}
                  </NavLink>
                </div>

                <div className="navbar__menu-divider" aria-hidden="true" />

                {/* Language */}
                <button
                  type="button"
                  className="navbar__menu-btn"
                  role="menuitem"
                  onClick={toggleLanguage}
                >
                  <span>{t.navbar?.language ?? "Language"}</span>
                  <span className="navbar__pill">{lang}</span>
                </button>

                <div className="navbar__menu-divider" aria-hidden="true" />

                {/* Auth */}
                {!user ? (
                  <Link
                    to="/login"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.login ?? "Login"}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="navbar__menu-link"
                      role="menuitem"
                      onClick={closeMenu}
                    >
                      {t.navbar?.profile ?? "Profile"}
                    </Link>

                    <button
                      type="button"
                      className="navbar__menu-btn"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      {t.navbar?.logout ?? "Logout"}
                    </button>
                  </>
                )}

                <div className="navbar__menu-divider" aria-hidden="true" />

                {/* Extra links */}
                <Link
                  to="/documentation"
                  className="navbar__menu-link"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  {t.navbar?.documentation ?? "Documentation"}
                </Link>

                <Link
                  to="/contact"
                  className="navbar__menu-link"
                  role="menuitem"
                  onClick={closeMenu}
                >
                  {t.navbar?.help ?? "Contact"}
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <div className="navbar__spacer" aria-hidden="true" />
    </>
  );
}