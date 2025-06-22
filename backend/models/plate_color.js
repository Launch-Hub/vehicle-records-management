const mongoose = require("mongoose");

const plateColorSchema = new mongoose.Schema(
  {
    code: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    initSize: { type: Number, default: 0 },
    currentSize: { type: Number, default: 0 },
    note: String,
    // timestamp has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: true }
);

const PlateColor = mongoose.model("PlateColor", plateColorSchema);

module.exports = { plateColorSchema, PlateColor }; // Màu biển
