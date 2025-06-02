const mongoose = require("mongoose");
const { permissionSchema } = require("./permission");

const roleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = { roleSchema, Role };
