const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehicle-records.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");
const resource = "records";

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
  logActivityMiddleware("create", resource),
  controller.update
);
// delete
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(resource, "delete"),
  logActivityMiddleware("create", resource),
  controller.delete
);
//
router.post("/mock", controller.mockCreate);

module.exports = router;
