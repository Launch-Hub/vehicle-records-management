const express = require("express");
const router = express.Router();
const controller = require("../controllers/users.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");
const resource = "users";

router.get("/profile", authenticateToken, controller.getProfile);

// router.put(
//   "/permissions",
//   authenticateToken,
//   requirePermission(resource, "write"),
//   controller.updatePermissions
// );

// read
router.get("/", authenticateToken, requirePermission(resource, "read"), controller.getList);
router.get("/:id", authenticateToken, requirePermission(resource, "read"), controller.getOne);
// write
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
// delete
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(resource, "write"),
  logActivityMiddleware("delete", resource),
  controller.delete
);
//
router.post("/mock", controller.mockCreate);

module.exports = router;
