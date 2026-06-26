// Register.jsx
// Registro de usuarios nuevos. Valida los campos básicos antes de enviar la información al backend.

import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    password.length <= 64 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  // Valida campos antes de enviar
  const validateClient = () => {
    const errors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!username.trim()) {
      errors.username = t.register.errors.username;
      isValid = false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = t.register.errors.email;
      isValid = false;
    }

    if (!isStrongPassword(password)) {
      errors.password = t.register.errors.password;
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = t.register.errors.confirmPasswordRequired;
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t.register.errors.passwordMismatch;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  // Crea la cuenta del usuario
  const handleSubmit = async (e) => {
    e.preventDefault();

    setGeneralError("");
    setSuccessMessage("");

    if (!validateClient()) return;

    setIsLoading(true);

    try {
      await register({
        username,
        email,
        password,
        confirmPassword,
      });

      setSuccessMessage(t.register.success);
      navigate("/");
    } catch (err) {
      const response = err.response?.data;
      setGeneralError(response?.message || t.register.errors.general);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t.register.title}
      lang={lang}
      onLangToggle={handleLangToggle}
    >
      {generalError && (
        <div className="auth-message auth-message-error">
          {generalError}
        </div>
      )}

      {successMessage && (
        <div className="auth-message auth-message-success">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          {t.register.username}

          <input
            type="text"
            className="auth-input"
            placeholder={t.register.placeholders.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {fieldErrors.username && (
            <span className="auth-field-error">
              {fieldErrors.username}
            </span>
          )}
        </label>

        <label className="auth-label">
          {t.register.email}

          <input
            type="email"
            className="auth-input"
            placeholder={t.register.placeholders.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {fieldErrors.email && (
            <span className="auth-field-error">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label className="auth-label">
          {t.register.password}

          <div className="auth-input-group">
            <input
              type={showPass ? "text" : "password"}
              className="auth-input auth-input-with-action"
              placeholder={t.register.placeholders.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="auth-toggle-pass"
              onClick={() => setShowPass((value) => !value)}
              aria-label={showPass ? t.register.hide : t.register.show}
            >
              {showPass ? t.register.hide : t.register.show}
            </button>
          </div>

          {fieldErrors.password && (
            <span className="auth-field-error">
              {fieldErrors.password}
            </span>
          )}
        </label>

        <label className="auth-label">
          {t.register.confirmPassword}

          <div className="auth-input-group">
            <input
              type={showPass ? "text" : "password"}
              className="auth-input auth-input-with-action"
              placeholder={t.register.placeholders.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              className="auth-toggle-pass"
              onClick={() => setShowPass((value) => !value)}
              aria-label={showPass ? t.register.hide : t.register.show}
            >
              {showPass ? t.register.hide : t.register.show}
            </button>
          </div>

          {fieldErrors.confirmPassword && (
            <span className="auth-field-error">
              {fieldErrors.confirmPassword}
            </span>
          )}
        </label>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : t.register.signUp}
        </button>
      </form>

      <div className="auth-footer">
        <Link to="/login" className="auth-link">
          ← {t.register.back}
        </Link>
      </div>
    </AuthLayout>
  );
}