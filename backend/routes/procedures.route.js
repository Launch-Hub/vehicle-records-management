const express = require("express");
const router = express.Router();
const controller = require("../controllers/procedure.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");
const resource = "procedures";

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
  requirePermission(resource, "delete"),
  logActivityMiddleware("delete", resource),
  controller.delete
);

module.exports = router;
