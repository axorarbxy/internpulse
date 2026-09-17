// INTERNAL MODULE 4 FUNCTIONALITY — database connection
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.databaseUrl);
  logger.info('Module4 DB connected', { db: config.databaseUrl.replace(/\/\/.*@/, '//***@') });
}

module.exports = connectDB;
