const express = require("express");
const router = express.Router();
const { MONGO_URI } = require("../constants");

router.get("/", async (req, res) => {
  const result = { code: 200, from: req.ip };
  if (req.query.if == true) {
    result.m_uri = MONGO_URI;
    const info = await fetch("ifconfig.me");
    result.ifconfig = info;
  }
  res.json(result);
});

router.get("/v", (req, res) => {
  res.json({ code: 200, version: "1.1.8" });
});

module.exports = router;
