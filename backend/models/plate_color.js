const mongoose = require("mongoose");

const plateColorSchema = new mongoose.Schema(
  {
    code: { Type: String, require: true, unique: true },
    name: { Type: String, require: true },
    initSize: { Type: Number, default: 0 },
    currentSize: { Type: Number, default: 0 },
    note: String,
    // timestamp has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: true }
);

const PlateColor = mongoose.model("PlateColor", plateColorSchema);

module.exports = { plateColorSchema, PlateColor }; // Màu biển
