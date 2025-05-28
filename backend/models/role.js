import mongoose from "mongoose";
import permissionSchema from "./permission.js";

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
export default Role;
