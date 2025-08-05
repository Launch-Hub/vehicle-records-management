const mongoose = require("mongoose");

const returnTypeSchema = new mongoose.Schema(
  {
    dictionary: { type: String, require: true, unique: true },
    name: { type: String, require: true },
  },
  { timestamps: false }
);

const ReturnType = mongoose.model("ReturnType", returnTypeSchema);

module.exports = { returnTypeSchema, ReturnType };
