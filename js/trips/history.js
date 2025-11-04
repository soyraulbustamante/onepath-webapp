document.addEventListener("DOMContentLoaded", () => {
  // Función para mostrar/ocultar los detalles
  const botones = document.querySelectorAll(".btn-view-details");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const card = boton.closest(".trip-card");
      const detalles = card.querySelector(".trip-extra-details");

      if (!detalles) return;

      const visible = detalles.style.display === "block";

      // Alternar visibilidad
      detalles.style.display = visible ? "none" : "block";
      boton.textContent = visible ? "Ver detalles" : "Ocultar detalles";
    });
  });

  // Mostrar mensaje si no hay viajes
  const tripsList = document.getElementById("tripsHistoryList");
  const noTripsMessage = document.getElementById("noTripsMessage");

  if (tripsList && tripsList.children.length === 0) {
    noTripsMessage.style.display = "block";
  }
});
