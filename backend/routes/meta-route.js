// meta-route.js
// Expone informacion general y estado de la API.

import { Router } from "express";

const router = Router();

// Devuelve informacion basica de la API.
router.get("/meta", (req, res) => {
  return res.json({
    name: "LoL API",
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",

    modules: {
      champions: "/api/v1/champions",
      items: "/api/v1/items",
      summonerSpells: "/api/v1/summoner-spells",
      runes: "/api/v1/runes",
      regions: "/api/v1/regions",
    },
  });
});

export default router;