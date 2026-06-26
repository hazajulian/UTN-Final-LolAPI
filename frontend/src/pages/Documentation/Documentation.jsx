// Documentation.jsx
// Documentación del proyecto, secciones, decisiones técnicas y evolución.

import {
  FaBookOpen,
  FaCheckCircle,
  FaDatabase,
  FaExternalLinkAlt,
  FaMagic,
  FaGithub,
  FaHeart,
  FaHistory,
  FaInfoCircle,
  FaLayerGroup,
  FaMapMarkedAlt,
  FaProjectDiagram,
  FaRocket,
  FaShieldAlt,
  FaStar,
  FaTools,
  FaUser,
} from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";

import "./Documentation.css";

const GITHUB_URL = "https://github.com/hazajulian/LoL-Hub";

const FEATURE_ICONS = [
  <FaUser />,
  <FaLayerGroup />,
  <FaMagic />,
  <FaStar />,
  <FaMapMarkedAlt />,
  <FaHeart />,
];

export default function Documentation() {
  const { language } = useLanguage();
  const text = translations[language].documentation;

  return (
    <main className="docs">
      <section className="docs__panel">
        <header className="docs__hero">
          <div className="docs__titleRow">
            <span className="docs__stick" aria-hidden="true" />
            <h1 className="docs__title">{text.title}</h1>
            <span className="docs__stick" aria-hidden="true" />
          </div>

          <p className="docs__hint">{text.subtitle}</p>
        </header>

        <section className="docs__introCard docs__introCard--main">
          <span className="docs__badge">
            <FaBookOpen />
            {text.badge}
          </span>

          <h2>{text.introTitle}</h2>
          <p>{text.introOne}</p>
          <p>{text.introTwo}</p>
        </section>

        <section className="docs__storyGrid">
          <article className="docs__storyCard docs__storyCard--dark">
            <div className="docs__cardHead docs__cardHead--light">
              <span className="docs__iconBox docs__iconBox--light">
                <FaHistory />
              </span>

              <h2>{text.storyTitle}</h2>
            </div>

            <div className="docs__storyText">
              <p>{text.storyOne}</p>
              <p>{text.storyTwo}</p>
              <p>{text.storyThree}</p>
            </div>
          </article>

          <aside className="docs__timelineCard docs__timelineCard--dark">
            <h2>{text.timelineTitle}</h2>

            <div className="docs__timeline">
              {text.timeline.map((item) => (
                <article className="docs__timelineItem" key={item.title}>
                  <span>{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="docs__split">
          <article className="docs__darkCard">
            <div className="docs__cardHead">
              <span className="docs__iconBox">
                <FaTools />
              </span>

              <h2>{text.madeTitle}</h2>
            </div>

            <p>{text.madeText}</p>

            <a
              className="docs__githubBtn"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
              {text.github}
              <FaExternalLinkAlt />
            </a>
          </article>

          <article className="docs__darkCard">
            <div className="docs__cardHead">
              <span className="docs__iconBox">
                <FaShieldAlt />
              </span>

              <h2>{text.limitationsTitle}</h2>
            </div>

            <p>{text.limitationsText}</p>
          </article>
        </section>

        <section className="docs__section">
          <header className="docs__sectionHead">
            <h2>{text.featuresTitle}</h2>
            <p>{text.featuresSubtitle}</p>
          </header>

          <div className="docs__featureGrid">
            {text.features.map((feature, index) => (
              <article className="docs__featureCard" key={feature.title}>
                <span className="docs__featureIcon">
                  {FEATURE_ICONS[index]}
                </span>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="docs__dataSection">
          <article className="docs__dataCard">
            <span className="docs__badge">
              <FaDatabase />
              {text.dataTitle}
            </span>

            <div className="docs__dataText">
              <p>{text.dataOne}</p>
              <p>{text.dataTwo}</p>
              <p>{text.dataThree}</p>
              <p>{text.dataFour}</p>
            </div>
          </article>

          <article className="docs__darkCard docs__creditsCard">
            <div className="docs__cardHead">
              <span className="docs__iconBox">
                <FaInfoCircle />
              </span>

              <h2>{text.creditsTitle}</h2>
            </div>

            <p>{text.creditsText}</p>

            <div className="docs__credits">
              <a
                href="https://www.leagueoflegends.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.credits.riot}
              </a>

              <a
                href="https://developer.riotgames.com/docs/lol"
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.credits.ddragon}
              </a>

              <a
                href="https://wiki.leagueoflegends.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {text.credits.wiki}
              </a>
            </div>
          </article>
        </section>

        <section className="docs__split docs__split--tech">
          <article className="docs__darkCard">
            <div className="docs__cardHead">
              <span className="docs__iconBox">
                <FaProjectDiagram />
              </span>

              <h2>{text.techTitle}</h2>
            </div>

            <p>{text.techText}</p>
          </article>

          <div className="docs__techGrid">
            {text.techGroups.map((group) => (
              <article className="docs__techCard" key={group.title}>
                <h3>{group.title}</h3>

                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="docs__split">
          <article className="docs__darkCard">
            <div className="docs__cardHead">
              <span className="docs__iconBox">
                <FaCheckCircle />
              </span>

              <h2>{text.decisionsTitle}</h2>
            </div>

            <ul className="docs__decisionList">
              {text.decisions.map((decision) => (
                <li key={decision}>{decision}</li>
              ))}
            </ul>
          </article>

          <article className="docs__darkCard">
            <div className="docs__cardHead">
              <span className="docs__iconBox">
                <FaRocket />
              </span>

              <h2>{text.futureTitle}</h2>
            </div>

            <p>{text.futureText}</p>

            <ul className="docs__futureList">
              {text.futureIdeas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="docs__final">
          <h2>{text.finalTitle}</h2>
          <p>{text.finalText}</p>
        </section>
      </section>
    </main>
  );
}