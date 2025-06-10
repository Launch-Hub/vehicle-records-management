const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const uploadRoutes = require("./routes/upload.route");

const generalRoutes = require("./routes/general.route");
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

app.get(`${BASE_URL}/healthz`, (_, res) => res.sendStatus(200));

app.use(`${BASE_URL}/upload`, uploadRoutes);

app.use(`${BASE_URL}/general`, generalRoutes);
app.use(`${BASE_URL}/auth`, authRoutes);
app.use(`${BASE_URL}/users`, userRoutes);
app.use(`${BASE_URL}/records`, recordRoutes);

module.exports = app;
