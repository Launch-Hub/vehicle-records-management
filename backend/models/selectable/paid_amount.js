const mongoose = require("mongoose");

const paidAmountSchema = new mongoose.Schema(
  {
    name: String,
    value: String,
  },
  { timestamps: false }
);

const PaidAmount = mongoose.model("PaidAmount", paidAmountSchema);

module.exports = { paidAmountSchema, PaidAmount };
