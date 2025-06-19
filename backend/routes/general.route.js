const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ code: 200, from: req.ip });
});

router.get("/v", (req, res) => {
  res.json({ code: 200, version: "0.4.9" });
});

module.exports = router;
