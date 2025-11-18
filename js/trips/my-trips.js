// Driver "Mis Viajes" UI: render list, tabs and actions
(function() {
  'use strict';

  // State
  let currentTab = 'history'; // Mostrar historial por defecto para maquetar
  let driverTrips = [];
  let currentDeleteTrip = null;
  let isDeleting = false; // Prevenir múltiples eliminaciones simultáneas

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
    // Validar que los elementos del modal existan
    if (!deleteModal || !confirmDeleteBtn || !cancelDeleteBtn || !closeDeleteModal) {
      console.warn('Algunos elementos del modal de eliminación no se encontraron');
      console.warn('deleteModal:', deleteModal);
      console.warn('confirmDeleteBtn:', confirmDeleteBtn);
      console.warn('cancelDeleteBtn:', cancelDeleteBtn);
      console.warn('closeDeleteModal:', closeDeleteModal);
      return;
    }

    console.log('✓ Elementos del modal encontrados correctamente');
    console.log('✓ Configurando event listeners...');

    // Setup delete modal event listeners
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    cancelDeleteBtn.addEventListener('click', closeDeleteModalFunc);
    closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
    
    console.log('✓ Event listeners configurados correctamente');

    // Close modal on overlay click
    const overlay = deleteModal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        // Solo cerrar si se hace clic directamente en el overlay, no en el contenido
        if (e.target === overlay) {
          closeDeleteModalFunc();
        }
      });
    }

    // Close modal on ESC key (solo si el modal está abierto y no se está eliminando)
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && deleteModal && deleteModal.style.display !== 'none' && !isDeleting) {
        closeDeleteModalFunc();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);

    // Guardar referencia para poder remover el listener si es necesario
    deleteModal._escapeHandler = handleEscapeKey;
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

    // Attach per-card actions con validaciones
    document.querySelectorAll('[data-action="delete-trip"]').forEach(btn => {
      // Remover listeners previos si existen para evitar duplicados
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevenir propagación del evento

        // Validar que el botón no esté deshabilitado
        if (newBtn.disabled || newBtn.classList.contains('disabled')) {
          return;
        }

        // Prevenir múltiples clics
        if (isDeleting) {
          return;
        }

        // Obtener ID del viaje
        const tripId = newBtn.getAttribute('data-trip-id');
        if (!tripId) {
          console.error('El botón de eliminar no tiene un data-trip-id válido');
          showErrorNotification('Error: No se pudo identificar el viaje');
          return;
        }

        // Buscar el viaje
        const trip = driverTrips.find(t => String(t.id) === String(tripId));
        if (!trip) {
          console.error('Viaje no encontrado:', tripId);
          showErrorNotification('Error: No se encontró el viaje seleccionado');
          return;
        }

        // Llamar a la función de manejo
        handleDeleteClick(trip);
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
    // Validaciones iniciales
    if (!trip) {
      console.error('No se proporcionó un viaje para eliminar');
      showErrorNotification('Error: No se pudo obtener la información del viaje');
      return;
    }

    if (!trip.id) {
      console.error('El viaje no tiene un ID válido');
      showErrorNotification('Error: El viaje no tiene un identificador válido');
      return;
    }

    // Validar que el usuario esté autenticado
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showErrorNotification('Debes iniciar sesión para eliminar un viaje');
      return;
    }

    // Validar permisos: verificar que el usuario es el creador del viaje
    if (String(trip.driverId) !== String(currentUser.id) && 
        String(trip.creatorId) !== String(currentUser.id)) {
      showErrorNotification('No tienes permiso para eliminar este viaje. Solo el creador puede eliminarlo.');
      return;
    }

    // Validar si el viaje está cancelado
    if (trip.status === 'cancelled' || trip.cancelled === true) {
      showErrorNotification('Este viaje ya ha sido cancelado');
      return;
    }

    // Validar si el viaje está en curso
    if (isTripInProgress(trip)) {
      showErrorNotification('No se puede eliminar un viaje que ya está en curso');
      return;
    }

    // Validar que el modal y sus elementos existan
    if (!deleteModal || !deleteModalMessage) {
      console.error('El modal de eliminación no está disponible');
      showErrorNotification('Error: No se puede abrir el modal de confirmación');
      return;
    }

    // Prevenir múltiples clics
    if (isDeleting) {
      return;
    }

    // Guardar referencia del viaje a eliminar
    currentDeleteTrip = trip;

    // Configurar mensaje del modal según si tiene pasajeros
    const hasPassengers = trip.passengers && Array.isArray(trip.passengers) && trip.passengers.length > 0;
    let message = '¿Estás seguro de que deseas eliminar este viaje? Esta acción no se puede deshacer.';
    
    if (hasPassengers) {
      const passengerCount = trip.passengers.length;
      message = `¿Estás seguro de que deseas eliminar este viaje? Tienes ${passengerCount} pasajero${passengerCount > 1 ? 's' : ''} reservado${passengerCount > 1 ? 's' : ''}.`;
      
      // Mostrar consecuencias si hay pasajeros
      if (deleteConsequences) {
        deleteConsequences.style.display = 'block';
      }
    } else {
      // Ocultar consecuencias si no hay pasajeros
      if (deleteConsequences) {
        deleteConsequences.style.display = 'none';
      }
    }

    // Actualizar mensaje del modal de forma segura
    deleteModalMessage.textContent = message;

    // Abrir modal
    openDeleteModal();
  }

  async function handleConfirmDelete() {
    console.log('=== BOTÓN ELIMINAR CLICKEADO ===');
    console.log('Estado actual - isDeleting:', isDeleting);
    console.log('Estado actual - currentDeleteTrip:', currentDeleteTrip);
    
    // Validar que hay un viaje seleccionado
    if (!currentDeleteTrip) {
      console.error('No hay un viaje seleccionado para eliminar');
      showErrorNotification('Error: No se pudo obtener la información del viaje');
      return;
    }

    // Prevenir múltiples eliminaciones simultáneas
    if (isDeleting) {
      console.warn('Ya hay una eliminación en proceso');
      return;
    }

    // Validar que el botón existe
    if (!confirmDeleteBtn) {
      console.error('El botón de confirmación no está disponible');
      showErrorNotification('Error: No se puede procesar la eliminación');
      return;
    }

    // Validar que el usuario esté autenticado
    const currentUser = getCurrentUser();
    if (!currentUser) {
      closeDeleteModalFunc();
      showErrorNotification('Debes iniciar sesión para eliminar un viaje');
      return;
    }

    // Doble verificación de permisos
    if (String(currentDeleteTrip.driverId) !== String(currentUser.id) && 
        String(currentDeleteTrip.creatorId) !== String(currentUser.id)) {
      closeDeleteModalFunc();
      showErrorNotification('No tienes permiso para eliminar este viaje. Solo el creador puede eliminarlo.');
      return;
    }

    // Doble verificación: si el viaje está cancelado
    if (currentDeleteTrip.status === 'cancelled' || currentDeleteTrip.cancelled === true) {
      closeDeleteModalFunc();
      showErrorNotification('Este viaje ya ha sido cancelado');
      return;
    }

    // Doble verificación: si el viaje está en curso
    if (isTripInProgress(currentDeleteTrip)) {
      closeDeleteModalFunc();
      showErrorNotification('No se puede eliminar un viaje que ya está en curso');
      return;
    }

    // Validar que el ID del viaje sea válido
    if (!currentDeleteTrip.id) {
      closeDeleteModalFunc();
      showErrorNotification('Error: El viaje no tiene un identificador válido');
      return;
    }

    // Marcar que se está eliminando
    isDeleting = true;

    // Deshabilitar botón y mostrar estado de carga
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.setAttribute('aria-busy', 'true');
    
    // Usar textContent para el texto y crear elementos de forma segura
    const loadingIcon = document.createElement('span');
    loadingIcon.className = 'btn-icon material-icons';
    loadingIcon.textContent = 'hourglass_empty';
    const loadingText = document.createTextNode(' Eliminando...');
    
    // Limpiar contenido previo y agregar nuevo contenido
    confirmDeleteBtn.innerHTML = '';
    confirmDeleteBtn.appendChild(loadingIcon);
    confirmDeleteBtn.appendChild(loadingText);

    // Deshabilitar botón de cancelar durante la eliminación
    if (cancelDeleteBtn) {
      cancelDeleteBtn.disabled = true;
    }

    try {
      console.log('Iniciando eliminación del viaje:', currentDeleteTrip.id);
      
      // Eliminar viaje
      console.log('Paso 1: Eliminando viaje...');
      await deleteTrip(currentDeleteTrip.id);
      console.log('Paso 1 completado: Viaje eliminado');
      
      // Liberar reservas de pasajeros
      console.log('Paso 2: Liberando reservas...');
      await releasePassengerReservations(currentDeleteTrip);
      console.log('Paso 2 completado: Reservas liberadas');
      
      // Notificar a pasajeros
      console.log('Paso 3: Notificando pasajeros...');
      await notifyPassengers(currentDeleteTrip);
      console.log('Paso 3 completado: Pasajeros notificados');
      
      // Mostrar notificación de éxito
      const passengerCount = currentDeleteTrip.passengers && currentDeleteTrip.passengers.length > 0 
        ? currentDeleteTrip.passengers.length 
        : 0;
      
      const successMessage = passengerCount > 0
        ? `¡Viaje eliminado exitosamente! Se notificó a ${passengerCount} pasajero${passengerCount > 1 ? 's' : ''}.`
        : '¡Viaje eliminado exitosamente!';
      
      showSuccessNotification(successMessage);

      // Cerrar modal (forzar cierre aún si la bandera sigue activa)
      closeDeleteModalFunc(true);

      // Recargar viajes después de un breve delay para permitir que la UI se actualice
      setTimeout(() => {
        loadTrips();
      }, 500);

    } catch (error) {
      console.error('Error deleting trip:', error);
      console.error('Error stack:', error.stack);
      
      // Mostrar mensaje de error específico
      const errorMessage = error.message || 'Hubo un error al eliminar el viaje. Por favor, intenta nuevamente.';
      showErrorNotification(errorMessage);
      
      // Rehabilitar botón y restaurar estado
      resetDeleteButton();
    } finally {
      // Asegurar que se resetee el estado incluso si hay un error
      console.log('Finalizando proceso de eliminación, reseteando estado...');
      isDeleting = false;
      if (cancelDeleteBtn) {
        cancelDeleteBtn.disabled = false;
      }
    }
  }

  // Función auxiliar para resetear el botón de eliminar
  function resetDeleteButton() {
    if (!confirmDeleteBtn) return;
    
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.removeAttribute('aria-busy');
    
    // Restaurar contenido del botón
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'btn-icon material-icons';
    deleteIcon.textContent = 'delete';
    const deleteText = document.createTextNode(' Eliminar Viaje');
    
    confirmDeleteBtn.innerHTML = '';
    confirmDeleteBtn.appendChild(deleteIcon);
    confirmDeleteBtn.appendChild(deleteText);
  }

  async function deleteTrip(tripId) {
    console.log('[deleteTrip] Iniciando, tripId:', tripId);
    
    // Validar que el tripId sea válido
    if (!tripId) {
      console.error('[deleteTrip] tripId no válido');
      throw new Error('El ID del viaje no es válido');
    }

    return new Promise((resolve, reject) => {
      console.log('[deleteTrip] Promise creada');
      
      // Timeout de seguridad para evitar que se quede colgado
      const timeoutId = setTimeout(() => {
        console.error('[deleteTrip] TIMEOUT - operación tardó más de 5 segundos');
        reject(new Error('La operación está tardando demasiado. Por favor, intenta nuevamente.'));
      }, 5000); // 5 segundos máximo

      // Simular delay de API
      setTimeout(() => {
        console.log('[deleteTrip] Ejecutando lógica de eliminación');
        try {
          // Obtener viajes del almacenamiento
          const tripsData = localStorage.getItem('trips');
          console.log('[deleteTrip] Trips data obtenido:', tripsData ? 'existe' : 'no existe');
          
          if (!tripsData) {
            clearTimeout(timeoutId);
            console.error('[deleteTrip] No hay datos de viajes');
            reject(new Error('No se encontraron viajes en el sistema'));
            return;
          }

          let trips;
          try {
            trips = JSON.parse(tripsData);
            console.log('[deleteTrip] Trips parseados, cantidad:', trips.length);
          } catch (parseError) {
            clearTimeout(timeoutId);
            console.error('[deleteTrip] Error parsing trips:', parseError);
            reject(new Error('Error al leer los datos de viajes'));
            return;
          }

          // Validar que trips sea un array
          if (!Array.isArray(trips)) {
            clearTimeout(timeoutId);
            console.error('[deleteTrip] Trips no es un array');
            reject(new Error('Los datos de viajes no tienen un formato válido'));
            return;
          }

          // Buscar el viaje
          const tripIndex = trips.findIndex(t => String(t.id) === String(tripId));
          console.log('[deleteTrip] TripIndex encontrado:', tripIndex);

          if (tripIndex === -1) {
            clearTimeout(timeoutId);
            console.error('[deleteTrip] Viaje no encontrado en el array');
            reject(new Error('El viaje no fue encontrado'));
            return;
          }

          // Eliminar viaje del array
          trips.splice(tripIndex, 1);
          console.log('[deleteTrip] Viaje eliminado del array, cantidad restante:', trips.length);
          
          // Guardar cambios en localStorage
          try {
            localStorage.setItem('trips', JSON.stringify(trips));
            console.log('[deleteTrip] Cambios guardados en localStorage');
            clearTimeout(timeoutId);
            console.log('[deleteTrip] ÉXITO - Viaje eliminado correctamente');
            resolve({ success: true, tripId: tripId });
          } catch (storageError) {
            clearTimeout(timeoutId);
            console.error('[deleteTrip] Error guardando en localStorage:', storageError);
            reject(new Error('Error al guardar los cambios'));
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('[deleteTrip] Error general:', error);
          reject(error);
        }
      }, 300);
    });
  }

  async function releasePassengerReservations(trip) {
    console.log('[releaseReservations] Iniciando');
    
    return new Promise((resolve) => {
      // Timeout de seguridad
      const timeoutId = setTimeout(() => {
        console.warn('[releaseReservations] TIMEOUT - continuando...');
        resolve({ success: true }); // Continuar incluso con timeout
      }, 3000);

      setTimeout(() => {
        try {
          if (!trip || !trip.passengers || trip.passengers.length === 0) {
            clearTimeout(timeoutId);
            console.log('[releaseReservations] No hay pasajeros, saltando');
            resolve({ success: true });
            return;
          }

          console.log('[releaseReservations] Procesando', trip.passengers.length, 'pasajeros');

          // Obtener reservas del storage
          const reservationsData = localStorage.getItem('reservations') || '[]';
          let reservations;
          
          try {
            reservations = JSON.parse(reservationsData);
          } catch (parseError) {
            clearTimeout(timeoutId);
            console.error('[releaseReservations] Error parsing:', parseError);
            resolve({ success: true }); // Continuar incluso si hay error
            return;
          }

          if (!Array.isArray(reservations)) {
            clearTimeout(timeoutId);
            console.warn('[releaseReservations] No es array válido');
            resolve({ success: true });
            return;
          }
          
          // Eliminar reservas relacionadas con este viaje
          const beforeCount = reservations.length;
          const updatedReservations = reservations.filter(res => 
            String(res.tripId) !== String(trip.id)
          );
          const afterCount = updatedReservations.length;
          console.log('[releaseReservations] Reservas eliminadas:', beforeCount - afterCount);

          try {
            localStorage.setItem('reservations', JSON.stringify(updatedReservations));
            clearTimeout(timeoutId);
            console.log('[releaseReservations] ÉXITO');
            resolve({ success: true });
          } catch (storageError) {
            clearTimeout(timeoutId);
            console.error('[releaseReservations] Error saving:', storageError);
            resolve({ success: true }); // Continuar incluso si hay error
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('[releaseReservations] Error general:', error);
          resolve({ success: true }); // Continuar incluso si hay error
        }
      }, 100);
    });
  }

  async function notifyPassengers(trip) {
    console.log('[notifyPassengers] Iniciando');
    
    return new Promise((resolve) => {
      // Timeout de seguridad
      const timeoutId = setTimeout(() => {
        console.warn('[notifyPassengers] TIMEOUT - continuando...');
        resolve({ success: true }); // Continuar incluso con timeout
      }, 3000);

      setTimeout(() => {
        try {
          if (!trip || !trip.passengers || trip.passengers.length === 0) {
            clearTimeout(timeoutId);
            console.log('[notifyPassengers] No hay pasajeros, saltando');
            resolve({ success: true });
            return;
          }

          console.log('[notifyPassengers] Notificando a', trip.passengers.length, 'pasajeros');

          // Obtener notificaciones del storage
          const notificationsData = localStorage.getItem('notifications') || '[]';
          let notifications;
          
          try {
            notifications = JSON.parse(notificationsData);
          } catch (parseError) {
            clearTimeout(timeoutId);
            console.error('[notifyPassengers] Error parsing:', parseError);
            resolve({ success: true }); // Continuar incluso si hay error
            return;
          }

          if (!Array.isArray(notifications)) {
            notifications = [];
          }

          // Crear notificación para cada pasajero
          trip.passengers.forEach(passengerId => {
            try {
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
                message: `El conductor ha eliminado el viaje de ${trip.origin || 'origen desconocido'} a ${trip.destination || 'destino desconocido'} del ${dateStr}. Tus asientos han sido liberados automáticamente.`,
                tripId: trip.id,
                read: false,
                createdAt: new Date().toISOString()
              });
            } catch (passengerError) {
              console.error('[notifyPassengers] Error creando notificación:', passengerId, passengerError);
            }
          });

          try {
            localStorage.setItem('notifications', JSON.stringify(notifications));
            clearTimeout(timeoutId);
            console.log('[notifyPassengers] ÉXITO - Notificaciones guardadas');
            resolve({ success: true });
          } catch (storageError) {
            clearTimeout(timeoutId);
            console.error('[notifyPassengers] Error saving:', storageError);
            resolve({ success: true }); // Continuar incluso si hay error
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('[notifyPassengers] Error general:', error);
          resolve({ success: true }); // Continuar incluso si hay error
        }
      }, 100);
    });
  }

  function openDeleteModal() {
    // Validar que el modal existe
    if (!deleteModal) {
      console.error('El modal de eliminación no está disponible');
      showErrorNotification('Error: No se puede abrir el modal de confirmación');
      return;
    }

    // Validar que no se esté eliminando actualmente
    if (isDeleting) {
      return;
    }

    // Mostrar modal
    deleteModal.style.display = 'flex';
    deleteModal.setAttribute('aria-hidden', 'false');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';

    // Focus trap: enfocar el botón de cancelar primero (más seguro)
    if (cancelDeleteBtn) {
      setTimeout(() => {
        cancelDeleteBtn.focus();
      }, 100);
    }

    // Agregar clase para animación si es necesario
    requestAnimationFrame(() => {
      deleteModal.classList.add('modal--open');
    });
  }

  function closeDeleteModalFunc(forceClose = false) {
    // Validar que el modal existe
    if (!deleteModal) {
      return;
    }

    // No permitir cerrar si se está eliminando
    if (isDeleting && !forceClose) {
      return;
    }

    // Ocultar modal
    deleteModal.style.display = 'none';
    deleteModal.setAttribute('aria-hidden', 'true');
    deleteModal.classList.remove('modal--open');
    
    // Restaurar scroll del body
    document.body.style.overflow = '';

    // Limpiar referencia del viaje
    currentDeleteTrip = null;

    // Resetear botón de confirmación
    resetDeleteButton();

    // Asegurar que el botón de cancelar esté habilitado
    if (cancelDeleteBtn) {
      cancelDeleteBtn.disabled = false;
    }
  }

  function showSuccessNotification(message) {
    // Validar que el mensaje sea válido
    if (!message || typeof message !== 'string') {
      console.warn('Mensaje de notificación no válido');
      return;
    }

    // Validar que el body existe
    if (!document.body) {
      console.error('El body del documento no está disponible');
      return;
    }

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');

    // Crear contenido de forma segura
    const content = document.createElement('div');
    content.className = 'notification-content';

    const icon = document.createElement('span');
    icon.className = 'notification-icon material-icons';
    icon.textContent = 'check';
    icon.setAttribute('aria-hidden', 'true');

    const messageSpan = document.createElement('span');
    messageSpan.className = 'notification-message';
    messageSpan.textContent = message;

    content.appendChild(icon);
    content.appendChild(messageSpan);
    notification.appendChild(content);

    // Agregar al DOM
    document.body.appendChild(notification);

    // Animar entrada
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }

  function showErrorNotification(message) {
    // Validar que el mensaje sea válido
    if (!message || typeof message !== 'string') {
      console.warn('Mensaje de notificación de error no válido');
      message = 'Ha ocurrido un error inesperado';
    }

    // Validar que el body existe
    if (!document.body) {
      console.error('El body del documento no está disponible');
      return;
    }

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');

    // Crear contenido de forma segura
    const content = document.createElement('div');
    content.className = 'notification-content';

    const icon = document.createElement('span');
    icon.className = 'notification-icon material-icons';
    icon.textContent = 'error';
    icon.setAttribute('aria-hidden', 'true');

    const messageSpan = document.createElement('span');
    messageSpan.className = 'notification-message';
    messageSpan.textContent = message;

    content.appendChild(icon);
    content.appendChild(messageSpan);
    notification.appendChild(content);

    // Agregar al DOM
    document.body.appendChild(notification);

    // Animar entrada
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
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


