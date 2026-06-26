// Login.jsx
// Inicio de sesión. Permite autenticar usuarios registrados y acceder a las funciones privadas del sitio.

import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

export function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

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

  // Envía las credenciales al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t.login.error);
    }
  };

  return (
    <AuthLayout
      title={t.login.title}
      lang={lang}
      onLangToggle={handleLangToggle}
    >
      {error && (
        <div className="auth-message auth-message-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          {t.login.email}

          <input
            type="email"
            className="auth-input"
            placeholder={t.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="auth-label">
          {t.login.password}

          <div className="auth-input-group">
            <input
              type={showPass ? "text" : "password"}
              className="auth-input auth-input-with-action"
              placeholder={t.login.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="auth-toggle-pass"
              onClick={() => setShowPass((value) => !value)}
              aria-label={showPass ? t.login.hide : t.login.show}
            >
              {showPass ? t.login.hide : t.login.show}
            </button>
          </div>
        </label>

        <button
          type="submit"
          className="auth-submit-btn"
        >
          {t.login.signIn}
        </button>
      </form>

      <Link
        to="/forgot-password"
        className="auth-link"
      >
        {t.login.forgot}
      </Link>

      <div className="auth-actions">
        <button
          type="button"
          className="auth-secondary-btn"
          onClick={() => navigate("/")}
        >
          {t.login.guest}
        </button>

        <button
          type="button"
          className="auth-secondary-btn"
          onClick={() => navigate("/register")}
        >
          {t.login.register}
        </button>
      </div>
    </AuthLayout>
  );
}