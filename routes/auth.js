const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  registerValidation,
  loginValidation,
  otpValidation,
} = require("../middleware/validators");
const authMiddleware = require("../middleware/authMiddleware");

// Ruta de registro
router.post("/register", registerValidation, authController.register);

// Ruta de login
router.post("/login", loginValidation, authController.login);

// Ruta de verificación OTP
router.post("/verify-otp", otpValidation, authController.verifyOTP);

// Ruta para verificar token y estado OTP
router.get("/verify", authMiddleware, authController.verifyToken);

module.exports = router;
