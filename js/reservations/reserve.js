// Reserva: cálculo de total y acciones básicas
(function() {
  'use strict';

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search || '');
    return params.get(name);
  }

  function getStoredTrips() {
    try {
      const raw = localStorage.getItem('trips');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function getUsers() {
    try {
      const raw = localStorage.getItem('users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function starString(rating) {
    const r = Math.max(0, Math.min(5, Number(rating || 0)));
    const full = Math.floor(r);
    const half = (r - full) >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function populateTripDetails(trip) {
    // Driver info
    const users = getUsers();
    const driver = users.find(u => String(u.id) === String(trip.driverId));
    const driverNameEl = document.getElementById('driverName');
    const driverStarsEl = document.getElementById('driverStars');
    const driverRatingEl = document.getElementById('driverRating');
    if (driverNameEl) {
      const name = driver?.name || 'Conductor';
      const major = driver?.major ? ` - ${driver.major}` : '';
      driverNameEl.textContent = escapeHtml(name + major);
    }
    const ratingVal = Number(driver?.rating ?? trip.driverRating ?? 0);
    if (driverStarsEl) driverStarsEl.textContent = starString(ratingVal);
    if (driverRatingEl) driverRatingEl.textContent = ratingVal.toFixed(1);

    // Price
    const priceAmountEl = document.getElementById('priceAmount');
    if (priceAmountEl && typeof trip.price === 'number') {
      priceAmountEl.textContent = `S/ ${trip.price.toFixed(2)}`;
    }

    // Route
    const depTimeEl = document.getElementById('departureTime');
    const originNameEl = document.getElementById('originName');
    const originAddressEl = document.getElementById('originAddress');
    const arrTimeEl = document.getElementById('arrivalTime');
    const destNameEl = document.getElementById('destinationName');
    const destAddressEl = document.getElementById('destinationAddress');

    if (depTimeEl) depTimeEl.textContent = String(trip.time || '');
    if (originNameEl) originNameEl.textContent = escapeHtml(trip.origin || '');
    if (originAddressEl) originAddressEl.textContent = escapeHtml(trip.originAddress || '');
    if (destNameEl) destNameEl.textContent = escapeHtml(trip.destination || '');
    if (destAddressEl) destAddressEl.textContent = escapeHtml(trip.destinationAddress || '');
    if (arrTimeEl) {
      // Estimación simple: +45min
      const [h, m] = String(trip.time || '00:00').split(':').map(n => parseInt(n, 10));
      const d = new Date(); d.setHours(h || 0, (m || 0) + 45, 0, 0);
      const ah = String(d.getHours()).padStart(2, '0');
      const am = String(d.getMinutes()).padStart(2, '0');
      arrTimeEl.textContent = `${ah}:${am}`;
    }

    // Stats
    const statsSeatsEl = document.getElementById('statsSeats');
    const statsVehicleEl = document.getElementById('statsVehicleName');
    const statsDurationEl = document.getElementById('statsDuration');
    const statsDestinationEl = document.getElementById('statsDestination');
    const capacity = parseInt(trip.seats || 0, 10);
    const taken = Array.isArray(trip.passengers) ? trip.passengers.length : 0;
    const available = Math.max(0, capacity - taken);
    if (statsSeatsEl) statsSeatsEl.textContent = `${available} asientos`;
    if (statsVehicleEl) statsVehicleEl.textContent = escapeHtml(trip.vehicle || 'Vehículo');
    if (statsDurationEl) statsDurationEl.textContent = '45 minutos';
    if (statsDestinationEl) statsDestinationEl.textContent = (driver?.university || 'Destino');

    // Summary
    const summaryDateEl = document.getElementById('summaryDate');
    const summaryTimeEl = document.getElementById('summaryTime');
    const summaryOriginEl = document.getElementById('summaryOrigin');
    const summaryDestinationEl = document.getElementById('summaryDestination');
    if (summaryDateEl) summaryDateEl.textContent = String(trip.date || '');
    if (summaryTimeEl) summaryTimeEl.textContent = String(trip.time || '');
    if (summaryOriginEl) summaryOriginEl.textContent = escapeHtml(trip.origin || '');
    if (summaryDestinationEl) summaryDestinationEl.textContent = escapeHtml(trip.destination || '');
  }

  function init() {
    const form = document.getElementById('reserveForm');
    const passengersSelect = document.getElementById('passengers');
    const pricePerEl = document.getElementById('pricePer');
    const qtyEl = document.getElementById('qty');
    const totalEl = document.getElementById('totalPrice');
    const contactBtn = document.getElementById('contactDriver');
    const favBtn = document.getElementById('saveFavorite');

    if (!form || !passengersSelect || !pricePerEl || !qtyEl || !totalEl) return;
    // Cargar viaje por query param
    const tripId = getQueryParam('tripId');
    let currentTrip = null;
    if (tripId) {
      const trips = getStoredTrips();
      currentTrip = trips.find(t => String(t.id) === String(tripId));
      if (currentTrip) {
        populateTripDetails(currentTrip);
      }
    }

    const pricePer = typeof currentTrip?.price === 'number' ? currentTrip.price : 8; // fallback: 8

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