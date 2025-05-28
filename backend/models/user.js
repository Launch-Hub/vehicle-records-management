const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    read: Boolean,
    write: Boolean,
    delete: Boolean,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: "default-avatar.png" },
  roles: [String],
  permissions: {
    type: Map,
    of: permissionSchema,
  },
  metadata: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
  },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

// Password comparison method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", userSchema);
module.exports = { User, permissionSchema };
