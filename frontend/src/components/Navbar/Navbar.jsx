// Navbar.jsx
// Header principal: links + menú unificado en mobile + dropdown (desktop) + opciones según auth.
// - Header fijo arriba.
// - Mobile: un solo menú (Menu) que contiene todo.
// - Desktop: links al centro + dropdown a la derecha.
// - Idioma EN/ES persistido en localStorage.
// - Cierra menús al click fuera y al navegar.
// - Auto-hide al scrollear: se oculta al bajar, vuelve al subir (premium UX, no rompe layout).

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

  /* -----------------------------
   Helpers
  ----------------------------- */
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

  /* -----------------------------
   UX: close menu on outside click
  ----------------------------- */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const headerEl = headerRef.current;
      if (!headerEl) return;

      // Click fuera del header => cerrar todo
      if (!headerEl.contains(e.target)) {
        setMenuOpen(false);
        return;
      }

      // Click dentro del header pero fuera del menú => cerrar menú
      const menuEl = menuRef.current;
      if (menuEl && !menuEl.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  /* -----------------------------
   UX: auto-hide header on scroll
   - Scroll down: hide
   - Scroll up: show
   - Cerca del top: siempre visible
  ----------------------------- */
  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const headerEl = headerRef.current;
      if (!headerEl) return;

      const y = window.scrollY;

      // Cerca del top: visible siempre (se siente más estable/premium)
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
          {/* LEFT: External official link (premium button) */}
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

          {/* CENTER: Primary links (desktop) */}
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

            <NavLink to="/swagger" className="navbar__link" onClick={closeMenu}>
              {t.navbar?.swagger ?? "Documentation"}
            </NavLink>
          </div>

          {/* RIGHT: Menu button (unificado para mobile + dropdown en desktop) */}
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
                {/* Mobile-only: primary nav links (shown via CSS) */}
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
                    to="/swagger"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    {t.navbar?.swagger ?? "Documentation"}
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

                    <Link
                      to="/create-champion"
                      className="navbar__menu-link"
                      role="menuitem"
                      onClick={closeMenu}
                    >
                      {t.navbar?.createChampion ?? "Create Champion"}
                    </Link>

                    <Link
                      to="/favorites"
                      className="navbar__menu-link"
                      role="menuitem"
                      onClick={closeMenu}
                    >
                      {t.navbar?.favorites ?? "Favorites"}
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

                {/* Contact */}
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

      {/* Spacer para que el contenido no quede debajo del header fijo */}
      <div className="navbar__spacer" aria-hidden="true" />
    </>
  );
}
