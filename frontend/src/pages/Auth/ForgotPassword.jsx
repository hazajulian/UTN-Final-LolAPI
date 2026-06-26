// ForgotPassword.jsx
// Solicita el email del usuario y envía el enlace de recuperación de contraseña.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/api";
import { AuthLayout } from "./AuthLayout";
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const lang = localStorage.getItem("lang") || "EN";
  const t = lang === "EN" ? en : es;

  // Aplica el fondo de autenticación
  useEffect(() => {
    document.body.classList.add("auth-page");

    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  // Alterna entre EN y ES
  const handleLangToggle = () => {
    const newLang = lang === "EN" ? "ES" : "EN";
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  // Envía la solicitud de recuperación
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.forgot.errors.invalid);
      return;
    }

    try {
      const resp = await forgotPassword({ email });
      setMessage(resp.data?.message || t.forgot.success);
    } catch (err) {
      const status = err.response?.status;

      if (status === 429) {
        setError(t.forgot.errors.tooMany);
      } else if (status === 404) {
        setError(t.forgot.errors.notFound);
      } else {
        setError(err.response?.data?.message || t.forgot.errors.general);
      }
    }
  };

  return (
    <AuthLayout
      title={t.forgot.title}
      lang={lang}
      onLangToggle={handleLangToggle}
    >
      {error && (
        <div className="auth-message auth-message-error">
          {error}
        </div>
      )}

      {message && (
        <div className="auth-message auth-message-success">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          {t.forgot.email}

          <input
            type="email"
            className="auth-input"
            placeholder={t.forgot.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="auth-submit-btn">
          {t.forgot.submit}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="auth-link">
          ← {t.forgot.back}
        </Link>
      </div>
    </AuthLayout>
  );
}