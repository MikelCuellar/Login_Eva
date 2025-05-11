document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageDiv = document.getElementById("message");
  const loginForm = document.getElementById("loginForm");
  const otpForm = document.getElementById("otpForm");

  try {
    // Primera fase: Login
    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(loginData.message || "Error en el login");
    }

    // Ocultar formulario de login y mostrar formulario OTP
    loginForm.style.display = "none";

    // Crear formulario OTP si no existe
    if (!otpForm) {
      const otpFormHTML = `
        <form id="otpForm">
          <h3>Verificación de Seguridad</h3>
          <p>Se ha enviado un código de verificación a tu correo electrónico.</p>
          <div class="form-group">
            <label for="otp">Código de Verificación:</label>
            <input type="text" id="otp" name="otp" required maxlength="6" pattern="[0-9]{6}" 
                   placeholder="Ingresa el código de 6 dígitos">
          </div>
          <button type="submit">Verificar</button>
          <button type="button" id="resendOTP" class="secondary-button">Reenviar código</button>
        </form>
      `;
      document
        .querySelector(".login-form")
        .insertAdjacentHTML("beforeend", otpFormHTML);

      // Agregar evento para reenviar OTP
      document
        .getElementById("resendOTP")
        .addEventListener("click", async () => {
          try {
            const resendResponse = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            });

            const resendData = await resendResponse.json();

            if (!resendResponse.ok) {
              throw new Error(
                resendData.message || "Error al reenviar el código"
              );
            }

            messageDiv.textContent =
              "Se ha reenviado el código de verificación";
            messageDiv.className = "success";
          } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.className = "error";
          }
        });

      // Agregar evento para el formulario OTP
      document
        .getElementById("otpForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const otp = document.getElementById("otp").value;

          try {
            const otpResponse = await fetch("/api/auth/verify-otp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, otp }),
            });

            const otpData = await otpResponse.json();

            if (!otpResponse.ok) {
              throw new Error(
                otpData.message || "Error en la verificación OTP"
              );
            }

            // Guardar token y redirigir
            localStorage.setItem("token", otpData.token);
            messageDiv.textContent =
              otpData.message || "Verificación exitosa. Redirigiendo...";
            messageDiv.className = "success";

            setTimeout(() => {
              window.location.href = "/dashboard.html";
            }, 1000);
          } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.className = "error";
          }
        });
    }

    messageDiv.textContent = loginData.message;
    messageDiv.className = "success";
  } catch (error) {
    messageDiv.textContent = error.message;
    messageDiv.className = "error";
  }
});
