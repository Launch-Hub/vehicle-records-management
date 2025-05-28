const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");

router.get("/profile", authenticateToken, userController.getProfile);

router.put(
  "/permissions",
  authenticateToken,
  requirePermission("users", "write"),
  userController.updatePermissions
);

module.exports = router;
