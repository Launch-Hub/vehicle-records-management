const express = require("express");
const router = express.Router();
const actionTypeController = require("../controllers/action-types.controller");
const { authenticateToken } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");

// read
router.get("/", authenticateToken, actionTypeController.getList);
router.get("/:id", authenticateToken, actionTypeController.getOne);
// write
router.post(
  "/",
  authenticateToken,
  logActivityMiddleware("create", "action-types"),
  actionTypeController.create
);
router.post(
  "/bulk",
  authenticateToken,
  logActivityMiddleware("create", "action-types"),
  actionTypeController.createBulk
);
router.put(
  "/:id",
  authenticateToken,
  logActivityMiddleware("update", "action-types"),
  actionTypeController.update
);
// delete
router.delete(
  "/:id",
  authenticateToken,
  logActivityMiddleware("delete", "action-types"),
  actionTypeController.delete
);

module.exports = router;
