const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

exports.requirePermission = (feature, action) => {
  return (req, res, next) => {
    const perms = req.user?.permissions?.[feature];
    if (!perms || !perms[action]) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
