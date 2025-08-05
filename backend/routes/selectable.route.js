const express = require("express");
const router = express.Router();
const selectableController = require("../controllers/selectable.controller");
const { authenticateToken } = require("../middleware/auth");
const { logActivityMiddleware } = require("../utils/activity-logger");

// Get all selectable types
router.get("/types", authenticateToken, selectableController.getSelectableTypes);

// Get all values for a specific type (for dropdowns)
router.get("/:type/all", authenticateToken, selectableController.getAllValues);

// CRUD operations for specific selectable type
router.get("/:type", authenticateToken, selectableController.getList);
router.get("/:type/:id", authenticateToken, selectableController.getOne);

// Create operations
router.post(
  "/:type",
  authenticateToken,
  logActivityMiddleware("create", "selectable"),
  selectableController.create
);
router.post(
  "/:type/bulk",
  authenticateToken,
  logActivityMiddleware("create", "selectable"),
  selectableController.createBulk
);

// Update operation
router.put(
  "/:type/:id",
  authenticateToken,
  logActivityMiddleware("update", "selectable"),
  selectableController.update
);

// Delete operation
router.delete(
  "/:type/:id",
  authenticateToken,
  logActivityMiddleware("delete", "selectable"),
  selectableController.delete
);

module.exports = router; 