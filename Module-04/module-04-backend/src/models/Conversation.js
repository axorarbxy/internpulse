// INTERNAL MODULE 4 FUNCTIONALITY
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participantIds: { type: [String], required: true, index: true }, // Module 1 userIds
    internshipId: { type: String }, // optional link to Module 1 internship record
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

ConversationSchema.index({ participantIds: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
