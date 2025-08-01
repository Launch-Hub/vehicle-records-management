const express = require("express");
const router = express.Router();
const { MONGO_URI, UPLOAD_BUCKET } = require("../constants");
const bucketManager = require("../utils/bucket-manager");

router.get("/config", async (req, res) => {
  res.json({
    m_uri: MONGO_URI,
    upload_bucket: UPLOAD_BUCKET,
  });
});

router.get("/bucket-info", async (req, res) => {
  try {
    const bucketInfo = bucketManager.getBucketInfo();
    res.json({
      status: "success",
      bucket: bucketInfo,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to get bucket info",
      error: err.message,
    });
  }
});

router.get("/if", async (req, res) => {
  const ipv4 = await fetch("https://api.ipify.org?format=json");
  res.json({
    from: req.ip,
    ipv4: await ipv4.json(),
  });
});

router.get("/v", (req, res) => {
  res.json({ code: 200, version: "1.1.8" });
});

module.exports = router;
