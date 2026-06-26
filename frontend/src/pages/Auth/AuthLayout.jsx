// AuthLayout.jsx
// Layout reutilizable para Login, Register, Forgot Password y Reset Password.

import React from "react";
import "./AuthLayout.css";

export function AuthLayout({
  title,
  lang,
  onLangToggle,
  children,
}) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">LoL Hub</div>
            <h1 className="auth-title">{title}</h1>

        <button
          type="button"
          className="auth-language"
          onClick={onLangToggle}
        >
          {lang}
        </button>

        {children}
      </div>
    </div>
  );
}