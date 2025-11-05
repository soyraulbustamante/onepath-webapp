document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".reward-card .btn-primary");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const reward = btn.parentElement.querySelector("h3").textContent;
      alert(`🎉 Has canjeado: ${reward}`);
    });
  });
});

