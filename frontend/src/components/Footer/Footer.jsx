// Footer.jsx
// Pie de página con enlaces, créditos y acceso rápido al inicio.

import React from "react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import { HiMail, HiOutlineBookOpen, HiArrowUp } from "react-icons/hi";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./Footer.css";

const GITHUB_URL = "https://github.com/hazajulian/LoL-Hub";

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRouteTop = () => {
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 0);
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col footer__col--brand">
          <div className="footer__brand">{t.brand}</div>
          <p className="footer__desc">{t.desc}</p>
          <p className="footer__disclaimer">{t.disclaimer}</p>
        </div>

        <nav className="footer__col footer__col--links" aria-label={t.linksAria}>
          <div className="footer__title">{t.linksTitle}</div>

          <div className="footer__links">
            <Link className="footer__link" to="/contact" onClick={handleRouteTop}>
              <span className="footer__linkLeft">
                <HiMail className="footer__icon" aria-hidden="true" />
                <span>{t.contact}</span>
              </span>
            </Link>

            <a
              className="footer__link"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t.repoTitle}
              title={t.repoTitle}
            >
              <span className="footer__linkLeft">
                <FaGithub className="footer__icon" aria-hidden="true" />
                <span>{t.repo}</span>
              </span>

              <span className="footer__linkRight" aria-hidden="true">
                <HiArrowTopRightOnSquare className="footer__icon footer__icon--ext" />
              </span>
            </a>

            <Link
              className="footer__link"
              to="/documentation"
              onClick={handleRouteTop}
            >
              <span className="footer__linkLeft">
                <HiOutlineBookOpen className="footer__icon" aria-hidden="true" />
                <span>{t.docs}</span>
              </span>
            </Link>
          </div>
        </nav>

        <div className="footer__col footer__col--right">
          <div className="footer__title">{t.creditsTitle}</div>

          <p className="footer__credits">{t.credits}</p>

          <button
            className="footer__topBtn"
            type="button"
            onClick={handleScrollTop}
            aria-label={t.toTopAria}
            title={t.toTopTitle}
          >
            <HiArrowUp className="footer__topIcon" aria-hidden="true" />
            {t.toTop}
          </button>
        </div>
      </div>

      <div className="footer__bottom">
        <span className="footer__copy">{t.copyright}</span>
      </div>
    </footer>
  );
}