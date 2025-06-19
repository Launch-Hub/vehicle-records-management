const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  // title: { type: String, required: true },
  // description: String,
  action: {
    type: String,
    enum: ["create", "update", "delete"],
    required: true,
  },
  resource: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  changes: { type: Object }, // optional: store diffs or full snapshot
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = { activityLogSchema, ActivityLog };
