// ThemeContext.jsx
// Gestiona el tema visual de la aplicación.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Carga el tema guardado al iniciar la aplicación.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    return savedTheme === "dark"
      ? "dark"
      : "light";
  });

  // Actualiza el atributo del body y localStorage.
  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Alterna entre tema claro y oscuro.
  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Permite acceder fácilmente al contexto del tema.
export function useTheme() {
  return useContext(ThemeContext);
}