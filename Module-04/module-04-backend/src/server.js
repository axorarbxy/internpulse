// INTERNAL MODULE 4 FUNCTIONALITY — entry point
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocketServer } = require('./sockets');
const { startScheduler } = require('./jobs/scheduler');
const config = require('./config/env');
const logger = require('./utils/logger');

async function start() {
  await connectDB();

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
