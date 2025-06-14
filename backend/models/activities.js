const mongoose = require("mongoose");

const logRegistrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const LogRegistry = mongoose.model("LogRegistry", logRegistrySchema);

module.exports = { logRegistrySchema, LogRegistry };
