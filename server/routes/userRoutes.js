const express = require("express");
const userController = require("../controllers/userController");
const { verifyEmail } = require("../services/VerifyEmail");
const router = express.Router();


router.route("/signin").post(userController.Signin);
router.route("/signup").post(userController.createUser);
router.route("/verify/:token").get(verifyEmail);
router.route("/signout").get(userController.verifyToken,userController.signout);
router.route("/updateThisUser").post(userController.verifyToken,userController.updateThisUser);

module.exports = router;