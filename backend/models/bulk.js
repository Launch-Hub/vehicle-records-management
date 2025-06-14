const mongoose = require("mongoose");

const bulkSchema = new mongoose.Schema({
  initSize: {Type: Number, require: true},
  currentSize: {Type: Number, require: true},
  note: String,
  // timestamp has both props
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
}, { timestamp: true, autoIndex: true });

const Bulk = mongoose.model("Bulk", bulkSchema);

module.exports = { bulkSchema, Bulk }; // Lô Hồ sơ Đăng ký
