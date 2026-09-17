// INTERNAL MODULE 4 FUNCTIONALITY
const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
  {
    internshipId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    reminderType: { type: String, default: 'WEEKLY_PROGRESS' },
    scheduledFor: { type: Date, required: true },
    sentAt: { type: Date },
    status: { type: String, enum: ['PENDING', 'SENT', 'SKIPPED', 'FAILED'], default: 'PENDING' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

// prevent duplicate reminders for the same student/internship/week
ReminderSchema.index({ internshipId: 1, studentId: 1, scheduledFor: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', ReminderSchema);
