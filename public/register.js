document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageDiv = document.getElementById("message");

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      messageDiv.textContent = "Las contraseñas no coinciden";
      messageDiv.className = "error";
      return;
    }

    // Validar formato de contraseña
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      messageDiv.textContent =
        "La contraseña debe tener al menos 8 caracteres, una letra, un número y un carácter especial";
      messageDiv.className = "error";
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      messageDiv.textContent = "Registro exitoso. Redirigiendo al login...";
      messageDiv.className = "success";

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      messageDiv.textContent = error.message;
      messageDiv.className = "error";
    }
  });
