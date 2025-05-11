const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No se proporcionó un token de autenticación" });
    }

    const token = authHeader.split(" ")[1];

    // Verificar el token
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET no está configurado en las variables de entorno"
      );
      return res
        .status(500)
        .json({ message: "Error de configuración del servidor" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "El token ha expirado" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    return res.status(500).json({ message: "Error al verificar el token" });
  }
};

module.exports = authMiddleware;
