(function() {
  'use strict';

  function getDriverInfo(driverId) {
    try {
      const users = (window.Storage && typeof window.Storage.getUsers === 'function')
        ? window.Storage.getUsers()
        : JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === driverId);
      if (!user) return { name: 'Conductor', major: '', rating: null };
      return { name: user.name || 'Conductor', major: user.major || '', rating: (typeof user.rating === 'number' ? user.rating : null) };
    } catch (e) {
      return { name: 'Conductor', major: '', rating: null };
    }
  }

  function starString(rating) {
    const r = Math.round(Math.max(0, Math.min(5, Number(rating) || 0)));
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }

  function createTripCard(trip) {
    const driver = getDriverInfo(trip.driverId);
    const rating = (typeof driver.rating === 'number' ? driver.rating : (typeof trip.driverRating === 'number' ? trip.driverRating : 0));
    const capacity = parseInt(trip?.seats || 0, 10);
    const taken = Array.isArray(trip?.passengers) ? trip.passengers.length : 0;
    const remaining = Math.max(0, capacity - taken);

    const article = document.createElement('article');
    article.className = 'trip-card';

    article.innerHTML = `
      <div class="trip-card-header driver-header">
        <div class="driver-avatar">
          <img class="js-random-avatar" data-size="64" data-variant="avataaars" src="../../assets/images/avatars/default.svg" alt="Avatar de ${escapeHtml(driver.name)}">
        </div>
        <div class="driver-info">
          <h3>${escapeHtml(driver.name)}${driver.major ? ` <span class="text-muted">- ${escapeHtml(driver.major)}</span>` : ''}</h3>
          <div class="driver-meta">
            <span class="rating-stars">${starString(rating)}</span>
            <span class="rating-value">${Number(rating || 0).toFixed(1)}</span>
          </div>
        </div>
        <div class="price-box">
          <span class="price-amount">S/ ${Number(trip.price || 0).toFixed(2)}</span>
          <span class="price-unit">por persona</span>
        </div>
      </div>

      <div class="trip-route">
        <div class="route-point departure">
          <span class="route-dot green"></span>
          <div class="route-details">
            <span class="route-time">${escapeHtml(trip.time || '')}</span>
            <span class="route-location">${escapeHtml(trip.origin || '')}</span>
            ${trip.originAddress ? `<small class="text-muted">${escapeHtml(trip.originAddress)}</small>` : ''}
          </div>
        </div>
        <div class="route-middle">
          <span class="duration">${estimateDuration(trip)} min</span>
          <div class="route-line"></div>
          <span class="car-icon material-icons" aria-hidden="true">directions_car</span>
        </div>
        <div class="route-point arrival">
          <span class="route-dot red"></span>
          <div class="route-details">
            <span class="route-time">${arrivalTime(trip)}</span>
            <span class="route-location">${escapeHtml(trip.destination || '')}</span>
            ${trip.destinationAddress ? `<small class="text-muted">${escapeHtml(trip.destinationAddress)}</small>` : ''}
          </div>
        </div>
      </div>

      <div class="trip-details">
        <div class="trip-info">
          <div class="trip-meta-row">
            <span class="trip-duration"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">access_time</span> ${estimateDuration(trip)} min</span>
            <span class="trip-seats"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">event_seat</span> ${escapeHtml(String(remaining))} asientos disponibles</span>
          </div>
          ${trip.vehicle ? `<span class="trip-vehicle"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">directions_car</span> ${escapeHtml(trip.vehicle)}</span>` : ''}
        </div>
        <div class="trip-actions">
          <a href="../../pages/reservations/reserve.html" class="btn-reserve">Reservar</a>
        </div>
      </div>
    `;

    return article;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function estimateDuration(trip) {
    // Placeholder simple duration; could be improved with distance calc later
    return 45;
  }

  function arrivalTime(trip) {
    // Simple arrival time from trip.time + estimateDuration
    const t = (trip.time || '').trim();
    if (!/^\d{2}:\d{2}$/.test(t)) return '';
    const [h, m] = t.split(':').map(n => parseInt(n, 10));
    const total = h * 60 + m + estimateDuration(trip);
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return String(nh).padStart(2, '0') + ':' + String(nm).padStart(2, '0');
  }

  window.TripCard = {
    render: createTripCard
  };
})();