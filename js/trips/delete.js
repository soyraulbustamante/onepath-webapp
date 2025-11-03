// Delete Trip functionality
(function() {
  'use strict';

  // DOM elements
  const tripsListContent = document.getElementById('tripsListContent');
  const tripsContent = document.getElementById('tripsContent');
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const deleteModal = document.getElementById('deleteModal');
  const deleteModalMessage = document.getElementById('deleteModalMessage');
  const deleteConsequences = document.getElementById('deleteConsequences');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const closeDeleteModal = document.getElementById('closeDeleteModal');
  
  // Tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  const upcomingBadge = document.getElementById('upcomingBadge');
  const historyBadge = document.getElementById('historyBadge');
  const cancelledBadge = document.getElementById('cancelledBadge');
  
  // Badges
  const activeTripsCount = document.getElementById('activeTripsCount');
  const completedTripsCount = document.getElementById('completedTripsCount');
  
  // Statistics
  const totalTripsStat = document.getElementById('totalTripsStat');
  const totalPassengersStat = document.getElementById('totalPassengersStat');
  const avgRatingStat = document.getElementById('avgRatingStat');
  const totalEarningsStat = document.getElementById('totalEarningsStat');

  // State
  let currentDeleteTripId = null;
  let currentDeleteTrip = null;
  let allTrips = [];
  let currentTab = 'upcoming';

  // Error messages
  const errorMessages = {
    notFound: 'El viaje no fue encontrado',
    notCreator: 'No tienes permiso para eliminar este viaje. Solo el creador puede eliminarlo.',
    tripStarted: 'No se puede eliminar un viaje que ya está en curso',
    loadError: 'Hubo un error al cargar tus viajes',
    deleteError: 'Hubo un error al eliminar el viaje. Por favor, intenta nuevamente.'
  };

  // Initialize
  function init() {
    // Load driver's trips
    loadDriverTrips();

    // Tab event listeners
    tabButtons.forEach(button => {
      button.addEventListener('click', () => handleTabChange(button.dataset.tab));
    });

    // Modal event listeners
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    }

    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', closeModal);
    }

    if (closeDeleteModal) {
      closeDeleteModal.addEventListener('click', closeModal);
    }

    // Close modal on overlay click
    if (deleteModal) {
      const overlay = deleteModal.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', closeModal);
      }
    }

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deleteModal && deleteModal.style.display !== 'none') {
        closeModal();
      }
    });
  }

  // Handle tab change
  function handleTabChange(tab) {
    currentTab = tab;
    
    // Update active tab
    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });

    // Filter and render trips
    filterAndRenderTrips();
  }

  // Filter trips by current tab
  function filterAndRenderTrips() {
    const now = new Date();
    let filteredTrips = [];

    switch (currentTab) {
      case 'upcoming':
        filteredTrips = allTrips.filter(trip => {
          if (!trip.date || !trip.time) return false;
          const tripDateTime = new Date(trip.date + 'T' + trip.time);
          return tripDateTime > now && !trip.cancelled;
        });
        break;
      case 'history':
        filteredTrips = allTrips.filter(trip => {
          if (!trip.date || !trip.time) return false;
          const tripDateTime = new Date(trip.date + 'T' + trip.time);
          return tripDateTime <= now && !trip.cancelled;
        });
        break;
      case 'cancelled':
        filteredTrips = allTrips.filter(trip => trip.cancelled === true);
        break;
    }

    if (filteredTrips.length === 0) {
      showEmptyState();
      if (tripsListContent) tripsListContent.innerHTML = '';
    } else {
      hideEmptyState();
      renderTrips(filteredTrips);
    }
  }

  // Get current user
  function getCurrentUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
    return null;
  }

  // Load driver's trips
  async function loadDriverTrips() {
    showLoading();

    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        throw new Error('Debes iniciar sesión para ver tus viajes');
      }

      // Get trips from storage (simulating API call)
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      
      // Filter trips by driver/creator
      const driverTrips = trips.filter(trip => 
        trip.driverId === currentUser.id || 
        trip.creatorId === currentUser.id
      );

      // Sort by date (upcoming first)
      driverTrips.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
        const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
        return dateA - dateB;
      });

      allTrips = driverTrips;
      hideLoading();

      if (driverTrips.length === 0) {
        showEmptyState();
        if (tripsContent) tripsContent.style.display = 'none';
      } else {
        showTripsContent();
        updateStatistics();
        updateBadges();
        filterAndRenderTrips();
      }

    } catch (error) {
      console.error('Error loading trips:', error);
      hideLoading();
      showErrorNotification(error.message || errorMessages.loadError);
      showEmptyState();
    }
  }

  // Render trips
  function renderTrips(trips) {
    if (!tripsListContent) return;

    tripsListContent.innerHTML = '';

    trips.forEach(trip => {
      const tripCard = createTripCard(trip);
      tripsListContent.appendChild(tripCard);
    });
  }

  // Update statistics
  function updateStatistics() {
    const now = new Date();
    const completedTrips = allTrips.filter(trip => {
      if (!trip.date || !trip.time) return false;
      const tripDateTime = new Date(trip.date + 'T' + trip.time);
      return tripDateTime <= now;
    });

    let totalPassengers = 0;
    let totalEarnings = 0;
    let ratingsSum = 0;
    let ratingsCount = 0;

    allTrips.forEach(trip => {
      if (trip.passengers && trip.passengers.length > 0) {
        totalPassengers += trip.passengers.length;
      }
      if (trip.price && trip.passengers) {
        totalEarnings += parseFloat(trip.price) * (trip.passengers.length || 0);
      }
      // Assuming rating data structure
      if (trip.rating) {
        ratingsSum += parseFloat(trip.rating);
        ratingsCount++;
      }
    });

    if (totalTripsStat) totalTripsStat.textContent = allTrips.length;
    if (totalPassengersStat) totalPassengersStat.textContent = totalPassengers;
    if (avgRatingStat) {
      avgRatingStat.textContent = ratingsCount > 0 
        ? parseFloat(ratingsSum / ratingsCount).toFixed(1) + ' ⭐'
        : '-';
    }
    if (totalEarningsStat) totalEarningsStat.textContent = `S/${totalEarnings.toFixed(2)}`;
  }

  // Update badges
  function updateBadges() {
    const now = new Date();
    const activeTrips = allTrips.filter(trip => {
      if (!trip.date || !trip.time || trip.cancelled) return false;
      const tripDateTime = new Date(trip.date + 'T' + trip.time);
      return tripDateTime > now;
    });
    const completedTrips = allTrips.filter(trip => {
      if (!trip.date || !trip.time || trip.cancelled) return false;
      const tripDateTime = new Date(trip.date + 'T' + trip.time);
      return tripDateTime <= now;
    });
    const cancelledTrips = allTrips.filter(trip => trip.cancelled === true);

    if (activeTripsCount) activeTripsCount.textContent = activeTrips.length;
    if (completedTripsCount) completedTripsCount.textContent = completedTrips.length;
    if (upcomingBadge) upcomingBadge.textContent = activeTrips.length;
    if (historyBadge) historyBadge.textContent = completedTrips.length;
    if (cancelledBadge) cancelledBadge.textContent = cancelledTrips.length;
  }

  // Create trip card
  function createTripCard(trip) {
    const card = document.createElement('article');
    card.className = 'trip-card trip-card--driver';
    card.setAttribute('data-trip-id', trip.id);

    const isStarted = isTripStarted(trip);
    const hasPassengers = trip.passengers && trip.passengers.length > 0;
    const availableSeats = (trip.seats || 0) - (trip.reservedSeats || hasPassengers ? (trip.passengers?.length || 0) : 0);
    const tripDateTime = trip.date && trip.time ? new Date(trip.date + 'T' + trip.time) : null;
    const dateFormatted = tripDateTime ? tripDateTime.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Fecha no especificada';
    const timeFormatted = trip.time || 'Hora no especificada';

    let statusBadge = '';
    if (trip.cancelled) {
      statusBadge = '<span class="status-chip status-chip--cancelled">Cancelado</span>';
    } else if (isStarted) {
      statusBadge = '<span class="trip-status-badge trip-status-badge--started">En Curso</span>';
    } else if (tripDateTime && tripDateTime < new Date()) {
      statusBadge = '<span class="status-chip status-chip--completed">Completado</span>';
    } else {
      statusBadge = hasPassengers
        ? '<span class="status-chip status-chip--confirmed">Confirmado</span>'
        : '<span class="status-chip status-chip--pending">Pendiente</span>';
    }

    // Format trip ID
    const tripIdFormatted = `#VJ-${trip.id ? trip.id.toString().padStart(6, '0') : '000000'}`;
    
    // Calculate days until trip
    let daysUntilTrip = '';
    if (tripDateTime && !isStarted) {
      const diffTime = tripDateTime - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        daysUntilTrip = diffDays === 1 ? 'Falta 1 día' : `Faltan ${diffDays} días`;
      } else {
        daysUntilTrip = 'Hoy';
      }
    }

    card.innerHTML = `
      <div class="trip-card-header trip-card-header--driver">
        <div class="trip-status-header">
          ${statusBadge}
          <span class="trip-id">ID: ${tripIdFormatted}</span>
        </div>
        <div>
          <button class="btn-compact">Contactar</button>
        </div>
      </div>
      <div class="trip-route">
        <div class="route-point departure">
          <span class="route-dot green"></span>
          <div class="route-details">
            <span class="route-time">${timeFormatted}</span>
            <span class="route-location">${trip.origin || 'Origen no especificado'}</span>
            ${trip.originAddress ? `<span class="route-address">${trip.originAddress}</span>` : ''}
          </div>
        </div>
        <div class="route-line"></div>
        <div class="route-point arrival">
          <span class="route-dot red"></span>
          <div class="route-details">
            <span class="route-location">${trip.destination || 'Destino no especificado'}</span>
            ${trip.destinationAddress ? `<span class="route-address">${trip.destinationAddress}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="trip-info-section">
        ${hasPassengers ? `
          <div class="trip-passengers-info">
            <span class="passengers-count">${trip.passengers.length} pasajero${trip.passengers.length > 1 ? 's' : ''} reservado${trip.passengers.length > 1 ? 's' : ''}</span>
          </div>
        ` : ''}
        ${daysUntilTrip ? `<div class="trip-time-info"><span>${daysUntilTrip}</span></div>` : ''}
      </div>
      <div class="trip-details">
        <div class="trip-meta">
          <span class="trip-seats">💺 ${availableSeats} de ${trip.seats || 0} asientos disponibles</span>
          ${trip.vehicle ? `<span class="trip-vehicle">🚗 ${trip.vehicle}</span>` : ''}
        </div>
      </div>
      <div class="trip-actions trip-actions--driver">
        <a href="../trips/edit.html?id=${trip.id}" class="btn-secondary btn-small ${isStarted ? 'disabled' : ''}" ${isStarted ? 'onclick="return false;" title="No se puede editar un viaje en curso"' : ''}>
          <span class="btn-icon">✏️</span>
          Editar
        </a>
        <button type="button" class="btn-danger btn-small btn-delete-trip ${isStarted ? 'disabled' : ''}" data-trip-id="${trip.id}" ${isStarted ? 'disabled title="No se puede eliminar un viaje en curso"' : ''}>
          <span class="btn-icon">🗑️</span>
          Eliminar
        </button>
      </div>
      <div class="inline-actions">
        <a href="#" class="link-danger" ${isStarted ? 'aria-disabled="true"' : ''}>Cancelar</a>
        <a href="#" class="link-muted">Ver Detalles</a>
      </div>
    `;

    // Add event listener to delete button
    const deleteBtn = card.querySelector('.btn-delete-trip');
    if (deleteBtn && !isStarted) {
      deleteBtn.addEventListener('click', () => handleDeleteClick(trip));
    }

    return card;
  }

  // Check if trip has started
  function isTripStarted(trip) {
    if (!trip.date || !trip.time) return false;

    const tripDateTime = new Date(trip.date + 'T' + trip.time);
    const now = new Date();

    return tripDateTime <= now;
  }

  // Handle delete button click
  function handleDeleteClick(trip) {
    currentDeleteTripId = trip.id;
    currentDeleteTrip = trip;

    const isStarted = isTripStarted(trip);
    const hasPassengers = trip.passengers && trip.passengers.length > 0;

    if (isStarted) {
      showErrorNotification('No se puede eliminar un viaje que ya está en curso');
      return;
    }

    // Set modal message
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

    openModal();
  }

  // Handle confirm delete
  async function handleConfirmDelete() {
    if (!currentDeleteTripId || !currentDeleteTrip) return;

    // Double-check if trip has started
    if (isTripStarted(currentDeleteTrip)) {
      closeModal();
      showErrorNotification('No se puede eliminar un viaje que ya está en curso');
      return;
    }

    // Disable button
    if (confirmDeleteBtn) {
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.innerHTML = '<span class="btn-icon">⏳</span> Eliminando...';
    }

    try {
      // Delete trip
      await deleteTrip(currentDeleteTripId);
      
      // Notify passengers
      await notifyPassengers(currentDeleteTrip);
      
      // Show success notification
      showSuccessNotification('¡Viaje eliminado exitosamente! Los pasajeros han sido notificados.');

      // Close modal
      closeModal();

      // Reload trips
      setTimeout(() => {
        loadDriverTrips();
      }, 500);
      
      // Update statistics and badges after deletion
      updateStatistics();
      updateBadges();

    } catch (error) {
      console.error('Error deleting trip:', error);
      showErrorNotification(error.message || errorMessages.deleteError);
      
      // Re-enable button
      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = '<span class="btn-icon">🗑️</span> Eliminar Viaje';
      }
    }
  }

  // Delete trip (API call simulation)
  async function deleteTrip(tripId) {
    // TODO: Replace with actual API endpoint
    // const response = await fetch(`/api/trips/${tripId}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to delete trip');
    // }
    // 
    // return await response.json();

    // Simulate API call and update local storage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const trips = JSON.parse(localStorage.getItem('trips') || '[]');
          const tripIndex = trips.findIndex(t => t.id === tripId || t.id === parseInt(tripId, 10));

          if (tripIndex === -1) {
            reject(new Error(errorMessages.notFound));
            return;
          }

          const trip = trips[tripIndex];
          const currentUser = getCurrentUser();

          // Verify user is the creator
          if (trip.driverId !== currentUser.id && trip.creatorId !== currentUser.id) {
            reject(new Error(errorMessages.notCreator));
            return;
          }

          // Check if trip has started
          if (isTripStarted(trip)) {
            reject(new Error(errorMessages.tripStarted));
            return;
          }

          // Remove trip from array
          trips.splice(tripIndex, 1);
          localStorage.setItem('trips', JSON.stringify(trips));

          console.log('Trip deleted:', tripId);
          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  // Notify passengers about trip deletion
  async function notifyPassengers(trip) {
    // TODO: Replace with actual API endpoint
    // const response = await fetch(`/api/trips/${trip.id}/notify-deletion`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to notify passengers');
    // }
    // 
    // return await response.json();

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!trip.passengers || trip.passengers.length === 0) {
          resolve({ success: true });
          return;
        }

        // Get notifications from storage
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

        // Create notification for each passenger
        trip.passengers.forEach(passengerId => {
          notifications.push({
            id: Date.now() + Math.random(),
            userId: passengerId,
            type: 'trip_deleted',
            title: 'Viaje Eliminado',
            message: `El conductor ha eliminado el viaje de ${trip.origin} a ${trip.destination} del ${trip.date}. Tus asientos han sido liberados.`,
            tripId: trip.id,
            read: false,
            createdAt: new Date().toISOString()
          });
        });

        localStorage.setItem('notifications', JSON.stringify(notifications));
        console.log('Passengers notified about deletion:', trip.passengers.length);

        resolve({ success: true });
      }, 300);
    });
  }

  // Open modal
  function openModal() {
    if (deleteModal) {
      deleteModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      if (confirmDeleteBtn) {
        setTimeout(() => confirmDeleteBtn.focus(), 100);
      }
    }
  }

  // Close modal
  function closeModal() {
    if (deleteModal) {
      deleteModal.style.display = 'none';
      document.body.style.overflow = '';
      currentDeleteTripId = null;
      currentDeleteTrip = null;

      // Reset button
      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = '<span class="btn-icon">🗑️</span> Eliminar Viaje';
      }
    }
  }

  // Show loading state
  function showLoading() {
    if (loadingState) loadingState.style.display = 'block';
    if (tripsList) tripsList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
  }

  // Hide loading state
  function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
  }

  // Show empty state
  function showEmptyState() {
    if (emptyState) emptyState.style.display = 'block';
    if (tripsListContent) tripsListContent.innerHTML = '';
  }

  // Hide empty state
  function hideEmptyState() {
    if (emptyState) emptyState.style.display = 'none';
  }

  // Show trips content
  function showTripsContent() {
    if (tripsContent) tripsContent.style.display = 'grid';
  }

  // Show success notification
  function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✓</span>
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

  // Show error notification
  function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✕</span>
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

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

