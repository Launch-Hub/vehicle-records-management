const { User } = require("../models/user");
const { parsePagination, hashPassword } = require("../utils/helper");
const { DEFAULT_PERMISSIONS } = require("../constants");
const { mock_users, default_admin } = require("../constants/mock");

// manage user //
//
exports.getList = async (req, res) => {
  const projection = {
    avatar: 1,
    name: 1,
    // username: 1,
    // email: 1,
    phone: 1,
    assignedUnit: 1,
    serviceNumber: 1,
    // roles: 1,
    status: 1,
  };

  try {
    const { search, pageIndex, pageSize } = req.query;
    const { skip, limit } = parsePagination(pageIndex, pageSize);

    const filter = {};
    if (!!search) {
      const regex = new RegExp(search, "i"); // case-insensitive partial match
      filter.$or = [
        { name: regex },
        { username: regex },
        { email: regex },
        { serviceNumber: regex },
      ];
    }

    const total = await User.countDocuments(filter);
    if (total === 0) return res.json({ total, items: [] });

    const items = await User.find(filter, projection)
      .sort({ createdAt: -1 }) // ✅ Default sort by newest first
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await User.findById(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
exports.create = async (req, res) => {
  try {
    const { username, email, password, roles, permissions } = req.body;

    // Check for duplicate username or email
    const existingItem = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingItem) {
      return res.status(409).json({
        error: true,
        message: "Tên đăng nhập hoặc email đã được sử dụng.",
      });
    }

    const passwordHash = await hashPassword(password);
    const finalPermissions = permissions || DEFAULT_PERMISSIONS;

    const result = await User.create({
      username,
      email,
      passwordHash,
      roles,
      permissions: finalPermissions,
    });

    res.locals.documentId = result._id; // ✅ required for activity logger
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.params.id;

    // Check if username or email is changing to a value that already exists on another user
    if (username || email) {
      const duplicate = await User.findOne({
        _id: { $ne: userId }, // exclude current user
        $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
      });

      if (duplicate) {
        return res.status(409).json({
          error: true,
          message: "Username or email already in use by another user",
        });
      }
    }

    const result = await User.findByIdAndUpdate(userId, req.body, { new: true });
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: true, message: "Not found" });

    res.locals.documentId = result._id ?? req.params.id; // ✅ required for activity logger
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

// manage profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json(user);
};
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Use current user's ID from token
    const { username, email, name, phone, assignedUnit, serviceNumber, avatar } = req.body;

    // Check if username or email is changing to a value that already exists on another user
    if (username || email) {
      const duplicate = await User.findOne({
        _id: { $ne: userId }, // exclude current user
        $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
      });

      if (duplicate) {
        return res.status(409).json({
          error: true,
          message: "Username or email already in use by another user",
        });
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (assignedUnit !== undefined) updateData.assignedUnit = assignedUnit;
    if (serviceNumber !== undefined) updateData.serviceNumber = serviceNumber;
    if (avatar !== undefined) updateData.avatar = avatar;

    const result = await User.findByIdAndUpdate(userId, updateData, { new: true }).select(
      "-passwordHash"
    );
    if (!result) return res.status(404).json({ error: true, message: "User not found" });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
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

// ----------------

exports.mockCreate = async (_, res) => {
  try {
    const bulk = [];

    for (const user of mock_users) {
      const { username, email } = user;

      // Check for duplicates by username or email
      const exists = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (exists) {
        console.log(`🔁 Skipped existing user: ${username} (${email})`);
        continue;
      }

      const passwordHash = await hashPassword(password);
      const finalPermissions = permissions || DEFAULT_PERMISSIONS;

      const createdItem = await User.create({
        ...user,
        passwordHash,
        permissions: finalPermissions,
      });

      bulk.push(createdItem);
    }

    res.status(201).json({
      created: bulk.length,
      items: bulk,
    });
  } catch (err) {
    res.status(400).json({ error: true, message: err.message });
  }
};

exports.createDefaultAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ username: default_admin.username }, { email: default_admin.email }],
    });

    if (existingAdmin) {
      return res.status(409).json({
        error: true,
        message: "Default admin already exists",
      });
    }

    // Hash the password
    const passwordHash = await hashPassword(default_admin.password);

    // Create the admin user
    const adminUser = await User.create({
      username: default_admin.username,
      email: default_admin.email,
      passwordHash,
      name: default_admin.name,
      avatar: default_admin.avatar,
      assignedUnit: default_admin.assignedUnit,
      serviceNumber: default_admin.serviceNumber,
      permissions: default_admin.permissions,
      isAdmin: default_admin.isAdmin,
    });

    res.locals.documentId = adminUser._id; // Required for activity logger
    res.status(201).json({
      message: "Default admin created successfully",
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

exports.removeDefaultAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ username: default_admin.username }, { email: default_admin.email }],
    });

    if (existingAdmin) {
      return res.status(409).json({
        error: true,
        message: "Default admin not found",
      });
    }
    await User.deleteOne({
      $or: [{ username: default_admin.username }, { email: default_admin.email }],
    });
    res.status(201).json({
      message: "Default admin removed successfully",
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};
