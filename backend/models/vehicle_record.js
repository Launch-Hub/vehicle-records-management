const mongoose = require("mongoose");
const { archiveSchema } = require("./archive");

const statuses = {
  idle: "Nhàn rỗi",
  processing: "Đang xử lý",
  archived: "Đã lưu trữ",
};

const vehicleRecordSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, unique: true, required: true },
    color: { type: String },
    identificationNumber: { type: String, unique: true, required: true }, // Vehicle Identification Number (VIN)
    engineNumber: { type: String, required: true },
    vehicleType: { type: String, default: "Xe con" },
    registrant: { type: String, required: true },
    // the object registrant should be used later
    // registrant: { type: mongoose.Schema.Types.ObjectId, ref: "registrant", required: true },
    // the registrant ref can be populated
    // by using .populate('registrant', '<field_1> <field_2> ...')
    // or simply .populate('registrant')
    phone: String,
    email: String,
    address: String,
    archiveAt: archiveSchema,
    issuerId: String, // id of the user who create the record
    note: String,
    status: { type: String, enum: ["processing", "archived"], default: "idle" },
  },
  { timestamps: true }
);

// Convert location string to object
vehicleRecordSchema.methods.stringToLocation = function () {
  return this.archiveAt;
};

const VehicleRecord = mongoose.model("VehicleRecord", vehicleRecordSchema);

module.exports = { vehicleRecordSchema, VehicleRecord };
