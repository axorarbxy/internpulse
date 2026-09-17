// INTERNAL MODULE 4 FUNCTIONALITY
// SECURITY: only ciphertext + iv are stored. The server never has plaintext.
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: String, required: true },
    ciphertext: { type: String, required: true }, // base64 AES-GCM ciphertext
    iv: { type: String, required: true },          // base64 initialization vector
    readBy: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

MessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
