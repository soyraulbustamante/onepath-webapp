// Trip detail / reservation interactions
(function () {
  'use strict';

  const passengersSelect = document.getElementById('passengers');
  const qtyEl = document.getElementById('qty');
  const totalEl = document.getElementById('total');
  const priceEachEl = document.getElementById('priceEach');
  const submitBtn = document.getElementById('submitReservation');

  const PRICE_PER_PERSON = 8; // S/

  function init() {
    if (priceEachEl) priceEachEl.textContent = formatMoney(PRICE_PER_PERSON);
    updateTotal();

    if (passengersSelect) {
      passengersSelect.addEventListener('change', updateTotal);
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmit);
    }
  }

  function updateTotal() {
    const qty = Number(passengersSelect?.value || 1);
    if (qtyEl) qtyEl.textContent = String(qty);
    if (totalEl) totalEl.textContent = formatMoney(qty * PRICE_PER_PERSON);
  }

  function handleSubmit() {
    // In a real app, here we would call the API to create the reservation
    const qty = Number(passengersSelect?.value || 1);
    alert(`Solicitud enviada para ${qty} pasajero(s). ¡Te notificaremos cuando el conductor confirme!`);
  }

  function formatMoney(amount) {
    return `S/ ${amount.toFixed(2)}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


