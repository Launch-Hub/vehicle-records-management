const express = require("express");
const router = express.Router();
const legalRecordController = require("../controllers/legal-records.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");

// read one
router.get(
  "/",
  authenticateToken,
  requirePermission("records", "read"),
  legalRecordController.getList
);
// read one
router.get(
  "/:id",
  authenticateToken,
  requirePermission("records", "read"),
  legalRecordController.getOne
);
// create
router.post(
  "/",
  authenticateToken,
  requirePermission("records", "write"),
  legalRecordController.create
);
// update
router.put(
  "/:id",
  authenticateToken,
  requirePermission("records", "write"),
  legalRecordController.update
);
// delete
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("records", "delete"),
  legalRecordController.delete
);

module.exports = router;
