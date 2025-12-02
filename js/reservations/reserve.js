// Reserva: cálculo de total y acciones básicas
(function () {
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

  function maskName(fullName) {
    if (!fullName) return 'Usuario';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first} ${last.charAt(0)}**`;
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

    // Guardar disponible para uso en el formulario
    window.__availableSeatsForTrip = available;

    // Summary
    const summaryDateEl = document.getElementById('summaryDate');
    const summaryTimeEl = document.getElementById('summaryTime');
    const summaryOriginEl = document.getElementById('summaryOrigin');
    const summaryDestinationEl = document.getElementById('summaryDestination');
    if (summaryDateEl) summaryDateEl.textContent = String(trip.date || '');
    if (summaryTimeEl) summaryTimeEl.textContent = String(trip.time || '');
    if (summaryOriginEl) summaryOriginEl.textContent = escapeHtml(trip.origin || '');
    if (summaryDestinationEl) summaryDestinationEl.textContent = escapeHtml(trip.destination || '');

    // Render passengers
    renderPassengers(trip);
  }

  function renderPassengers(trip) {
    const section = document.getElementById('passengersSection');
    const list = document.getElementById('passengersList');
    if (!section || !list) return;

    const passengersIds = trip.passengers || [];
    if (passengersIds.length === 0) {
      section.style.display = 'none';
      return;
    }

    const users = getUsers();
    list.innerHTML = '';

    // Estilos del contenedor para scroll horizontal
    list.style.display = 'flex';
    list.style.flexDirection = 'row';
    list.style.overflowX = 'auto';
    list.style.gap = '16px';
    list.style.padding = '10px 0';
    list.style.scrollbarWidth = 'thin'; // Firefox

    passengersIds.forEach(pid => {
      const user = users.find(u => String(u.id) === String(pid));
      if (!user) return;

      const item = document.createElement('div');
      item.className = 'passenger-item';
      // Estilos inline para layout horizontal
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'center';
      item.style.minWidth = '100px';
      item.style.textAlign = 'center';
      item.style.padding = '8px';
      item.style.backgroundColor = 'var(--bg-secondary)';
      item.style.borderRadius = '8px';
      item.style.flexShrink = '0'; // Evitar que se encojan

      const name = maskName(user.name);
      const rating = user.rating || 0;

      item.innerHTML = `
        <img class="js-random-avatar" data-size="48" data-variant="avataaars" src="../../assets/images/avatars/default.svg" alt="${escapeHtml(name)}" style="width: 48px; height: 48px; border-radius: 50%; margin-bottom: 8px;">
        <div class="passenger-info">
          <div class="passenger-name" style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(name)}</div>
          <div class="passenger-rating" style="font-size: 0.8rem; color: var(--text-secondary);">
            <span style="color: var(--warning);">★</span> ${Number(rating).toFixed(1)}
          </div>
        </div>
      `;
      list.appendChild(item);
    });

    if (list.children.length > 0) {
      section.style.display = 'block';
      // Reinicializar avatares para los nuevos elementos
      setRandomAvatars();
    } else {
      section.style.display = 'none';
    }
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
    const submitBtn = form.querySelector('button[type="submit"]');
    // Cargar viaje por query param
    const tripId = getQueryParam('tripId');
    let currentTrip = null;
    if (tripId) {
      const trips = getStoredTrips();
      currentTrip = trips.find(t => String(t.id) === String(tripId));
      if (currentTrip) {
        populateTripDetails(currentTrip);
        // Configurar opciones de pasajeros según asientos disponibles
        const max = Number.isFinite(window.__availableSeatsForTrip) ? window.__availableSeatsForTrip : 1;
        // Reconstruir opciones 1..max (o deshabilitar si 0)
        while (passengersSelect.firstChild) passengersSelect.removeChild(passengersSelect.firstChild);
        if (max >= 1) {
          for (let i = 1; i <= max; i++) {
            const opt = document.createElement('option');
            opt.value = String(i);
            opt.textContent = i === 1 ? '1 pasajero' : `${i} pasajeros`;
            passengersSelect.appendChild(opt);
          }
          passengersSelect.disabled = false;
          passengersSelect.value = '1';
          if (submitBtn) submitBtn.disabled = false;
        } else {
          const opt = document.createElement('option');
          opt.value = '0';
          opt.textContent = '0 pasajeros';
          passengersSelect.appendChild(opt);
          passengersSelect.disabled = true;
          passengersSelect.value = '0';
          if (submitBtn) submitBtn.disabled = true;
        }
      }
    }

    const pricePer = typeof currentTrip?.price === 'number' ? currentTrip.price : 8; // fallback: 8

    function updateTotal() {
      const max = Number.isFinite(window.__availableSeatsForTrip) ? window.__availableSeatsForTrip : undefined;
      let qty = parseInt(passengersSelect.value || '1', 10);
      if (typeof max === 'number') {
        qty = Math.min(Math.max(qty, 0), Math.max(0, max));
      }
      qtyEl.textContent = String(qty);
      pricePerEl.textContent = pricePer.toFixed(2);
      totalEl.textContent = (pricePer * qty).toFixed(2);
      // Deshabilitar submit si qty es 0
      const submitBtn2 = form.querySelector('button[type="submit"]');
      if (submitBtn2) submitBtn2.disabled = (qty <= 0);
    }

    passengersSelect.addEventListener('change', updateTotal);
    updateTotal();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const qty = parseInt(passengersSelect.value || '1', 10);
      if (qty <= 0) {
        if (typeof showNotification === 'function') {
          showNotification('No hay asientos disponibles para reservar.', 'warning');
        } else {
          alert('No hay asientos disponibles para reservar.');
        }
        return;
      }
      const total = pricePer * qty;

      // Mostrar popup de confirmación tipo burbuja
      showReservationConfirmationPopup(total);

      setTimeout(() => {
        window.location.href = '../reservations/my-reservations.html';
      }, 3000);
    });

    if (contactBtn) {
      contactBtn.addEventListener('click', function () {
        window.location.href = '../chat/messages.html';
      });
    }

    if (favBtn) {
      favBtn.addEventListener('click', function () {
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
      img.onerror = function () { img.src = fallback; };
      img.src = url;
    });
  }

  /**
   * Muestra un popup de confirmación cuando se envía la solicitud de reserva
   * @param {number} total - Total a pagar
   */
  function showReservationConfirmationPopup(total) {
    // Eliminar popup existente si hay uno
    const existingPopup = document.querySelector('.trip-confirmation-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Crear el popup
    const popup = document.createElement('div');
    popup.className = 'trip-confirmation-popup';
    popup.innerHTML = `
      <div class="trip-confirmation-popup__icon">
        <span class="material-icons">check_circle</span>
      </div>
      <h3 class="trip-confirmation-popup__title">¡Reserva Creada!</h3>
      <p class="trip-confirmation-popup__message">
        Tu solicitud de reserva ha sido enviada correctamente.<br>
        Total: S/ ${total.toFixed(2)}
      </p>
    `;

    // Añadir al body
    document.body.appendChild(popup);

    // Mostrar con animación
    requestAnimationFrame(() => {
      popup.classList.add('show');
    });

    // Ocultar después de 2.5 segundos
    setTimeout(() => {
      popup.classList.remove('show');
      popup.classList.add('hide');

      // Eliminar del DOM después de la animación
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 400);
    }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();