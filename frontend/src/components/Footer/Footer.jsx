// Pie de página con links a contacto y documentación de la API, con soporte multilenguaje.
// Incluye: contacto, repositorio, docs (swagger), créditos Riot/Data Dragon, copyright,
// y botón "scroll to top".
// Sin dark/light mode.

import React from "react";
import { Link } from "react-router-dom";

// Traducciones
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

import { FaGithub } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
import { HiOutlineBookOpen } from "react-icons/hi";
import { HiArrowUp } from "react-icons/hi";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

import "./Footer.css";

export function Footer({ lang = "EN" }) {
  const t = lang === "EN" ? en : es;

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Left: Brand + disclaimer */}
        <div className="footer__col footer__col--brand">
          <div className="footer__brand">{t.footer.brand}</div>
          <p className="footer__desc">{t.footer.desc}</p>
          <p className="footer__disclaimer">{t.footer.disclaimer}</p>
        </div>

        {/* Center: Links */}
        <nav className="footer__col footer__col--links" aria-label="Footer links">
          <div className="footer__title">{t.footer.linksTitle}</div>

          <div className="footer__links">
            <Link className="footer__link" to="/contact">
              <span className="footer__linkLeft">
                <HiMail className="footer__icon" aria-hidden="true" />
                <span>{t.footer.contact}</span>
              </span>
            </Link>

            <a
              className="footer__link"
              href={t.footer.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t.footer.repoTitle}
              title={t.footer.repoTitle}
            >
              <span className="footer__linkLeft">
                <FaGithub className="footer__icon" aria-hidden="true" />
                <span>{t.footer.repo}</span>
              </span>

              <span className="footer__linkRight" aria-hidden="true">
                <HiArrowTopRightOnSquare className="footer__icon footer__icon--ext" />
              </span>
            </a>

            <Link className="footer__link" to="/swagger">
              <span className="footer__linkLeft">
                <HiOutlineBookOpen className="footer__icon" aria-hidden="true" />
                <span>{t.footer.apiDocs}</span>
              </span>
            </Link>
          </div>
        </nav>

        {/* Right: Credits + Top */}
        <div className="footer__col footer__col--right">
          <div className="footer__title">{t.footer.creditsTitle}</div>

          <p className="footer__credits">{t.footer.credits}</p>

          <button
            className="footer__topBtn"
            type="button"
            onClick={handleScrollTop}
            aria-label={t.footer.toTopAria}
            title={t.footer.toTopTitle}
          >
            <HiArrowUp className="footer__topIcon" aria-hidden="true" />
            {t.footer.toTop}
          </button>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <span className="footer__copy">{t.footer.copyright}</span>
      </div>
    </footer>
  );
}
