document.addEventListener("DOMContentLoaded", async () => {
  // Verificar si hay un token
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  try {
    // Verificar el token con el backend
    const response = await fetch("/api/auth/verify", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Si el token no es válido, redirigir al login
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }

    // Si todo está correcto, mostrar el dashboard
    document.querySelector(".dashboard-card").style.display = "block";
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  // Manejar el cierre de sesión
  document.getElementById("logoutBtn").addEventListener("click", () => {
    // Limpiar el token
    localStorage.removeItem("token");

    // Redirigir al login
    window.location.href = "/";
  });

  // Agregar animaciones a los elementos de validación
  const validationItems = document.querySelectorAll(".validation-item");
  validationItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateX(0)";
    }, index * 200);
  });
});
