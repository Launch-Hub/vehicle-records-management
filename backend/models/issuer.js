const mongoose = require("mongoose");

const issuerSchema = new mongoose.Schema({
  citizenIDNumber: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, minLength: 6, maxLength: 12 },
  address: String,
  note: String,
});

const Issuer = mongoose.model("Issuer", issuerSchema);

module.exports = { issuerSchema, Issuer };
