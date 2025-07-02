const express = require("express");
const router = express.Router();
const actionTypeController = require("../controllers/action-type.controller");
const { authenticateToken } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");

// read
router.get("/", authenticateToken, actionTypeController.getList);
router.get("/:id", authenticateToken, actionTypeController.getOne);
// write
router.post(
  "/",
  authenticateToken,
  logActivityMiddleware("create", "action-type"),
  actionTypeController.create
);
router.post(
  "/bulk",
  authenticateToken,
  logActivityMiddleware("create", "action-type"),
  actionTypeController.createBulk
);
router.put(
  "/:id",
  authenticateToken,
  logActivityMiddleware("update", "action-type"),
  actionTypeController.update
);
// delete
router.delete(
  "/:id",
  authenticateToken,
  logActivityMiddleware("delete", "action-type"),
  actionTypeController.delete
);

module.exports = router;
