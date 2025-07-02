const mongoose = require("mongoose");

const actionTypeSchema = new mongoose.Schema({
  order: Number, // created order | auto-increase
  name: { type: String, unique: true, required: true },
  step: { type: Number, required: true },
  toStep: { type: Number, required: true },
});

const ActionType = mongoose.model("ActionType", actionTypeSchema);

module.exports = { actionTypeSchema, ActionType };
