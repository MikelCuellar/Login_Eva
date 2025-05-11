
CREATE DATABASE IF NOT EXISTS evaluacion_ciberseguridad;
USE evaluacion_ciberseguridad;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
