const mongoose = require("mongoose");

const requestedPlateSchema = new mongoose.Schema(
  {
    plate: { type: String, require: true }, // biển số
    status: { type: String, enum: ["requested", "received", "sent"], default: "requested" }, // trạng thái
  },
  { timestamps: false }
);

const plateRequestSchema = new mongoose.Schema(
  {
    bulk: { type: String, require: true }, // lô yêu cầu dập biển số
    color: { type: String, require: true }, // màu biển số
    vehicleType: { type: String, require: true }, // loại xe
    prefixLetters: { type: String, require: true }, // chữ cái trên biển số (có thể là 2 chữ hoặc chữ số: AA, AB, A1, ...)
    rangeFrom: { type: Number, require: true }, // số bắt đầu
    rangeTo: { type: Number, require: true }, // số kết thúc
    excludedNumbers: { type: [Number] }, // các số được loại trừ

    plates: { type: [requestedPlateSchema] }, // danh sách các biển số đã yêu cầu (A00001, A00002, ...)
    total: { type: Number, default: 0 }, // tổng số biển yêu cầu

    createdAt: { type: Date, require: true, default: Date.now }, // ngày yêu cầu dập biển số
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // người yêu cầu dập biển số
    receivedAt: { type: Date }, // ngày nhận biển số đã dập
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // người nhận biển số đã dập
    note: { type: String }, // ghi chú
  }
  // { timestamps: true } // use the custom timestamps
);

const PlateRequest = mongoose.model("PlateRequest", plateRequestSchema);

module.exports = { plateRequestSchema, PlateRequest }; // Biển số yêu cầu nhà máy dập
