const express = require("express");
const router = express.Router();

router.get("/get", () => {
  res.status(200).json({ message: "Everything is fine in public" });
});

router.get("/getAuth", () => {
  res.status(200).json({ message: "Everything is fine in private" });
});

module.exports = router;
