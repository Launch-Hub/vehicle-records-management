const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    read: Boolean,
    write: Boolean,
    delete: Boolean,
  },
  { _id: false }
);

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = { permissionSchema, Permission };
