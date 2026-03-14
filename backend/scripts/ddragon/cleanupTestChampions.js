import 'dotenv/config';
import mongoose from 'mongoose';

import { Champion } from '../../models/mongodb/champion-modeldb.js';
import { info, warn, error } from '../../utils/logger.js';

// IDs típicos de test (ajustá esta lista a lo que hayas usado)
const TEST_IDS = ['aa', 'bb', 'champA', 'champB', 'zaahen', 'Zaahen'];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    info('Connected to MongoDB (cleanupTestChampions)');

    // 1) Borrar custom champs de test por id (seed:false)
    const customRes = await Champion.deleteMany({
      seed: false,
      id: { $in: TEST_IDS }
    });
    info(`Deleted custom test champions: ${customRes.deletedCount}`);

    // 2) Si existe un "seed" raro tipo Zaahen (no debería existir), lo borramos también
    const seedRes = await Champion.deleteMany({
      seed: true,
      id: { $in: TEST_IDS }
    });
    info(`Deleted seed test champions: ${seedRes.deletedCount}`);

    info('cleanupTestChampions finished OK');
    process.exit(0);
  } catch (err) {
    error('cleanupTestChampions failed', { err });
    process.exit(1);
  }
}

run();
