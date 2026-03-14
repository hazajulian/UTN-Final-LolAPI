// App principal: define el enrutamiento y el layout global de la aplicación LoL Champions.
// Provee los contextos globales (tema, auth) y controla visibilidad de Navbar/Footer.

import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Contextos globales
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Componentes comunes
import { Navbar } from "./components/Navbar/Navbar";
import { Footer } from "./components/Footer/Footer";

// Estilos globales y reset
import "./reset.css";
import "./styles/body.css";

// Páginas principales
import Home from "./pages/Home/Home";
import ChampionDetail from "./pages/ChampionDetail/ChampionDetail";
import CreateChampion from "./pages/CreateChampion/CreateChampion";
import EditChampion from "./pages/CreateChampion/EditChampion";
import Profile from "./pages/Profile/Profile";

// 🆕 ITEMS SHOP
import Items from "./pages/ItemsShop/Items";

// Autenticación
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";

// Otros
import Contact from "./pages/Contact/Contact";
import SwaggerUI from "./pages/Swagger/Swagger";

export default function App() {
  const location = useLocation();

  // Estado global para el idioma (default: EN, persistente en localStorage)
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "EN");

  // Rutas donde NO queremos mostrar Navbar/Footer
  const noLayoutRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  // Cambia la clase del body según la ruta (para login/register)
  useEffect(() => {
    if (hideLayout) {
      document.body.classList.remove("global-body-style");
      document.body.classList.add("no-global-body-style");
    } else {
      document.body.classList.add("global-body-style");
      document.body.classList.remove("no-global-body-style");
    }
  }, [hideLayout]);

  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Navbar visible solo si NO es ruta de auth */}
        {!hideLayout && <Navbar lang={lang} setLang={setLang} />}

        <Routes>
          {/* Home */}
          <Route path="/" element={<Home lang={lang} />} />

          {/* Champions */}
          <Route path="/champions/:id" element={<ChampionDetail lang={lang} />} />
          <Route path="/create-champion" element={<CreateChampion lang={lang} />} />
          <Route path="/champions/:id/edit" element={<EditChampion lang={lang} />} />

          {/* 🆕 Items Shop */}
          <Route path="/items" element={<Items lang={lang} />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile lang={lang} />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Otros */}
          <Route path="/contact" element={<Contact lang={lang} />} />
          <Route path="/swagger" element={<SwaggerUI lang={lang} />} />
        </Routes>

        {/* Footer visible solo si NO es ruta de auth */}
        {!hideLayout && <Footer lang={lang} />}
      </AuthProvider>
    </ThemeProvider>
  );
}
