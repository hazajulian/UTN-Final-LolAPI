// Home.jsx
// Landing principal de LoL Hub con hero visual, accesos rápidos y enlaces útiles.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaEnvelope, FaUserAlt } from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import Runaterra2 from "../../assets/home/Runaterra-2.png";
import Runaterra8 from "../../assets/home/Runaterra-8.png";
import Runaterra6 from "../../assets/home/Runaterra-6.png";
import Runaterra11 from "../../assets/home/Runaterra-11.png";
import Runaterra4 from "../../assets/home/Runaterra-4.png";
import Runaterra10 from "../../assets/home/Runaterra-10.png";
import Runaterra7 from "../../assets/home/Runaterra-7.png";

import Campeones2 from "../../assets/home/Campeones-2.png";
import Items3 from "../../assets/home/Items-3.png";
import Hechizos1 from "../../assets/home/Hechizos-1.png";
import Runas1 from "../../assets/home/Runas-1.png";
import Regiones1 from "../../assets/home/Regiones-1.png";

import "./Home.css";

const HERO_IMAGES = [
  Runaterra2,
  Runaterra8,
  Runaterra6,
  Runaterra11,
  Runaterra4,
  Runaterra10,
  Runaterra7,
];

const EXPLORE_LINKS = [
  { to: "/champions", key: "champions", image: Campeones2 },
  { to: "/items", key: "items", image: Items3 },
  { to: "/summoner-spells", key: "spells", image: Hechizos1 },
  { to: "/runes", key: "runes", image: Runas1 },
  { to: "/regions", key: "regions", image: Regiones1 },
];

const UTILITY_LINKS = [
  { to: "/profile", key: "profile", icon: <FaUserAlt /> },
  { to: "/documentation", key: "documentation", icon: <FaBookOpen /> },
  { to: "/contact", key: "contact", icon: <FaEnvelope /> },
];

export default function Home() {
  const { language } = useLanguage();
  const text = translations[language].home;

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_IMAGES.length);
    }, 7000);

    return () => clearInterval(timer);
  }, []);

  const navigateToTop = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      });
    });
  };

  return (
    <main className="home">
      <section className="home__hero" aria-label={text.heroAria}>
        <div className="home__slider" aria-hidden="true">
          {HERO_IMAGES.map((image, index) => (
            <img
              key={image}
              className={`home__slide ${
                index === activeSlide ? "is-active" : ""
              }`}
              src={image}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        <div className="home__overlay" aria-hidden="true" />

        <div className="home__heroContent">
          <span className="home__eyebrow">{text.eyebrow}</span>

          <h1 className="home__title">{text.title}</h1>

          <p className="home__subtitle">{text.subtitle}</p>

          <div className="home__actions">
            <a className="home__primaryBtn" href="#explore">
              {text.exploreAction}
            </a>

            <Link
              className="home__secondaryBtn"
              to="/champions"
              onClick={navigateToTop}
            >
              {text.championsAction}
            </Link>
          </div>
        </div>

        <div className="home__dots" aria-label={text.sliderAria}>
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`home__dot ${
                index === activeSlide ? "is-active" : ""
              }`}
              onClick={() => setActiveSlide(index)}
              aria-label={`${text.slideLabel} ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section
        className="home__explore"
        id="explore"
        aria-label={text.exploreAria}
      >
        <header className="home__sectionHead">
          <span className="home__sectionLine" aria-hidden="true" />

          <div>
            <h2>{text.exploreTitle}</h2>
            <p>{text.exploreSubtitle}</p>
          </div>

          <span className="home__sectionLine" aria-hidden="true" />
        </header>

        <div className="home__grid">
          {EXPLORE_LINKS.map((item) => (
            <Link
              className="home__card"
              to={item.to}
              key={item.key}
              onClick={navigateToTop}
            >
              <img
                className="home__cardImage"
                src={item.image}
                alt={text.links[item.key].title}
                loading="lazy"
              />

              <span className="home__cardOverlay" aria-hidden="true" />

              <span className="home__cardContent">
                <strong>{text.links[item.key].title}</strong>
                <small>{text.links[item.key].text}</small>
                <span className="home__cardAction">{text.cardAction}</span>
              </span>
            </Link>
          ))}
        </div>

        <section className="home__utility" aria-label={text.utilityAria}>
          <div className="home__utilityHead">
            <span className="home__utilityKicker">{text.utilityKicker}</span>
            <h2>{text.utilityTitle}</h2>
          </div>

          <div className="home__utilityGrid">
            {UTILITY_LINKS.map((item) => (
              <Link
                className="home__utilityCard"
                to={item.to}
                key={item.key}
                onClick={navigateToTop}
              >
                <span className="home__utilityIcon" aria-hidden="true">
                  {item.icon}
                </span>

                <span className="home__utilityText">
                  <strong>{text.utilityLinks[item.key].title}</strong>
                  <small>{text.utilityLinks[item.key].text}</small>
                </span>

                <span className="home__utilityArrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}