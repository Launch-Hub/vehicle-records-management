const mongoose = require("mongoose");

const statuses = {
  draft: "Nháp",
  processing: "Đang xử lý",
  completed: "Đã hoàn thành",
  rejected: "Đã từ chối",
  cancelled: "Đã huỷ",
  archived: "Đã lưu trữ",
};

const stepSchema = new mongoose.Schema(
  {
    order: Number, // created order | auto-increase
    step: Number, // step number
    title: String, // step name
    action: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActionType",
    },
    note: String,
    attachments: [String],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: Date.now },
    // createdAt <- startedAt
  },
  { timestamp: true }
);

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
      required: false,
    },
    registrationType: { type: String, require: true }, // type of registration (not the action inside step)
    steps: [stepSchema], // only 1 step exist isCompleted = false
    status: {
      type: String,
      enum: ["draft", "processing", "completed", "rejected", "cancelled", "archived"],
      default: "draft",
    },
    // timestamp has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: true }
);

const Procedure = mongoose.model("Procedure", procedurechema);

module.exports = { procedurechema, Procedure }; // Thủ tục Đăng ký
