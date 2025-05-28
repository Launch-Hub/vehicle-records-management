const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/loginWithUsername", userController.loginWithUsername);

module.exports = router;
