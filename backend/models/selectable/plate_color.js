const mongoose = require("mongoose");

const plateColorSchema = new mongoose.Schema(
  {
    dictionary: { type: String, require: true, unique: true },
    name: { type: String, require: true },
  },
  { timestamps: false }
);

const PlateColor = mongoose.model("PlateColor", plateColorSchema);

module.exports = { plateColorSchema, PlateColor }; // Màu biển
