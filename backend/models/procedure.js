const mongoose = require("mongoose");
const { DEFAULT_DUE_DATE } = require("../constants");

const statuses = {
  draft: "Nháp",
  processing: "Đang xử lý",
  overdue: "Đã quá hạn",
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
      enum: ["pending", "processing", "completed", "cancelled", "archived"],
      default: "pending", // pending (step 1) -> processing (step 2...) -> completed|cancelled -> archived
    }, // no need overdue status -> use the dueDate instead
    dueDate: { type: Date, default: Date.now + DEFAULT_DUE_DATE },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }, // only when isCompleted = true
    archivedAt: { type: Date, default: null }, // only when status = archived
    // timestamp has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: true }
);

const Procedure = mongoose.model("Procedure", procedurechema);

module.exports = { procedurechema, Procedure, procedureStatuses: statuses }; // Đăng ký Đăng ký
