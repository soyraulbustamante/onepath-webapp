// Driver "Mis Viajes" UI: render list, tabs and actions
(function() {
  'use strict';

  // State
  let currentTab = 'history'; // Mostrar historial por defecto para maquetar
  let driverTrips = [];
  let currentDeleteTrip = null;

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

  // Delete modal elements
  const deleteModal = document.getElementById('deleteModal');
  const deleteModalMessage = document.getElementById('deleteModalMessage');
  const deleteConsequences = document.getElementById('deleteConsequences');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const closeDeleteModal = document.getElementById('closeDeleteModal');

  function init() {
    bindEvents();
    // Inicializar el tab activo (historial por defecto)
    switchTab(currentTab);
    loadTrips();
    setupDeleteModal();
  }

  function bindEvents() {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });
  }

  function setupDeleteModal() {
    // Setup delete modal event listeners
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    }

    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', closeDeleteModalFunc);
    }

    if (closeDeleteModal) {
      closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
    }

    // Close modal on overlay click
    if (deleteModal) {
      const overlay = deleteModal.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', closeDeleteModalFunc);
      }
    }

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deleteModal && deleteModal.style.display !== 'none') {
        closeDeleteModalFunc();
      }
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
        const tripId = btn.getAttribute('data-trip-id');
        const trip = driverTrips.find(t => String(t.id) === String(tripId));
        if (trip) {
          handleDeleteClick(trip);
        }
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

  function isTripInProgress(trip) {
    if (!trip.date || !trip.time) return false;
    const tripDateTime = new Date(trip.date + 'T' + trip.time);
    const now = new Date();
    return tripDateTime <= now;
  }

  function renderDriverTripCard(trip) {
    const dateObj = new Date(trip.date + 'T' + trip.time);
    const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = (trip.time || '').slice(0,5);

    const isInProgress = isTripInProgress(trip);
    const status = trip.status === 'cancelled' ? 'cancelled' : (isInProgress ? 'in-progress' : 'confirmed');
    const statusChipClass = status === 'cancelled' ? 'status-chip--cancelled' : (status === 'in-progress' ? 'status-chip--in-progress' : 'status-chip--active');
    const statusText = status === 'cancelled' ? 'Cancelado' : (status === 'in-progress' ? 'En Curso' : 'Programado');
    const idText = `#VJ-${trip.date?.replace(/-/g,'')}-${String(trip.id).slice(-3)}`;
    const price = typeof trip.price === 'number' ? trip.price.toFixed(2) : (trip.price || '0');
    const seatsInfo = `${(trip.passengers?.length || 0)}/${trip.seats || 4} asientos`;
    const vehicle = trip.vehicle || 'Vehículo';

    return `
      <div class="trip-card trip-card--driver">
        <div class="trip-card-header trip-card-header--driver">
          <div class="trip-status-header">
            <span class="status-chip ${statusChipClass}">● ${statusText}</span>
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
          <span class="passengers-count"><span class="material-icons">people</span> ${seatsInfo}</span>
        </div>

        <div class="trip-notes">
          <p><span class="material-icons">directions_car</span> ${vehicle}</p>
        </div>

        <div class="trip-actions--driver">
          <a href="../chat/messages.html" class="btn-secondary btn-small"><span class="btn-icon material-icons">chat</span> Mensajes</a>
          <button class="btn-secondary btn-small" data-action="edit-trip" data-trip-id="${trip.id}"><span class="btn-icon material-icons">edit</span> Editar</button>
          <button class="btn-danger btn-small ${isTripInProgress(trip) ? 'disabled' : ''}" data-action="delete-trip" data-trip-id="${trip.id}" ${isTripInProgress(trip) ? 'disabled title="No se puede eliminar un viaje en curso"' : ''}><span class="btn-icon material-icons">delete</span> Eliminar</button>
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
    if (avgRatingStat) avgRatingStat.textContent = '4.8';
    if (totalEarningsStat) totalEarningsStat.textContent = `S/${earnings.toFixed(0)}`;
  }

  // Delete trip functionality
  function handleDeleteClick(trip) {
    currentDeleteTrip = trip;

    // Validar si el viaje está en curso
    if (isTripInProgress(trip)) {
      showErrorNotification('No se puede eliminar un viaje que ya está en curso');
      return;
    }

    // Configurar mensaje del modal
    const hasPassengers = trip.passengers && trip.passengers.length > 0;
    let message = '¿Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer.';
    
    if (hasPassengers) {
      message = `¿Estás seguro de que deseas eliminar este viaje? Tienes ${trip.passengers.length} pasajero(s) reservado(s).`;
      if (deleteConsequences) {
        deleteConsequences.style.display = 'block';
      }
    } else {
      if (deleteConsequences) {
        deleteConsequences.style.display = 'none';
      }
    }

    if (deleteModalMessage) {
      deleteModalMessage.textContent = message;
    }

    openDeleteModal();
  }

  async function handleConfirmDelete() {
    if (!currentDeleteTrip) return;

    // Doble verificación: si el viaje está en curso
    if (isTripInProgress(currentDeleteTrip)) {
      closeDeleteModalFunc();
      showErrorNotification('No se puede eliminar un viaje que ya está en curso');
      return;
    }

    // Deshabilitar botón
    if (confirmDeleteBtn) {
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.innerHTML = '<span class="btn-icon material-icons">hourglass_empty</span> Eliminando...';
    }

    try {
      // Eliminar viaje
      await deleteTrip(currentDeleteTrip.id);
      
      // Liberar reservas de pasajeros
      await releasePassengerReservations(currentDeleteTrip);
      
      // Notificar a pasajeros
      await notifyPassengers(currentDeleteTrip);
      
      // Mostrar notificación de éxito
      showSuccessNotification('¡Viaje eliminado exitosamente! Los pasajeros han sido notificados.');

      // Cerrar modal
      closeDeleteModalFunc();

      // Recargar viajes
      setTimeout(() => {
        loadTrips();
      }, 500);

    } catch (error) {
      console.error('Error deleting trip:', error);
      showErrorNotification(error.message || 'Hubo un error al eliminar el viaje. Por favor, intenta nuevamente.');
      
      // Rehabilitar botón
      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = '<span class="btn-icon material-icons">delete</span> Eliminar Viaje';
      }
    }
  }

  async function deleteTrip(tripId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const trips = JSON.parse(localStorage.getItem('trips') || '[]');
          const tripIndex = trips.findIndex(t => String(t.id) === String(tripId));

          if (tripIndex === -1) {
            reject(new Error('El viaje no fue encontrado'));
            return;
          }

          const trip = trips[tripIndex];
          const currentUser = getCurrentUser();

          // Verificar que el usuario es el creador
          if (String(trip.driverId) !== String(currentUser.id) && String(trip.creatorId) !== String(currentUser.id)) {
            reject(new Error('No tienes permiso para eliminar este viaje. Solo el creador puede eliminarlo.'));
            return;
          }

          // Verificar que el viaje no haya empezado
          if (isTripInProgress(trip)) {
            reject(new Error('No se puede eliminar un viaje que ya está en curso'));
            return;
          }

          // Eliminar viaje del array
          trips.splice(tripIndex, 1);
          localStorage.setItem('trips', JSON.stringify(trips));

          console.log('Trip deleted:', tripId);
          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  }

  async function releasePassengerReservations(trip) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!trip.passengers || trip.passengers.length === 0) {
          resolve({ success: true });
          return;
        }

        try {
          // Obtener reservas del storage
          const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
          
          // Eliminar reservas relacionadas con este viaje
          const updatedReservations = reservations.filter(res => 
            String(res.tripId) !== String(trip.id)
          );

          localStorage.setItem('reservations', JSON.stringify(updatedReservations));
          console.log('Passenger reservations released:', trip.passengers.length);
          
          resolve({ success: true });
        } catch (error) {
          console.error('Error releasing reservations:', error);
          resolve({ success: true }); // Continuar incluso si hay error
        }
      }, 200);
    });
  }

  async function notifyPassengers(trip) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!trip.passengers || trip.passengers.length === 0) {
          resolve({ success: true });
          return;
        }

        try {
          // Obtener notificaciones del storage
          const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

          // Crear notificación para cada pasajero
          trip.passengers.forEach(passengerId => {
            const dateStr = trip.date ? new Date(trip.date).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }) : 'la fecha programada';
            
            notifications.push({
              id: `notif-${Date.now()}-${Math.random()}`,
              userId: passengerId,
              type: 'trip_deleted',
              title: 'Viaje Eliminado',
              message: `El conductor ha eliminado el viaje de ${trip.origin} a ${trip.destination} del ${dateStr}. Tus asientos han sido liberados automáticamente.`,
              tripId: trip.id,
              read: false,
              createdAt: new Date().toISOString()
            });
          });

          localStorage.setItem('notifications', JSON.stringify(notifications));
          console.log('Passengers notified about deletion:', trip.passengers.length);

          resolve({ success: true });
        } catch (error) {
          console.error('Error notifying passengers:', error);
          resolve({ success: true }); // Continuar incluso si hay error
        }
      }, 200);
    });
  }

  function openDeleteModal() {
    if (deleteModal) {
      deleteModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      if (cancelDeleteBtn) {
        setTimeout(() => cancelDeleteBtn.focus(), 100);
      }
    }
  }

  function closeDeleteModalFunc() {
    if (deleteModal) {
      deleteModal.style.display = 'none';
      document.body.style.overflow = '';
      currentDeleteTrip = null;

      // Reset button
      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = '<span class="btn-icon material-icons">delete</span> Eliminar Viaje';
      }
    }
  }

  function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon material-icons">check</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }

  function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon material-icons">close</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
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


