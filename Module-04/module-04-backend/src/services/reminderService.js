// INTERNAL MODULE 4 FUNCTIONALITY — weekly progress reminders.
// EXTERNAL INTEGRATION DEPENDENCY — internship/student data comes from Module 1.
const Reminder = require('../models/Reminder');
const notificationService = require('./notificationService');
const module1Adapter = require('../integration/module1Adapter');
const logger = require('../utils/logger');

// Rounds "now" down to the start of the current ISO week (Monday 00:00) so that
// duplicate reminders for the same week are naturally prevented by the unique index.
function currentWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay() || 7; // Sunday=0 -> 7
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d;
}

async function generateWeeklyReminders() {
  const activeInternships = await module1Adapter.getActiveInternships();
  const scheduledFor = currentWeekStart();
  const results = [];

  for (const internship of activeInternships) {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        { internshipId: internship.id, studentId: internship.studentId, scheduledFor },
        { $setOnInsert: { status: 'PENDING' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (reminder.status === 'PENDING') {
        await notificationService.createNotification({
          recipientId: internship.studentId,
          type: 'PROGRESS_REMINDER',
          title: 'Weekly progress update due',
          message: `Please submit your weekly progress update for "${internship.title}".`,
          relatedEntityType: 'internship',
          relatedEntityId: internship.id,
        });
        reminder.status = 'SENT';
        reminder.sentAt = new Date();
        await reminder.save();
      }
      results.push({ internshipId: internship.id, status: reminder.status });
    } catch (err) {
      logger.error('Failed to process reminder for internship', {
        internshipId: internship.id,
        error: err.message,
      });
      results.push({ internshipId: internship.id, status: 'FAILED' });
    }
  }

  return results;
}

module.exports = { generateWeeklyReminders, currentWeekStart };
