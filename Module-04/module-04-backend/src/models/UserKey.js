const mongoose = require('mongoose');

const UserKeySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    algorithm: { type: String, required: true, enum: ['ECDH-P256'] },
    publicKey: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('UserKey', UserKeySchema);