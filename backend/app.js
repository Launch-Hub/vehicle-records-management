const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const allRoutes = require("./routes/index");
const { UPLOAD_BUCKET, MONGO_URI, BASE_API_URL } = require("./constants");

const app = express();

// Static files
require("./utils/init")(); // ensure the upload bucket is created
app.use("/uploads", express.static(UPLOAD_BUCKET));

// Middleware
app.use(express.json());
app.use(
  cors({
    // origin: '*', 
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
app.get(`${BASE_API_URL}/health`, (_, res) => {
  // get void.txt here
  const fs = require('fs');
  const path = require('path');
  const testFilePath = path.join(UPLOAD_BUCKET, 'test', 'void.txt');
  let staticFileOk = false;
  try {
    staticFileOk = fs.existsSync(testFilePath);
  } catch (e) {
    staticFileOk = false;
  }
  res.status(200).json({
    status: 'ok',
    staticFile: staticFileOk,
  });
});

// Mount all routes under the base URL
app.use(`${BASE_API_URL}`, allRoutes); // add /v1 when on production

module.exports = app;
