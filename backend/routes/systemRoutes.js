const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const pool = require('../config/db');

const router = express.Router();

const services = [
  ['recommendation-engine', process.env.RECOMMENDATION_API_URL || 'http://localhost:8001'],
  ['chatbot', process.env.CHATBOT_API_URL || 'http://localhost:8002'],
  ['grievance-system', process.env.GRIEVANCE_API_URL || 'http://localhost:8003'],
  ['feedback-analysis', process.env.FEEDBACK_API_URL || 'http://localhost:8004'],
  ['fraud-detection', process.env.FRAUD_API_URL || 'http://localhost:8005'],
  ['module4-realtime', process.env.MODULE4_API_URL || 'http://localhost:5004'],
];

async function probe(name, baseUrl) {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(1800) });
    return { name, status: response.ok ? 'online' : 'degraded', latency_ms: Date.now() - start };
  } catch {
    return { name, status: 'offline', latency_ms: null };
  }
}

router.get('/system-health', authenticate, requireRole('ADMIN'), async (req, res) => {
  const database = { name: 'postgresql', status: 'online', latency_ms: null };
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    database.latency_ms = Date.now() - start;
  } catch {
    database.status = 'offline';
  }
  const downstream = await Promise.all(services.map(([name, url]) => probe(name, url)));
  return res.json({ checked_at: new Date().toISOString(), services: [database, ...downstream] });
});

module.exports = router;