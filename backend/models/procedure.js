const mongoose = require("mongoose");
const { DEFAULT_DUE_DATE } = require("../constants");

const procedureStatuses = {
  pending: "Đăng ký mới",
  processing: "Đang xử lý",
  overdue: "Đã quá hạn",
  completed: "Đã hoàn thành",
  rejected: "Đã từ chối",
  cancelled: "Đã huỷ",
  archived: "Đã lưu trữ",
};

const resultReturnTypes = {
  direct: "Trả trực tiếp",
  post_office: "Gửi qua bưu điện",
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
    completedAt: { type: Date, default: null },
    startedAt: { type: Date, default: Date.now },
    // createdAt <- startedAt
  },
  { timestamps: false }
);

const procedurechema = new mongoose.Schema(
  {
    record: {
      // thông tin hồ sơ
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleRecord",
      required: true,
    },
    bulk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bulk",
      required: false,
    },
    registrationType: { type: String, require: true }, // type of registration (not the action inside step)
    oldPlate: String, // old plate number (when the plate is changed)
    steps: [stepSchema], // only 1 step exist isCompleted = false
    currentStep: { type: Number, default: 1 }, // current step number
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending", // pending (step 1) -> processing (step 2...) -> completed|cancelled
    }, // no need overdue status -> use the dueDate instead
    note: { type: String, default: "" }, // note for the procedure
    dueDate: { type: Date, default: Date.now + DEFAULT_DUE_DATE },
    resultReturnType: { type: String, enum: ["direct", "post_office"] },
    completedAt: { type: Date, default: null }, // only when status = completed
    archivedAt: { type: Date, default: null }, // only when status = archived
    // timestamp has both props
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: true }
);

const Procedure = mongoose.model("Procedure", procedurechema);

module.exports = { procedurechema, Procedure, procedureStatuses, resultReturnTypes }; // Đăng ký
