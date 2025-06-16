const express = require("express");
const router = express.Router();
const vehicleRecordController = require("../controllers/vehicle-records.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// read one
router.get(
  "/",
  authenticateToken,
  requirePermission("records", "read"),
  vehicleRecordController.getList
);
// read one
router.get(
  "/:id",
  authenticateToken,
  requirePermission("records", "read"),
  vehicleRecordController.getOne
);
// create
router.post(
  "/",
  authenticateToken,
  requirePermission("records", "write"),
  vehicleRecordController.create
);
// update
router.put(
  "/:id",
  authenticateToken,
  requirePermission("records", "write"),
  vehicleRecordController.update
);
// delete
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("records", "delete"),
  vehicleRecordController.delete
);

module.exports = router;
