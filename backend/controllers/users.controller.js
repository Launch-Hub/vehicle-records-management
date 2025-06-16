const { User } = require("../models/user");

const { DEFAULT_PERMISSIONS, SALT_OR_ROUND } = require("../constants");

// manage profile
exports.getProfile = async (req, res) => {
  const { user } = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
};
exports.updateProfile = async (req, res) => {
  const { userId, username, email } = req.body;
  const { user } = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (username) user.username = username;
  if (email) user.email = email;
  await user.save();
  res.json({ message: "Profile updated" });
};
exports.updateAvatar = async (req, res) => {
  const { userId, avatar } = req.body;
  try {
    const { user } = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ message: "Avatar updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// manage role
exports.assignRole = async (req, res) => {
  const { id } = req.params;
  const { role, applyDefaultPermissions = false } = req.body;

  try {
    const { user } = await User.findById(id);
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
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;

  try {
    const { user } = await User.findById(id);
    if (!user) throw new Error("User not found");

    // handle both modify & delete
    if (roles && roles.length) user.roles = roles;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// manage permission
exports.addPermissions = async (req, res) => {
  const { userId, permissions } = req.body;

  try {
    const { user } = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (permissions) user.permissions = permissions;

    await user.save();
    res.json({ message: "Permissions updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
exports.updatePermissions = async (req, res) => {
  const { userId, permissions } = req.body;

  try {
    const { user } = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // handle both modify & delete
    if (permissions) user.permissions = permissions;

    await user.save();
    res.json({ message: "Permissions updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// manage user //

//
exports.getList = async (req, res) => {
  const view = {
    avatar: 1,
    name: 1,
    username: 1,
    email: 1,
    roles: 1,
    status: 1,
  };

  try {
    const { pageIndex, pageSize } = req.query;

    const query = User.find({}, view);

    if (pageIndex !== undefined || pageSize !== undefined) {
      const page = parseInt(pageIndex) || 0;
      const size = parseInt(pageSize);
      const limit = size === 0 ? 50 : size || 50;
      const skip = page * limit;

      query.skip(skip).limit(limit);
    }

    const users = await query.exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: true, message: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { username, email, password, roles, permissions } = req.body;
    const passwordHash = await bcrypt.hash(password, SALT_OR_ROUND);
    if (!permissions) permissions = DEFAULT_PERMISSIONS;
    const user = await User.create({ username, email, passwordHash, roles, permissions });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: true, message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: true, message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
