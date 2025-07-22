const mongoose = require("mongoose");

const plateColorSchema = new mongoose.Schema({
  name: String,
  value: String,
});

const PlateColor = mongoose.model("PlateColor", plateColorSchema);

module.exports = { plateColorSchema, PlateColor };
