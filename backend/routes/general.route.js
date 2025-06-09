const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ code: 200, from: req.ip });
});

module.exports = router;
