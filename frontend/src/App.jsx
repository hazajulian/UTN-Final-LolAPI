// App principal: define el enrutamiento y el layout global de la aplicación LoL API V2.
// Provee los contextos globales y controla visibilidad de Navbar/Footer.

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
import Items from "./pages/ItemsShop/Items";
import Profile from "./pages/Profile/Profile";

// Nuevas secciones
import SummonerSpells from "./pages/SummonerSpells/SummonerSpells";
import Runes from "./pages/Runes/Runes";
import Regions from "./pages/Regions/Regions";
import Documentation from "./pages/Documentation/Documentation";

// Autenticación
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";

// Otros
import Contact from "./pages/Contact/Contact";

export default function App() {
  const location = useLocation();

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "EN");

  const noLayoutRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

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
        {!hideLayout && <Navbar lang={lang} setLang={setLang} />}

        <Routes>
          {/* Home / Champions */}
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/champions/:id" element={<ChampionDetail lang={lang} />} />

          {/* Items */}
          <Route path="/items" element={<Items lang={lang} />} />

          {/* Nuevas secciones */}
          <Route path="/summoner-spells" element={<SummonerSpells lang={lang} />} />
          <Route path="/runes" element={<Runes lang={lang} />} />
          <Route path="/regions" element={<Regions lang={lang} />} />
          <Route path="/documentation" element={<Documentation lang={lang} />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile lang={lang} />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Otros */}
          <Route path="/contact" element={<Contact lang={lang} />} />
        </Routes>

        {!hideLayout && <Footer lang={lang} />}
      </AuthProvider>
    </ThemeProvider>
  );
}