// INTERNAL MODULE 4 FUNCTIONALITY — database connection
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../utils/logger');
const config = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(config.databaseUrl);
    logger.info('Module4 DB connected', { db: config.databaseUrl.replace(/\/\/.*@/, '//***@') });
    return;
  } catch (error) {
    const shouldFallback = config.nodeEnv !== 'production'
      && /ECONNREFUSED|ENOTFOUND|MongoServerSelectionError|failed to connect/i.test(error.message || '');
    if (!shouldFallback) {
      throw error;
    }

    logger.warn('Module4 MongoDB not available at default localhost URL, starting in-memory fallback', {
      attemptedUrl: config.databaseUrl,
      error: error.message,
    });

    const mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);

    logger.info('Module4 DB connected via in-memory MongoDB', {
      db: memoryUri.replace(/\/\/.*@/, '//***@'),
    });
  }
}

module.exports = connectDB;
