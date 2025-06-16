const mongoose = require("mongoose");
const { permissionSchema } = require("./permission");

const roleSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  defaultPermissions: {
    type: Map,
    of: permissionSchema,
    default: {},
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = { roleSchema, Role };
