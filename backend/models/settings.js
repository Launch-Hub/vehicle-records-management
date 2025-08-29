const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'export', 'system'],
  },
}, {
  timestamps: true,
});

// Index for efficient queries
settingsSchema.index({ category: 1 });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { settingsSchema, Settings };
