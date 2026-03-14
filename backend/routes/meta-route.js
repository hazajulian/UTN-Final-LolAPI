// routes/meta-route.js
import { Router } from 'express';

const router = Router();

// Health + metadata (público)
router.get('/meta', (req, res) => {
  return res.json({
    name: 'LoL API',
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    docs: {
      en: '/swagger.json',
      es: '/swagger-es.json'
    },
    modules: {
      champions: '/api/v1/champions',
      items: '/api/v1/items'
    }
  });
});


export default router;  
