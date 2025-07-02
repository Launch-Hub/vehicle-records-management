const express = require("express");
const router = express.Router();
const { MONGO_URI, UPLOAD_BUCKET } = require("../constants");

router.get("/config", async (req, res) => {
  res.json({
    m_uri: MONGO_URI,
    upload_bucket: UPLOAD_BUCKET,
  });
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
