const mongoose = require("mongoose");

const plateColorSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    color: { type: String, require: true },
    letter: { type: String, require: true },
    suffixNumber: { type: String, require: true },
  },
  { timestamps: false }
);

const PlateColor = mongoose.model("PlateColor", plateColorSchema);

module.exports = { plateColorSchema, PlateColor }; // Màu biển
