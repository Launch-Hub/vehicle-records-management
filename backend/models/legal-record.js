const mongoose = require("mongoose");
const { logRegistrySchema } = require("./log-registry");
const { archiveSchema } = require("./archive");

const legalRecordSchema = new mongoose.Schema(
  {
    licensePlate: { type: String, unique: true, required: true },
    // the object issuer should be used later
    // issuer: { type: mongoose.Schema.Types.ObjectId, ref: "Issuer", required: true },
    // the issuer ref can be populated
    // by using .populate('issuer', '<field_1> <field_2> ...')
    // or simply .populate('issuer')
    issuer: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    registryCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegistryCategory",
      required: true,
    },
    attachmentUrls: {
      type: Array,
      of: String,
      default: [],
    },
    proceedEvidenceUrl: String,
    archiveLocation: archiveSchema, // storing physical place
    description: String,
    note: String,
    logs: {
      // currently not in use - you can ignore this field
      type: Array,
      of: logRegistrySchema,
      default: [],
    },
    status: { type: String, enum: ["new", "pending", "denied"], default: "new" },
  },
  { timestamps: true }
);

// Convert location string to object
legalRecordSchema.methods.stringToLocation = function () {
  return this.archiveLocation;
};

const LegalRecord = mongoose.model("LegalRecord", legalRecordSchema);

module.exports = { legalRecordSchema, LegalRecord };
