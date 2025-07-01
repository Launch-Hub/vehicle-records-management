const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { JWT_SECRET } = require("../constants");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: true, message: "No token provided" });

  const token = authHeader?.split(" ")[1];
  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ error: true, message: "Invalid token" });
    const payload = await User.findById(user.userId).select("-passwordHash");
    req.user = payload;
    next();
  });
};

exports.requirePermission = (feature, action) => {
  return (req, res, next) => {
    if (req.user?.isAdmin) return next();

    const perms = Object.fromEntries(req.user?.permissions)?.[feature];
    if (!perms || perms[action] !== true) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
