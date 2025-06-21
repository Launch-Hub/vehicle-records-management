const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const allRoutes = require("./routes/index");
const { UPLOAD_BUCKET } = require("./constants");

const { MONGO_URI, BASE_API_URL } = process.env;

const app = express();

// Static files
require("./utils/init")();
app.use("/uploads", express.static(UPLOAD_BUCKET));

// Middleware
app.use(express.json());
app.use(
  cors({
    // origin: CLIENT_ORIGIN,
    // credentials: true, // If you're using cookies
  })
);

// Database connection
mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log("%cMongoDB connected", "color: green; font-weight: bold;"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Health check
app.get(`${BASE_API_URL}/health`, (_, res) => res.sendStatus(200));

// Mount all routes under the base URL
app.use(`${BASE_API_URL}`, allRoutes); // add /v1 when on production

module.exports = app;
