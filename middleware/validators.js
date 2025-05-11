const { body } = require("express-validator");

exports.registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Ingrese un correo electrónico válido")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
    .withMessage(
      "La contraseña debe contener al menos una letra, un número y un carácter especial"
    ),
];

exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Ingrese un correo electrónico válido")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

exports.otpValidation = [
  body("email")
    .isEmail()
    .withMessage("Ingrese un correo electrónico válido")
    .normalizeEmail(),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("El código OTP debe tener 6 dígitos")
    .isNumeric()
    .withMessage("El código OTP debe contener solo números"),
];
