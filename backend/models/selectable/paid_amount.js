const mongoose = require("mongoose");

const paidAmountSchema = new mongoose.Schema({
  value: String,
});

const PaidAmount = mongoose.model("PaidAmount", paidAmountSchema);

module.exports = { paidAmountSchema, PaidAmount };
