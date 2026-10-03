// INTERNAL MODULE 4 FUNCTIONALITY — entry point
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocketServer } = require('./sockets');
const { startScheduler } = require('./jobs/scheduler');
const seedDemoPortal = require('./services/demoSeedService');
const config = require('./config/env');
const logger = require('./utils/logger');

function validateProductionSecrets() {
  if (config.nodeEnv !== 'production') return;

  const requiredSecrets = [
    ['JWT_SECRET', config.jwtSecret],
    ['CERTIFICATE_SIGNING_KEY', config.certificateSigningKey],
    ['MODULE1_SERVICE_TOKEN', config.module1ServiceToken],
  ];
  const insecure = requiredSecrets.filter(([, value]) => (
    typeof value !== 'string' || value.length < 32 || /development|local|change-me|your-production/i.test(value)
  ));
  if (insecure.length) {
    throw new Error(`Production requires strong secrets: ${insecure.map(([name]) => name).join(', ')}`);
  }
  if (config.module1Mode !== 'live') {
    throw new Error('Production requires MODULE1_MODE=live');
  }
}

async function start() {
  validateProductionSecrets();
  await connectDB();
  await seedDemoPortal();

  const httpServer = http.createServer(app);
  initSocketServer(httpServer);
  startScheduler();

  httpServer.listen(config.port, () => {
    logger.info(`Module 4 backend listening on port ${config.port}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start Module 4 backend', { error: err.message });
  process.exit(1);
});
