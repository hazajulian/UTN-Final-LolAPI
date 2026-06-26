// AuthContext.jsx
// Gestiona la autenticación y la sesión del usuario.

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

import {
  login as apiLogin,
  register as apiRegister,
} from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Carga la sesión guardada al iniciar la aplicación.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  // Mantiene sincronizado el usuario con localStorage.
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Mantiene sincronizado el token con localStorage.
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Inicia sesión y guarda usuario y token.
  async function login(credentials) {
    const data = await apiLogin(credentials);

    setUser(data.user);
    setToken(data.token);

    return data.user;
  }

  // Registra un nuevo usuario.
  async function register(credentials) {
    const data = await apiRegister(credentials);

    setUser(data.user);
    setToken(data.token);

    return data;
  }

  // Cierra la sesión actual.
  function logout() {
    setUser(null);
    setToken("");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Permite acceder fácilmente al contexto de autenticación.
export function useAuth() {
  return useContext(AuthContext);
}