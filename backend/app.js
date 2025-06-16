// const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const allRoutes = require("./routes/index");

const { MONGO_URI, BASE_API_URL } = process.env;

const app = express();

// Static files
app.use("/uploads", express.static("uploads"));

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
app.get(`${BASE_API_URL}/healthz`, (_, res) => res.sendStatus(200));

// Mount all routes under the base URL
app.use(`${BASE_API_URL}`, allRoutes); // add /v1 when on production

// Serve the client
// app.use(express.static(path.join(__dirname, "/frontend/dist")));
// app.get("*", (_, res) => {
//   res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
// });

module.exports = app;
