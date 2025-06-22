const mongoose = require("mongoose");

const bulkSchema = new mongoose.Schema(
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

const Bulk = mongoose.model("Bulk", bulkSchema);

module.exports = { bulkSchema, Bulk }; // Lô Hồ sơ Đăng ký
