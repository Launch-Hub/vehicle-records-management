const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const uploadRoute = require("./routes/upload.route");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/users.route");
const recordRoutes = require("./routes/legal-records.route");

const { MONGO_URI, BASE_URL } = process.env;

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(
  cors({
    // origin: CLIENT_ORIGIN,
    // credentials: true, // If you're using cookies
  })
);

mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log("%cMongoDB connected", "color: green; font-weight: bold;"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(`${BASE_URL}/upload`, uploadRoute);

app.use(`${BASE_URL}/auth`, authRoutes);
app.use(`${BASE_URL}/users`, userRoutes);
app.use(`${BASE_URL}/records`, recordRoutes);

module.exports = app;
