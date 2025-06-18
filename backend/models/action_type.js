const mongoose = require("mongoose");

const registryCategorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

const RegistryCategory = mongoose.model("RegistryCategory", registryCategorySchema);

module.exports = { registryCategorySchema, RegistryCategory };
