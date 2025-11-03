// Driver "Mis Viajes" UI: render list, tabs and actions (UI only)
(function() {
  'use strict';

  // State
  let currentTab = 'history'; // Mostrar historial por defecto para maquetar
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
    // Inicializar el tab activo (historial por defecto)
    switchTab(currentTab);
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
      let user = getCurrentUser();
      
      // Si no hay usuario o es pasajero, usar el conductor de demo para maquetar
      if (!user || (user.role !== 'driver' && user.id !== 'driver-001')) {
        const demoDriver = localStorage.getItem('demoDriver');
        if (demoDriver) {
          user = JSON.parse(demoDriver);
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          // Crear usuario conductor de demo si no existe
          user = { id: 'driver-001', name: 'Carlos Mendoza', role: 'driver', university: 'UNMSM', major: 'Ing. Sistemas' };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('demoDriver', JSON.stringify(user));
        }
      }

      let trips = JSON.parse(localStorage.getItem('trips') || '[]');
      const driverTripsCount = trips.filter(t => String(t.driverId) === String(user.id)).length;

      // Si no hay viajes o muy pocos del conductor, agregar algunos de ejemplo para maquetar
      if (driverTripsCount < 3) {
        const demoTrips = createDemoTrips(user.id);
        // Agregar solo los viajes de demo que no existan ya
        demoTrips.forEach(demoTrip => {
          if (!trips.find(t => t.id === demoTrip.id)) {
            trips.push(demoTrip);
          }
        });
        localStorage.setItem('trips', JSON.stringify(trips));
      }

      // Filter by driver
      driverTrips = trips.filter(t => String(t.driverId) === String(user.id));

      hideLoading();
      showContent();
      updateBadges();
      renderByTab();
      updateStats();
    } catch (err) {
      console.error('Error loading trips:', err);
      hideLoading();
      showEmpty();
    }
  }

  function createDemoTrips(driverId) {
    const now = new Date();
    const minusDays = (d) => {
      const n = new Date(now);
      n.setDate(n.getDate() - d);
      return n;
    };
    const plusDays = (d) => {
      const n = new Date(now);
      n.setDate(n.getDate() + d);
      return n;
    };

    return [
      {
        id: 'trip-demo-1',
        driverId: driverId,
        creatorId: driverId,
        origin: 'Metro San Isidro',
        originAddress: 'Av. Javier Prado Este 4200',
        destination: 'Puerta Principal UNMSM',
        destinationAddress: 'Av. Venezuela s/n, Lima',
        date: minusDays(7).toISOString().split('T')[0],
        time: '07:30',
        driverName: 'Carlos M.',
        driverMajor: 'Ing. Sistemas',
        driverRating: 4.9,
        seats: 4,
        price: 8.00,
        passengers: ['passenger-001', 'passenger-002'],
        vehicle: 'Volkswagen Golf Gris',
        createdAt: minusDays(8).toISOString()
      },
      {
        id: 'trip-demo-2',
        driverId: driverId,
        creatorId: driverId,
        origin: 'Jockey Plaza',
        originAddress: 'Av. Javier Prado Este 4200',
        destination: 'Facultad de Medicina',
        destinationAddress: 'Ciudad Universitaria',
        date: minusDays(5).toISOString().split('T')[0],
        time: '08:00',
        driverName: 'Carlos M.',
        driverMajor: 'Ing. Sistemas',
        driverRating: 4.9,
        seats: 3,
        price: 10.00,
        passengers: ['passenger-003'],
        vehicle: 'Toyota Corolla Blanco',
        createdAt: minusDays(6).toISOString()
      },
      {
        id: 'trip-demo-3',
        driverId: driverId,
        creatorId: driverId,
        origin: 'Miraflores Centro',
        originAddress: 'Av. Larco 1234',
        destination: 'Biblioteca Central UNMSM',
        destinationAddress: 'Ciudad Universitaria',
        date: minusDays(3).toISOString().split('T')[0],
        time: '06:45',
        seats: 2,
        price: 6.00,
        passengers: ['passenger-002', 'passenger-003'],
        vehicle: 'Honda Civic Azul',
        createdAt: minusDays(4).toISOString()
      },
      {
        id: 'trip-demo-4',
        driverId: driverId,
        creatorId: driverId,
        origin: 'Larcomar',
        originAddress: 'Malecón de la Reserva 610',
        destination: 'Campus Principal PUCP',
        destinationAddress: 'Av. Universitaria 1801',
        date: minusDays(10).toISOString().split('T')[0],
        time: '09:15',
        seats: 4,
        price: 12.00,
        passengers: ['passenger-001'],
        vehicle: 'Nissan Sentra Negro',
        createdAt: minusDays(11).toISOString()
      },
      {
        id: 'trip-demo-5',
        driverId: driverId,
        creatorId: driverId,
        origin: 'Centro de Lima',
        originAddress: 'Plaza San Martín',
        destination: 'Universidad Nacional de Ingeniería',
        destinationAddress: 'Av. Túpac Amaru 210',
        date: minusDays(2).toISOString().split('T')[0],
        time: '14:30',
        seats: 3,
        price: 9.00,
        passengers: ['passenger-003', 'passenger-004'],
        vehicle: 'Hyundai Elantra Blanco',
        createdAt: minusDays(3).toISOString()
      },
      {
        id: 'trip-demo-6',
        driverId: driverId,
        creatorId: driverId,
        origin: 'San Miguel',
        originAddress: 'Av. La Marina 1200',
        destination: 'Puerta Principal UNMSM',
        destinationAddress: 'Av. Venezuela s/n, Lima',
        date: plusDays(1).toISOString().split('T')[0],
        time: '07:00',
        driverName: 'Carlos M.',
        driverMajor: 'Ing. Sistemas',
        driverRating: 4.9,
        seats: 4,
        price: 7.50,
        passengers: ['passenger-001'],
        vehicle: 'Volkswagen Golf Gris',
        createdAt: now.toISOString()
      },
      {
        id: 'trip-demo-7',
        driverId: driverId,
        creatorId: driverId,
        origin: 'Plaza Norte',
        originAddress: 'Av. Túpac Amaru 2499',
        destination: 'Facultad de Medicina',
        destinationAddress: 'Ciudad Universitaria',
        date: plusDays(2).toISOString().split('T')[0],
        time: '08:30',
        driverName: 'Carlos M.',
        driverMajor: 'Ing. Sistemas',
        driverRating: 4.9,
        seats: 3,
        price: 9.00,
        passengers: [],
        vehicle: 'Toyota Corolla Blanco',
        createdAt: now.toISOString()
      }
    ];
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

    // Attach per-card actions
    document.querySelectorAll('[data-action="delete-trip"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Eliminar (UI demo): aquí abriríamos el modal de confirmación.');
      });
    });

    // Attach edit buttons
    document.querySelectorAll('[data-action="edit-trip"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tripId = btn.getAttribute('data-trip-id');
        if (tripId && window.openEditTripModal) {
          window.openEditTripModal(tripId);
        }
      });
    });
  }

  // Listen for trip update event to reload trips
  window.addEventListener('tripUpdated', () => {
    loadTrips();
  });

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
          <button class="btn-secondary btn-small" data-action="edit-trip" data-trip-id="${trip.id}"><span class="btn-icon">✏️</span> Editar</button>
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


