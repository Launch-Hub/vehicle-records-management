const User = require("../models/user");
require("dotenv").config();

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { userId, username, email } = req.body;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (username) user.username = username;
  if (email) user.email = email;
  await user.save();
  res.json({ message: "Profile updated" });
};

exports.updateAvatar = async (req, res) => {
  const { userId, avatar } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: "Avatar updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.assignRole = async (req, res) => {
  const { id } = req.params;
  const { role, applyDefaultPermissions = false } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }

    if (applyDefaultPermissions) {
      const roleDoc = await Role.findOne({ name: role });
      if (!roleDoc) throw new Error("Role not found");

      for (const [resource, perms] of roleDoc.defaultPermissions.entries()) {
        if (!user.permissions.has(resource)) {
          user.permissions.set(resource, perms);
        }
      }
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePermissions = async (req, res) => {
  const { userId, permissions } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (permissions) user.permissions = permissions;

    await user.save();
    res.json({ message: "Permissions updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
