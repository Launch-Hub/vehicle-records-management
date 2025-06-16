const mongoose = require("mongoose");
const { permissionSchema } = require("./permission");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  name: String,
  avatar: { type: String, default: "default-avatar.png" },
  assignedUnit: String, // Đơn vị
  serviceNumber: String, // Số hiệu
  // roles: [String],
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
  isDeleted: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

// Methods area
const bcrypt = require("bcrypt");

// Password comparison method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};
userSchema.methods.hashPassword = function (password) {
  return bcrypt.hash(password);
};

const User = mongoose.model("User", userSchema);

module.exports = { userSchema, User };
