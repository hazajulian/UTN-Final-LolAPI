// ResetPassword.jsx
// Permite establecer una nueva contraseña utilizando el token enviado por email. Redirige al login tras completar el cambio.

import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

import { resetPassword } from "../../services/api";
import { AuthLayout } from "./AuthLayout";
import { en } from "../../i18n/en";
import { es } from "../../i18n/es";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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

export function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();

  const token = query.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const lang = localStorage.getItem("lang") || "EN";
  const t = lang === "EN" ? en : es;

  useEffect(() => {
    document.body.classList.add("auth-page");

    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const handleLangToggle = () => {
    const newLang = lang === "EN" ? "ES" : "EN";

    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  const validateClient = () => {
    if (!token) {
      setError(t.reset.errors.invalid);
      return false;
    }

    if (!isStrongPassword(newPassword)) {
      setError(
        t.register?.errors?.password ||
          "La contraseña debe tener entre 8 y 64 caracteres, una mayúscula, una minúscula, un número y un símbolo."
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError(t.reset.errors.mismatch);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!validateClient()) return;

    setIsLoading(true);

    try {
      const response = await resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      setMessage(response.data?.message || t.reset.success);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || t.reset.errors.general);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t.reset.title} lang={lang} onLangToggle={handleLangToggle}>
      {error && <div className="auth-message auth-message-error">{error}</div>}

      {message && (
        <div className="auth-message auth-message-success">{message}</div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label">
            {t.reset.newPass}

            <div className="auth-input-group">
              <input
                type={showPass ? "text" : "password"}
                className="auth-input auth-input-with-action"
                placeholder={t.reset.placeholder1}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPass((value) => !value)}
                aria-label={showPass ? t.reset.hide : t.reset.show}
              >
                {showPass ? t.reset.hide : t.reset.show}
              </button>
            </div>
          </label>

          <label className="auth-label">
            {t.reset.confirmPass}

            <div className="auth-input-group">
              <input
                type={showPass ? "text" : "password"}
                className="auth-input auth-input-with-action"
                placeholder={t.reset.placeholder2}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPass((value) => !value)}
                aria-label={showPass ? t.reset.hide : t.reset.show}
              >
                {showPass ? t.reset.hide : t.reset.show}
              </button>
            </div>
          </label>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? "Cargando..." : t.reset.submit}
          </button>
        </form>
      )}

      <div className="auth-footer">
        <Link to="/login" className="auth-link">
          ← {t.reset.back}
        </Link>
      </div>
    </AuthLayout>
  );
}