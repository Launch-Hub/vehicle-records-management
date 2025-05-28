const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
  const { username, email, password, roles, permissions = {} } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash, roles, permissions });

  try {
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  console.log("called login with email:", email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  user.metadata.lastLogin = new Date();
  user.metadata.loginCount += 1;
  await user.save();

  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    permissions: Object.fromEntries(user.permissions),
    roles: user.roles,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
};

exports.loginWithUsername = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  console.log("called login with username:", username);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  user.metadata.lastLogin = new Date();
  user.metadata.loginCount += 1;
  await user.save();

  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    permissions: Object.fromEntries(user.permissions),
    roles: user.roles,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
};

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
