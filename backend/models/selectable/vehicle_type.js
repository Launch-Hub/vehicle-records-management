const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema({
  name: String,
  value: String,
});

const VehicleType = mongoose.model("VehicleType", vehicleTypeSchema);

module.exports = { vehicleTypeSchema, VehicleType };
