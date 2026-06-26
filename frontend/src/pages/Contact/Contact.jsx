// Contact.jsx
// Página de contacto con formulario, GitHub y créditos del proyecto.

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBookOpen,
  FaCheckCircle,
  FaEnvelope,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaGithub,
  FaPaperPlane,
  FaShieldAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
import { sendContact } from "../../services/api";

import "./Contact.css";

const GITHUB_URL = "https://github.com/hazajulian";

export default function Contact() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const text = translations[language].contact;

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [loading, setLoading] = useState(false);

  const subjectLength = subject.trim().length;
  const messageLength = message.trim().length;

  const isFormValid = subjectLength >= 3 && messageLength >= 10;
  const canSubmit = Boolean(user) && isFormValid && !loading;

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus("");
    setStatusType("");

    if (!isFormValid) {
      setStatus(text.minError);
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);

      await sendContact({
        subject: subject.trim(),
        message: message.trim(),
      });

      setSubject("");
      setMessage("");
      setStatus(text.success);
      setStatusType("success");
    } catch (error) {
      if (error?.response?.status === 401) {
        setStatus(text.authText);
      } else {
        setStatus(error?.response?.data?.message || text.error);
      }

      setStatusType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="contact">
      <section className="contact__panel" aria-label={text.pageAria}>
        <header className="contact__hero">
          <div className="contact__titleRow">
            <span className="contact__stick" aria-hidden="true" />
            <h1 className="contact__title">{text.title}</h1>
            <span className="contact__stick" aria-hidden="true" />
          </div>

          <p className="contact__hint">{text.subtitle}</p>
        </header>

        <section className="contact__layout">
          <article className="contact__formCard">
            <div className="contact__cardHead">
              <span className="contact__iconBox">
                <FaEnvelope />
              </span>

              <div>
                <span className="contact__kicker">{text.kicker}</span>
                <h2 className="contact__sectionTitle">{text.title}</h2>
              </div>
            </div>

            {!user && (
              <div className="contact__authBox">
                <FaExclamationTriangle className="contact__authIcon" />

                <div className="contact__authText">
                  <h3>{text.authTitle}</h3>
                  <p>{text.authText}</p>
                </div>

                <Link className="contact__loginBtn" to="/login">
                  {text.login}
                </Link>
              </div>
            )}

            <form className="contact__form" onSubmit={handleSubmit}>
              <label className="contact__label">
                <span>{text.subject}</span>

                <input
                  className="contact__input"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder={text.subjectPlaceholder}
                  maxLength={120}
                  disabled={!user || loading}
                  required
                />

                <small className="contact__counter">{subject.length}/120</small>
              </label>

              <label className="contact__label">
                <span>{text.message}</span>

                <textarea
                  className="contact__textarea"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={text.messagePlaceholder}
                  maxLength={4000}
                  rows={9}
                  disabled={!user || loading}
                  required
                />

                <small className="contact__counter">{message.length}/4000</small>
              </label>

              <button className="contact__submit" type="submit" disabled={!canSubmit}>
                <FaPaperPlane />
                {loading ? text.sending : text.send}
              </button>

              {status && (
                <p
                  className={`contact__status ${
                    statusType === "success"
                      ? "contact__status--success"
                      : "contact__status--error"
                  }`}
                >
                  {statusType === "success" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaExclamationTriangle />
                  )}
                  {status}
                </p>
              )}
            </form>
          </article>

          <aside className="contact__side">
            <article className="contact__sideCard">
              <div className="contact__sideHead">
                <span className="contact__sideIcon">
                  <FaShieldAlt />
                </span>

                <h2>{text.panelTitle}</h2>
              </div>

              <p>{text.panelText}</p>
            </article>

            <article className="contact__sideCard contact__sideCard--github">
              <div className="contact__sideHead">
                <span className="contact__sideIcon">
                  <FaGithub />
                </span>

                <h2>{text.githubTitle}</h2>
              </div>

              <p>{text.githubText}</p>

              <a
                className="contact__externalBtn"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <FaExternalLinkAlt />
              </a>
            </article>

            <article className="contact__sideCard">
              <div className="contact__sideHead">
                <span className="contact__sideIcon">
                  <FaBookOpen />
                </span>

                <h2>{text.creditsTitle}</h2>
              </div>

              <p>{text.creditsText}</p>

              <div className="contact__credits">
                <a
                  href="https://www.leagueoflegends.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text.riot}
                </a>

                <a
                  href="https://developer.riotgames.com/docs/lol"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text.ddragon}
                </a>

                <a
                  href="https://wiki.leagueoflegends.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text.wiki}
                </a>
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}