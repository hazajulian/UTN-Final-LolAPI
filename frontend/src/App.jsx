// App.jsx
// Define el layout global y el enrutamiento principal de LoL Hub.

import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { Navbar } from "./components/Navbar/Navbar";
import { Footer } from "./components/Footer/Footer";

import "./styles/body.css";

import Home from "./pages/Home/Home";
import Champions from "./pages/Champions/Champions";
import ChampionDetail from "./pages/ChampionDetail/ChampionDetail";
import Items from "./pages/ItemsShop/Items";
import SummonerSpells from "./pages/SummonerSpells/SummonerSpells";
import Runes from "./pages/Runes/Runes";
import Regions from "./pages/Regions/Regions";
import RegionDetail from "./pages/RegionDetail/RegionDetail";
import Documentation from "./pages/Documentation/Documentation";
import Profile from "./pages/Profile/Profile";
import Contact from "./pages/Contact/Contact";

import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";

const NO_LAYOUT_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function App() {
  const location = useLocation();
  const hideLayout = NO_LAYOUT_ROUTES.includes(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("global-body-style", !hideLayout);
    document.body.classList.toggle("no-global-body-style", hideLayout);
  }, [hideLayout]);

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Champions */}
        <Route path="/champions" element={<Champions />} />
        <Route path="/champions/:id" element={<ChampionDetail />} />

        {/* Items */}
        <Route path="/items" element={<Items />} />

        {/* Summoner Spells */}
        <Route path="/summoner-spells" element={<SummonerSpells />} />

        {/* Runes */}
        <Route path="/runes" element={<Runes />} />

        {/* Regions */}
        <Route path="/regions" element={<Regions />} />
        <Route path="/regions/:id" element={<RegionDetail />} />

        {/* Other pages */}
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}