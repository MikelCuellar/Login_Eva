const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../config/database");
const nodemailer = require("nodemailer");

// Configuración del transporter de nodemailer para Hostinger
const transporter = nodemailer.createTransport({
  host: "smtp.tumailer.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // No fallar en certificados inválidos
    rejectUnauthorized: false,
    // Forzar TLS
    minVersion: "TLSv1.2",
  },
});

// Verificar la conexión del transporter
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error en la configuración del correo:", error);
  } else {
    console.log("Servidor de correo listo para enviar mensajes");
  }
});

// Generar código OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Registrar usuario
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Cifrar contraseña con Argon2
    const hashedPassword = await argon2.hash(password);

    // Insertar usuario
    const [result] = await pool.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = users[0];

    // Verificar contraseña
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar OTP
    const otp = generateOTP();

    // Guardar OTP en la base de datos
    await pool.execute(
      "UPDATE users SET otp = ?, otp_expires = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = ?",
      [otp, user.id]
    );

    try {
      // Enviar OTP por correo
      await transporter.sendMail({
        from: `"Sistema de Login" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Código de verificación",
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1a73e8;">Código de Verificación</h2>
                        <p>Tu código de verificación es:</p>
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>Este código expirará en 5 minutos.</p>
                        <p>Si no solicitaste este código, por favor ignora este correo.</p>
                    </div>
                `,
      });

      res.json({
        message: "Se ha enviado un código de verificación a tu correo",
      });
    } catch (emailError) {
      console.error("Error al enviar el correo:", emailError);
      // Si falla el envío del correo, limpiar el OTP
      await pool.execute(
        "UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = ?",
        [user.id]
      );
      throw new Error(
        "Error al enviar el código de verificación. Por favor, intenta nuevamente."
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error en el servidor" });
  }
};

// Verificar OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validar que se proporcionaron todos los datos necesarios
    if (!email || !otp) {
      return res.status(400).json({
        message: "Se requiere el correo electrónico y el código OTP",
      });
    }

    // Verificar que existe JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET no está configurado en las variables de entorno"
      );
      return res.status(500).json({
        message: "Error de configuración del servidor",
      });
    }

    // Verificar OTP con más detalles en el error
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW()",
      [email, otp]
    );

    if (users.length === 0) {
      // Verificar si el usuario existe
      const [userExists] = await pool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (userExists.length === 0) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      // Verificar si el OTP ha expirado
      const [expiredOTP] = await pool.execute(
        "SELECT * FROM users WHERE email = ? AND otp IS NOT NULL AND otp_expires <= NOW()",
        [email]
      );

      if (expiredOTP.length > 0) {
        return res.status(401).json({
          message: "El código OTP ha expirado. Por favor, solicita uno nuevo",
        });
      }

      return res.status(401).json({
        message: "Código OTP inválido",
      });
    }

    const user = users[0];

    try {
      // Generar JWT con más información de depuración
      const payload = {
        userId: user.id,
        email: user.email,
      };

      console.log("Generando token con payload:", payload);
      console.log(
        "Usando JWT_SECRET:",
        process.env.JWT_SECRET ? "Configurado" : "No configurado"
      );

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
        algorithm: "HS256", // Especificar el algoritmo explícitamente
      });

      // Limpiar OTP
      await pool.execute(
        "UPDATE users SET otp = NULL, otp_expires = NULL WHERE id = ?",
        [user.id]
      );

      res.json({
        token,
        message: "Verificación exitosa",
      });
    } catch (jwtError) {
      console.error("Error detallado al generar el token:", jwtError);
      return res.status(500).json({
        message: "Error al generar el token de sesión",
        error:
          process.env.NODE_ENV === "development" ? jwtError.message : undefined,
      });
    }
  } catch (error) {
    console.error("Error en verifyOTP:", error);
    res.status(500).json({
      message:
        error.message || "Error en el servidor al verificar el código OTP",
    });
  }
};

// Verificar token
exports.verifyToken = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Token verificado correctamente",
      user: {
        id: user[0].id,
        email: user[0].email,
      },
    });
  } catch (error) {
    console.error("Error en verifyToken:", error);
    res.status(500).json({ message: "Error al verificar el token" });
  }
};
