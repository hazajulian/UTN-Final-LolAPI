// LanguageContext.jsx
// Maneja el idioma global de la aplicación y lo guarda en localStorage.

import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

const DEFAULT_LANGUAGE = "ES";
const STORAGE_KEY = "lang";

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  });

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const toggleLanguage = () => {
    const nextLanguage = language === "EN" ? "ES" : "EN";
    changeLanguage(nextLanguage);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  }

  return context;
}