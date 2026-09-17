// INTERNAL MODULE 4 FUNCTIONALITY — weekly reminder job logic (queue-agnostic)
const reminderService = require('../services/reminderService');
const logger = require('../utils/logger');

async function runWeeklyReminderJob() {
  logger.info('Running weekly reminder job');
  const results = await reminderService.generateWeeklyReminders();
  logger.info('Weekly reminder job finished', { processed: results.length });
  return results;
}

module.exports = { runWeeklyReminderJob };
