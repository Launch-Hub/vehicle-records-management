const express = require("express");
const router = express.Router();
const { MONGO_URI } = require("../constants");

router.get("/m_uri", async (req, res) => {
  res.json({ m_uri: MONGO_URI });
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
