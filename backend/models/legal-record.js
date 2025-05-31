const mongoose = require("mongoose");

const legalRecordSchema = new mongoose.Schema({
  licensePlate: { type: String, unique: true, required: true },
  issuer: { type: mongoose.Schema.Types.ObjectId, ref: "Issuer", required: true },
  registryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegistryCategory",
    required: true,
  },
  // the issuer ref can be populated
  // by using .populate('issuer', '<field_1> <field_2> ...')
  // or simply .populate('issuer')
  description: String,
  note: String,
  logs: {
    type: Array,
    of: permissionSchema,
    default: [],
  },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const LegalRecord = mongoose.model("LegalRecord", legalRecordSchema);

module.exports = { legalRecordSchema, LegalRecord };
