const express = require("express");
const router = express.Router();
const controller = require("../controllers/users.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");
const resource = "users";

// Create default admin (no auth required for initial setup)
router.post("/dfa", controller.createDefaultAdmin);
router.delete("/dfa", controller.removeDefaultAdmin);
// seed data
router.post("/seeds", controller.mockCreate);

// self read & write (no permission required)
router.get("/profile", authenticateToken, controller.getProfile);
router.put("/profile", authenticateToken, controller.updateProfile);

// read & write
router.get("/", authenticateToken, requirePermission(resource, "read"), controller.getList);
router.get("/:id", authenticateToken, requirePermission(resource, "read"), controller.getOne);
router.post(
  "/",
  authenticateToken,
  requirePermission(resource, "write"),
  logActivityMiddleware("create", resource),
  controller.create
);
router.put(
  "/:id",
  authenticateToken,
  requirePermission(resource, "write"),
  logActivityMiddleware("update", resource),
  controller.update
);
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(resource, "write"),
  logActivityMiddleware("delete", resource),
  controller.delete
);

module.exports = router;
