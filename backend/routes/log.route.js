const express = require("express");
const router = express.Router();
const controller = require("../controllers/log.controller");
const { authenticateToken, requirePermission } = require("../middleware/auth");
const resource = "logs";

// read
router.get("/", authenticateToken, requirePermission(resource, "read"), controller.getList);
router.get("/:id", authenticateToken, requirePermission(resource, "read"), controller.getOne);

module.exports = router; 