const mongoose = require("mongoose");

const legalRecordSchema = new mongoose.Schema({
  licensePlate: { type: String, unique: true, required: true },
  // issuer: { type: mongoose.Schema.Types.ObjectId, ref: "Issuer", required: true },
  // the issuer ref can be populated
  // by using .populate('issuer', '<field_1> <field_2> ...')
  // or simply .populate('issuer')
  registryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegistryCategory",
    required: true,
  },
  description: String,
  note: String,
  logs: { // currently not in use - you can ignore this field
    type: Array,
    of: logSchema,
    default: [],
  },
  status: { type: String, enum: ["new", "pending", "denied"], default: "active" },
}, { timestamps: true });

const LegalRecord = mongoose.model("LegalRecord", legalRecordSchema);

module.exports = { legalRecordSchema, LegalRecord };
