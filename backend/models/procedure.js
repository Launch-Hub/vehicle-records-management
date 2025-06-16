const mongoose = require("mongoose");

const bulkSchema = new mongoose.Schema(
  {
    recordId: { // thông tin hồ sơ
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleRecord",
      required: true,
    },
    procedureTypeId: { // hạng mục đăng ký
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bulk",
      required: true,
    },
    bulkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bulk",
      required: true,
    },
    status: String,
    note: String,

    // timestamp has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: true }
);

const Bulk = mongoose.model("Bulk", bulkSchema);

module.exports = { bulkSchema, Bulk }; // Lô Hồ sơ Đăng ký
