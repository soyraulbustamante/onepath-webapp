// Reserva: cálculo de total y acciones básicas
(function() {
  'use strict';

  function init() {
    const form = document.getElementById('reserveForm');
    const passengersSelect = document.getElementById('passengers');
    const pricePerEl = document.getElementById('pricePer');
    const qtyEl = document.getElementById('qty');
    const totalEl = document.getElementById('totalPrice');
    const contactBtn = document.getElementById('contactDriver');
    const favBtn = document.getElementById('saveFavorite');

    if (!form || !passengersSelect || !pricePerEl || !qtyEl || !totalEl) return;

    const pricePer = 8; // S/ 8 por persona (según diseño)

    function updateTotal() {
      const qty = parseInt(passengersSelect.value || '1', 10);
      qtyEl.textContent = String(qty);
      pricePerEl.textContent = pricePer.toFixed(2);
      totalEl.textContent = (pricePer * qty).toFixed(2);
    }

    passengersSelect.addEventListener('change', updateTotal);
    updateTotal();

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const qty = parseInt(passengersSelect.value || '1', 10);
      const total = pricePer * qty;
      if (typeof showNotification === 'function') {
        showNotification(`Solicitud enviada. Total: S/ ${total.toFixed(2)}`, 'success');
      } else {
        alert('Solicitud enviada. Total: S/ ' + total.toFixed(2));
      }
      setTimeout(() => {
        window.location.href = '../reservations/my-reservations.html';
      }, 1500);
    });

    if (contactBtn) {
      contactBtn.addEventListener('click', function() {
        window.location.href = '../chat/messages.html';
      });
    }

    if (favBtn) {
      favBtn.addEventListener('click', function() {
        if (typeof showNotification === 'function') {
          showNotification('Guardado en favoritos.', 'info');
        } else {
          alert('Guardado en favoritos.');
        }
      });
    }

    // Establecer avatares aleatorios mediante API pública (DiceBear)
    setRandomAvatars();
  }

  // Genera una URL de avatar aleatorio (DiceBear v8)
  function randomAvatarUrl(size, variant) {
    const seed = Math.random().toString(36).slice(2, 10);
    const sprite = typeof variant === 'string' && variant.length ? variant : 'avataaars';
    const s = parseInt(size || 64, 10);
    // Usamos PNG para asegurar tamaño fijo
    return `https://api.dicebear.com/8.x/${sprite}/png?seed=${seed}&size=${s}`;
  }

  function setRandomAvatars() {
    const imgs = document.querySelectorAll('img.js-random-avatar');
    imgs.forEach(img => {
      const fallback = img.getAttribute('src');
      const size = img.dataset.size || '64';
      const variant = img.dataset.variant || 'avataaars';
      const url = randomAvatarUrl(size, variant);
      // Si falla la carga, se mantiene el fallback local
      img.onerror = function() { img.src = fallback; };
      img.src = url;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();