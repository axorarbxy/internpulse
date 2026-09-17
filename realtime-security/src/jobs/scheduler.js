// INTERNAL MODULE 4 FUNCTIONALITY — job scheduling abstraction.
// Uses BullMQ+Redis when REDIS_URL is configured (production-friendly),
// otherwise falls back to node-cron for easy local/prototype running.
// Both paths call the same runWeeklyReminderJob(), so swapping backends
// never changes reminder logic itself.
const cron = require('node-cron');
const config = require('../config/env');
const logger = require('../utils/logger');
const { runWeeklyReminderJob } = require('./reminderJob');

function startScheduler() {
  if (config.redisUrl) {
    try {
      // eslint-disable-next-line global-require
      const { Queue, Worker } = require('bullmq');
      const connection = { url: config.redisUrl };
      const queue = new Queue('module4-reminders', { connection });

      new Worker('module4-reminders', async () => runWeeklyReminderJob(), { connection });

      queue.add(
        'weekly-progress-reminder',
        {},
        { repeat: { pattern: '0 9 * * 1' }, removeOnComplete: true } // every Monday 09:00
      );

      logger.info('Scheduler started with BullMQ/Redis');
      return;
    } catch (err) {
      logger.warn('BullMQ/Redis unavailable, falling back to node-cron', { error: err.message });
    }
  }

  // Prototype-friendly fallback: every Monday at 09:00 server time
  cron.schedule('0 9 * * 1', () => {
    runWeeklyReminderJob().catch((err) => logger.error('Reminder job failed', { error: err.message }));
  });
  logger.info('Scheduler started with node-cron fallback');
}

module.exports = { startScheduler };
