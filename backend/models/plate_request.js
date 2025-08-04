const mongoose = require("mongoose");

const plateRequestSchema = new mongoose.Schema(
  {
    bulk: { type: String, require: true }, // lô yêu cầu dập biển số
    color: { type: String, require: true }, // màu biển số
    vehicleType: { type: String, require: true }, // loại xe
    letter: { type: String, require: true }, // chữ cái trên biển số
    suffixNumber: { type: String, require: true }, // số hiệu biển số
    createdBy: { type: String, require: true }, // người yêu cầu dập biển số
    updatedBy: { type: String, require: true }, // người nhận biển số đã dập
    createdAt: { type: Date, require: true, default: Date.now }, // ngày yêu cầu dập biển số
    updatedAt: { type: Date, require: true }, // ngày nhận biển số đã dập
  }
  // { timestamps: true } // use the custom timestamps
);

const PlateRequest = mongoose.model("PlateRequest", plateRequestSchema);

module.exports = { plateRequestSchema, PlateRequest }; // Biển số yêu cầu nhà máy dập
