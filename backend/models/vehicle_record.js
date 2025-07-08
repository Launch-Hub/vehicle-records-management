const mongoose = require("mongoose");
const { archiveSchema } = require("./archive");

const statuses = {
  idle: "Nhàn rỗi",
  active: "Đang xử lý",
  archived: "Đã lưu trữ",
};

const vehicleRecordSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, unique: true, required: true },
    color: { type: String },
    identificationNumber: String, // Vehicle Identification Number (VIN)
    engineNumber: String,
    vehicleType: String,
    registrant: { type: String, required: true }, // registrant's name
    phone: String,
    email: String,
    address: String,
    archiveAt: archiveSchema,
    issuerId: String, // id of the user who create the record
    note: String,
    status: { type: String, enum: ["idle", "active", "archived"], default: "idle" },
  },
  { timestamps: true }
);

// Convert location string to object
vehicleRecordSchema.methods.stringToLocation = function () {
  return this.archiveAt;
};

const VehicleRecord = mongoose.model("VehicleRecord", vehicleRecordSchema);

module.exports = { vehicleRecordSchema, VehicleRecord, vehicleRecordStatuses: statuses };
