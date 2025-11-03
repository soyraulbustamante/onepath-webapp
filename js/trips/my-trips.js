// Driver "Mis Viajes" UI: render list, tabs and actions (UI only)
(function() {
  'use strict';

  // State
  let currentTab = 'upcoming';
  let driverTrips = [];

  // Elements
  const loadingState = document.getElementById('loadingState');
  const contentGrid = document.getElementById('tripsContent');
  const emptyState = document.getElementById('emptyState');
  const listContainer = document.getElementById('tripsListContent');
  const tabButtons = document.querySelectorAll('.tab-button');
  const upcomingBadge = document.getElementById('upcomingBadge');
  const historyBadge = document.getElementById('historyBadge');
  const cancelledBadge = document.getElementById('cancelledBadge');
  const activeTripsCount = document.getElementById('activeTripsCount');
  const completedTripsCount = document.getElementById('completedTripsCount');

  // Sidebar stats (driver)
  const totalTripsStat = document.getElementById('totalTripsStat');
  const totalPassengersStat = document.getElementById('totalPassengersStat');
  const avgRatingStat = document.getElementById('avgRatingStat');
  const totalEarningsStat = document.getElementById('totalEarningsStat');

  function init() {
    bindEvents();
    loadTrips();
  }

  function bindEvents() {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function loadTrips() {
    showLoading();

    try {
      const user = getCurrentUser();
      if (!user) throw new Error('Debes iniciar sesión para ver tus viajes');

      const trips = JSON.parse(localStorage.getItem('trips') || '[]');

      // Filter by driver
      driverTrips = trips.filter(t => String(t.driverId) === String(user.id));

      hideLoading();
      showContent();
      updateBadges();
      renderByTab();
      updateStats();
    } catch (err) {
      console.error(err);
      hideLoading();
      showEmpty();
    }
  }

  function switchTab(tab) {
    currentTab = tab;
    tabButtons.forEach(b => {
      const isActive = b.getAttribute('data-tab') === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    renderByTab();
  }

  function renderByTab() {
    const now = new Date();
    let items = [];

    if (currentTab === 'upcoming') {
      items = driverTrips.filter(t => new Date(t.date + 'T' + t.time) > now && t.status !== 'cancelled');
    } else if (currentTab === 'history') {
      items = driverTrips.filter(t => new Date(t.date + 'T' + t.time) <= now && t.status !== 'cancelled');
    } else {
      items = driverTrips.filter(t => t.status === 'cancelled');
    }

    if (!items.length) {
      showEmpty();
      if (listContainer) listContainer.innerHTML = '';
      return;
    }

    hideEmpty();
    if (!listContainer) return;
    listContainer.innerHTML = items.map(renderDriverTripCard).join('');

    // Attach per-card actions (UI only)
    document.querySelectorAll('[data-action="delete-trip"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Eliminar (UI demo): aquí abriríamos el modal de confirmación.');
      });
    });
  }

  function renderDriverTripCard(trip) {
    const dateObj = new Date(trip.date + 'T' + trip.time);
    const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = (trip.time || '').slice(0,5);

    const status = trip.status === 'cancelled' ? 'cancelled' : 'confirmed';
    const statusChipClass = status === 'confirmed' ? 'status-chip--active' : 'status-chip--cancelled';
    const idText = `#VJ-${trip.date?.replace(/-/g,'')}-${String(trip.id).slice(-3)}`;
    const price = typeof trip.price === 'number' ? trip.price.toFixed(2) : (trip.price || '0');
    const seatsInfo = `${(trip.passengers?.length || 0)}/${trip.seats || 4} asientos`;
    const vehicle = trip.vehicle || 'Vehículo';

    return `
      <div class="trip-card trip-card--driver">
        <div class="trip-card-header trip-card-header--driver">
          <div class="trip-status-header">
            <span class="status-chip ${statusChipClass}">● ${status === 'confirmed' ? 'Programado' : 'Cancelado'}</span>
            <span class="trip-id">${idText}</span>
          </div>
          <div class="trip-cost">
            <span class="cost-amount">S/${price}</span>
            <span class="cost-label">tarifa</span>
          </div>
        </div>

        <div class="trip-info-section">
          <div class="trip-meta">
            <div class="route-time">${timeStr} ${dateStr}</div>
            <div class="route-from"><strong>${trip.origin}</strong> <span class="route-address">${trip.originAddress || ''}</span></div>
          </div>
          <div class="trip-meta">
            <div class="route-time">${estimateArrival(timeStr, 45)}</div>
            <div class="route-to"><strong>${trip.destination}</strong> <span class="route-address">${trip.destinationAddress || ''}</span></div>
          </div>
        </div>

        <div class="trip-passengers-info">
          <span class="passengers-count">👥 ${seatsInfo}</span>
        </div>

        <div class="trip-notes">
          <p>🚗 ${vehicle}</p>
        </div>

        <div class="trip-actions--driver">
          <a href="../chat/messages.html" class="btn-secondary btn-small"><span class="btn-icon">💬</span> Mensajes</a>
          <a href="../trips/edit.html" class="btn-secondary btn-small"><span class="btn-icon">✏️</span> Editar</a>
          <button class="btn-danger btn-small" data-action="delete-trip"><span class="btn-icon">🗑️</span> Eliminar</button>
        </div>
      </div>
    `;
  }

  function estimateArrival(timeHHMM, addMinutes) {
    const [h, m] = (timeHHMM || '00:00').split(':').map(Number);
    const total = h * 60 + m + (addMinutes || 0);
    const hh = String(Math.floor(total / 60)).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function updateBadges() {
    const now = new Date();
    const up = driverTrips.filter(t => new Date(t.date + 'T' + t.time) > now && t.status !== 'cancelled').length;
    const hist = driverTrips.filter(t => new Date(t.date + 'T' + t.time) <= now && t.status !== 'cancelled').length;
    const canc = driverTrips.filter(t => t.status === 'cancelled').length;

    if (upcomingBadge) upcomingBadge.textContent = up;
    if (historyBadge) historyBadge.textContent = hist;
    if (cancelledBadge) cancelledBadge.textContent = canc;
    if (activeTripsCount) activeTripsCount.textContent = up;
    if (completedTripsCount) completedTripsCount.textContent = hist;
  }

  function updateStats() {
    const total = driverTrips.length;
    const passengerCount = driverTrips.reduce((sum, t) => sum + (t.passengers?.length || 0), 0);
    const earnings = driverTrips.reduce((sum, t) => sum + (Number(t.price) || 0) * (t.passengers?.length || 0), 0);

    if (totalTripsStat) totalTripsStat.textContent = total;
    if (totalPassengersStat) totalPassengersStat.textContent = passengerCount;
    if (avgRatingStat) avgRatingStat.textContent = '4.8 ⭐';
    if (totalEarningsStat) totalEarningsStat.textContent = `S/${earnings.toFixed(0)}`;
  }

  // UI helpers
  function showLoading() { if (loadingState) loadingState.style.display = 'block'; if (contentGrid) contentGrid.style.display = 'none'; }
  function hideLoading() { if (loadingState) loadingState.style.display = 'none'; }
  function showContent() { if (contentGrid) contentGrid.style.display = 'grid'; }
  function showEmpty() { if (emptyState) emptyState.style.display = 'block'; }
  function hideEmpty() { if (emptyState) emptyState.style.display = 'none'; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


