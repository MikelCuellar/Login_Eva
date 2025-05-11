<!-- La conexión de base de datos debe ir cifrada en su contraseña, puede usar tambien PDO para mejores practicas. -->
 
<?php
$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'evaluacion_ciberseguridad';

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die('Conexión fallida: ' . $conn->connect_error);
}
?>
