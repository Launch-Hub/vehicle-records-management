const mongoose = require("mongoose");

const archiveSchema = new mongoose.Schema({
  storage: { type: String, required: true }, // Kho
  room: { type: String, required: true }, // Phòng
  row: { type: String, required: true }, // Dãy
  shelf: { type: String, required: true }, // Kệ
  level: { type: String, required: true }, // Tầng
  // quantity: { type: Number, default: 1 },         // Số lượng (copies)
});

const Archive = mongoose.model("archive", archiveSchema);

module.exports = { archiveSchema, Archive };
