// Navbar.jsx
// Header principal con navegación, home, auth, idioma, menú responsive y mensaje de cierre de sesión.

import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./Navbar.css";

const LOL_OFFICIAL_URL = "https://www.leagueoflegends.com/";

const MAIN_LINKS = [
  { to: "/champions", key: "champions" },
  { to: "/items", key: "itemsShop" },
  { to: "/summoner-spells", key: "summonerSpells" },
  { to: "/runes", key: "runes" },
  { to: "/regions", key: "regions" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const toastTimerRef = useRef(null);

  const t = translations[language].navbar;

  const closeMenu = () => setMenuOpen(false);

  const scrollToPageTop = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      });
    });
  };

  const handleNavigateTop = () => {
    closeMenu();
    scrollToPageTop();
  };

  const showToast = (message) => {
    setToastMessage(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 2600);
  };

  const handleLogout = () => {
    logout();
    closeMenu();

    if (location.pathname === "/profile") {
      navigate("/");
      scrollToPageTop();
    }

    showToast(t.logoutSuccess);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const headerEl = headerRef.current;
      const menuEl = menuRef.current;

      if (!headerEl) return;

      if (!headerEl.contains(event.target)) {
        closeMenu();
        return;
      }

      if (menuEl && !menuEl.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const headerEl = headerRef.current;
      if (!headerEl) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY < 12) {
        headerEl.classList.remove("navbar--hidden");
        lastScrollY = currentScrollY;
        return;
      }

      headerEl.classList.toggle("navbar--hidden", currentScrollY > lastScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const renderMainLinks = (className, role) =>
    MAIN_LINKS.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={className}
        role={role}
        onClick={handleNavigateTop}
      >
        {t[link.key]}
      </NavLink>
    ));

  return (
    <>
      <header className="navbar" ref={headerRef}>
        <nav className="navbar__inner" aria-label={t.primaryNavAria}>
          <div className="navbar__left">
            <a
              className="navbar__brand"
              href={LOL_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={t.officialSiteTitle}
              aria-label={t.officialSiteAria}
            >
              <span className="navbar__brand-text">{t.officialSite}</span>
              <span className="navbar__brand-short" aria-hidden="true">
                LoL
              </span>
            </a>
          </div>

          <div className="navbar__center" aria-label={t.mainLinksAria}>
            {MAIN_LINKS.map((link, index) => (
              <React.Fragment key={link.to}>
                <NavLink
                  to={link.to}
                  className="navbar__link"
                  onClick={handleNavigateTop}
                >
                  {t[link.key]}
                </NavLink>

                {index < MAIN_LINKS.length - 1 && (
                  <span className="navbar__sep" aria-hidden="true">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="navbar__right" ref={menuRef}>
            <NavLink
              to="/"
              end
              className="navbar__homeLink"
              onClick={handleNavigateTop}
              aria-label={t.home}
              title={t.home}
            >
              <FaHome className="navbar__homeIcon" aria-hidden="true" />
            </NavLink>

            <button
              className={`navbar__menu-trigger ${menuOpen ? "is-open" : ""}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t.menuAria}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="navbar__menu-label">{t.menu}</span>
              <span className="navbar__menu-caret" aria-hidden="true">
                ▾
              </span>
            </button>

            {menuOpen && (
              <div className="navbar__menu" role="menu" aria-label={t.siteMenuAria}>
                <div className="navbar__menu-section navbar__menu-section--primary">
                  {renderMainLinks("navbar__menu-link", "menuitem")}
                </div>

                <div className="navbar__menu-divider" aria-hidden="true" />

                <button
                  type="button"
                  className="navbar__menu-btn"
                  role="menuitem"
                  onClick={toggleLanguage}
                >
                  <span>{t.language}</span>
                  <span className="navbar__pill">{language}</span>
                </button>

                <div className="navbar__menu-divider" aria-hidden="true" />

                {!user ? (
                  <Link
                    to="/login"
                    className="navbar__menu-link"
                    role="menuitem"
                    onClick={handleNavigateTop}
                  >
                    {t.login}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="navbar__menu-link"
                      role="menuitem"
                      onClick={handleNavigateTop}
                    >
                      {t.profile}
                    </Link>

                    <button
                      type="button"
                      className="navbar__menu-btn"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      {t.logout}
                    </button>
                  </>
                )}

                <div className="navbar__menu-divider" aria-hidden="true" />

                <Link
                  to="/documentation"
                  className="navbar__menu-link"
                  role="menuitem"
                  onClick={handleNavigateTop}
                >
                  {t.documentation}
                </Link>

                <Link
                  to="/contact"
                  className="navbar__menu-link"
                  role="menuitem"
                  onClick={handleNavigateTop}
                >
                  {t.help}
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {toastMessage && (
        <div className="navbar__toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      <div className="navbar__spacer" aria-hidden="true" />
    </>
  );
}