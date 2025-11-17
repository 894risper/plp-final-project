import { Router } from 'express';
import Stat from '../models/Stat';

const router = Router();

// Seed default stats if none exist
async function getOrCreateStats() {
  let doc = await Stat.findOne().sort({ updatedAt: -1 });
  if (!doc) {
    doc = await Stat.create({
      totalContracts: 15847,
      totalValue: 2345678900,
      flaggedContracts: 234,
      activeVendors: 1256,
    });
  }
  return doc;
}

router.get('/stats', async (_req, res) => {
  try {
    const stats = await getOrCreateStats();
    res.json({
      totalContracts: stats.totalContracts,
      totalValue: stats.totalValue,
      flaggedContracts: stats.flaggedContracts,
      activeVendors: stats.activeVendors,
      updatedAt: stats.updatedAt,
    });
  } catch (err) {
    console.error('Get stats error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
