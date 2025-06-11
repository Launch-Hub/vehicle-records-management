const express = require("express");
const router = express.Router();

// Import all your route modules
const uploadRoutes = require("./upload.route");
const generalRoutes = require("./general.route");
const authRoutes = require("./auth.route");
const userRoutes = require("./users.route");
const recordRoutes = require("./legal-records.route");

// Mount routes on the sub-paths
router.use("/upload", uploadRoutes);
router.use("/general", generalRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/records", recordRoutes);

module.exports = router;
