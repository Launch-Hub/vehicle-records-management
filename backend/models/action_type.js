const mongoose = require("mongoose");

const actionTypeSchema = new mongoose.Schema({
  order: Number, // created order | auto-increase
  name: { type: String, unique: true, required: true },
  step: { type: Number, unique: true, required: true },
  toNextStep: { type: Boolean, default: false },
});

const ActionType = mongoose.model("ActionType", actionTypeSchema);

module.exports = { actionTypeSchema, ActionType };
