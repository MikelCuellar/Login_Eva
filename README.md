# Sistema de Login Seguro con Autenticación Multifactor

## Descripción del Proyecto

Este proyecto implementa un sistema de login seguro utilizando Node.js, Express y MySQL, con características avanzadas de seguridad como autenticación multifactor (MFA) mediante OTP por correo electrónico.

## Características de Seguridad Implementadas

### 1. Cifrado de Contraseñas

- Utilizamos Argon2 para el cifrado de contraseñas
- Argon2 es un ganador del Password Hashing Competition y ofrece:
  - Resistencia a ataques de fuerza bruta
  - Protección contra ataques de GPU
  - Adaptabilidad a hardware futuro

### 2. Autenticación Multifactor (MFA)

- Implementación de OTP (One-Time Password) por correo electrónico
- El proceso es:
  1. Usuario ingresa credenciales
  2. Sistema envía código OTP al correo
  3. Usuario ingresa el código
  4. Sistema verifica y genera token JWT

### 3. Protección contra Inyección SQL

- Uso de prepared statements en todas las consultas
- Sanitización de entradas
- Validación de datos en el servidor

### 4. Protección contra XSS

- Sanitización de entradas
- Headers de seguridad
- Validación de datos en cliente y servidor

### 5. Manejo de Sesiones

- Tokens JWT para autenticación
- Expiración de tokens
- Almacenamiento seguro en localStorage

## Estructura del Proyecto

```
Login_Eva/
├── config/
│   └── database.js
├── controllers/
│   └── authController.js
├── middleware/
│   ├── authMiddleware.js
│   └── validators.js
├── public/
│   ├── app.js
│   ├── dashboard.css
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── index.html
│   ├── register.html
│   ├── register.js
│   └── styles.css
├── routes/
│   └── auth.js
├── .env
├── .env.example
├── database.sql
├── package.json
└── server.js
```

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- Cuenta de correo en Hostinger para envío de OTP

## Instrucciones de Instalación

1. **Clonar el Repositorio**

   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd Login_Eva
   ```

2. **Instalar Dependencias**

   ```bash
   npm install
   ```

3. **Configurar Base de Datos**

   - Crear una base de datos MySQL
   - Ejecutar el script `database.sql`:
     ```bash
     mysql -u [usuario] -p [nombre_base_datos] < database.sql
     ```

4. **Configurar Variables de Entorno**

   - Copiar `.env.example` a `.env`
   - Completar las variables:
     ```
     PORT=3000
     DB_HOST=localhost
     DB_USER=tu_usuario
     DB_PASSWORD=tu_contraseña
     DB_NAME=login_db
     JWT_SECRET=tu_secreto_jwt_min_32_caracteres
     EMAIL_USER=tu_correo@hostinger.com
     EMAIL_PASS=tu_contraseña_de_correo
     NODE_ENV=development
     ```

5. **Configurar Correo Electrónico**

   - Usar una cuenta de Hostinger
   - Configurar las credenciales en `.env`
   - El servidor SMTP ya está configurado para Hostinger

6. **Iniciar el Servidor**
   ```bash
   npm start
   ```

## Uso del Sistema

1. **Registro de Usuario**

   - Acceder a `/register`
   - Ingresar correo y contraseña
   - El sistema validará el formato

2. **Login**

   - Acceder a `/`
   - Ingresar credenciales
   - Recibir OTP por correo
   - Ingresar OTP para completar login

3. **Dashboard**
   - Accesible solo después de login exitoso
   - Muestra validaciones de seguridad
   - Opción de cierre de sesión

## Consideraciones de Seguridad

1. **JWT_SECRET**

   - Debe ser una cadena aleatoria de al menos 32 caracteres
   - No compartir en repositorios públicos
   - Cambiar en producción

2. **Base de Datos**

   - Usar contraseñas fuertes
   - Limitar acceso a la base de datos
   - Realizar backups periódicos

3. **Correo Electrónico**
   - Usar contraseñas fuertes
   - Habilitar autenticación de dos factores
   - Monitorear actividad sospechosa

## Solución de Problemas

1. **Error de Conexión a Base de Datos**

   - Verificar credenciales en `.env`
   - Asegurar que MySQL está corriendo
   - Verificar permisos de usuario

2. **Error de Envío de Correo**

   - Verificar credenciales SMTP
   - Comprobar configuración de Hostinger
   - Revisar logs del servidor

3. **Error de Token**
   - Verificar JWT_SECRET
   - Comprobar expiración del token
   - Limpiar localStorage y volver a login

## Contribuciones

Las contribuciones son bienvenidas. Por favor, seguir el proceso de pull request y asegurar que el código cumple con los estándares de seguridad.

## Licencia

Este proyecto está bajo la Licencia MIT.
