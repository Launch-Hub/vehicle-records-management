const mongoose = require("mongoose");

const bulkSchema = new mongoose.Schema(
  {
    code: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    size: { type: Number, default: 0 },
    note: String,
    // timestamps has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, autoIndex: true }
);

const Bulk = mongoose.model("Bulk", bulkSchema);

module.exports = { bulkSchema, Bulk }; // Lần nhập Hồ sơ Đăng ký
