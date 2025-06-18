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
    archiveAt: archiveSchema,
    issuerId: String, // id of the user who create the record
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
