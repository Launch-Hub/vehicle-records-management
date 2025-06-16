const mongoose = require("mongoose");
const { archiveSchema } = require("./archive");

const vehicleRecordSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, unique: true, required: true },
    color: { type: String },
    identificationNumber: { type: String, unique: true, required: true }, // Vehicle Identification Number (VIN)
    engineNumber: { type: String, required: true },
    // the object registrant should be used later
    // registrant: { type: mongoose.Schema.Types.ObjectId, ref: "registrant", required: true },
    // the registrant ref can be populated
    // by using .populate('registrant', '<field_1> <field_2> ...')
    // or simply .populate('registrant')
    registrant: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    // registryCategory: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "RegistryCategory",
    //   required: true,
    // },
    // attachmentUrls: {
    //   type: Array,
    //   of: String,
    //   default: [],
    // },
    // proceedEvidenceUrl: String,
    archiveAt: archiveSchema,
    description: String,
    note: String,
    status: { type: String, enum: ["in processing", "archived"], default: "new" },
  },
  { timestamps: true }
);

// Convert location string to object
vehicleRecordSchema.methods.stringToLocation = function () {
  return this.archiveLocation;
};

const VehicleRecord = mongoose.model("VehicleRecord", vehicleRecordSchema);

module.exports = { vehicleRecordSchema, VehicleRecord };
