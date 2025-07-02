const express = require("express");
const router = express.Router();

// Import all your route modules
const generalRoutes = require("./general.route");
const uploadRoutes = require("./upload.route");
const authRoutes = require("./auth.route");
const userRoutes = require("./users.route");
const recordRoutes = require("./vehicle-records.route");
const bulkRoutes = require("./bulks.route");
const procedureRoutes = require("./procedures.route");
const dashboardRoutes = require("./dashboard.route");
const actionTypeRoutes = require("./action-type.route");

// Mount routes on the sub-paths
router.use("/g", generalRoutes);
router.use("/upload", uploadRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/records", recordRoutes);
router.use("/bulks", bulkRoutes);
router.use("/procedures", procedureRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/action-types", actionTypeRoutes);

module.exports = router;
