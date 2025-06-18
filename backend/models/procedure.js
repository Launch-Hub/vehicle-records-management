const mongoose = require("mongoose");

const procedurechema = new mongoose.Schema(
  {
    recordId: {
      // thông tin hồ sơ
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleRecord",
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

const Procedure = mongoose.model("Procedure", procedurechema);

module.exports = { procedurechema, Procedure }; // Thủ tục Đăng ký
