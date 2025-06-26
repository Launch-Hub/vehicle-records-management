const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const { hashPassword } = require("../utils/helper");

const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
  SALT_OR_ROUND,
} = require("../constants");

exports.register = async (req, res) => {
  const { username, email, password, roles, permissions = {} } = req.body;

  const passwordHash = await hashPassword(password);
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
  const filter = email.includes("@") ? { email } : { username: email };
  const user = await User.findOne(filter);
  if (!user) return res.status(404).json({ error: "Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      username: user.username,
      email: user.email,
      phone: user.phone,
      assignedUnit: user.assignedUnit,
      serviceNumber: user.serviceNumber,
      // roles: user.roles,
      permissions: user.permissions,
      isAdmin: user.isAdmin,
    },
  });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Missing token." });

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
};
