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

router.get("/", authenticateToken, userController.getList);
router.get("/:id", authenticateToken, userController.getOne);
router.post("/", authenticateToken, userController.create);
router.put("/", authenticateToken, userController.update);
router.delete("/:id", authenticateToken, userController.delete);

module.exports = router;
