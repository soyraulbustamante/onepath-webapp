// My Reservations Page - Manejo de reservas como pasajero
(function() {
  'use strict';

  // Estado
  let currentTab = 'upcoming';
  let allReservations = [];
  let currentCancelReservation = null;

  // DOM elements
  const loadingState = document.getElementById('loadingState');
  const tripsContent = document.getElementById('tripsContent');
  const emptyState = document.getElementById('emptyState');
  const reservationsListContent = document.getElementById('reservationsListContent');
  const tabButtons = document.querySelectorAll('.reservation-tab');
  const upcomingBadge = document.getElementById('upcomingBadge');
  const historyBadge = document.getElementById('historyBadge');
  const cancelledBadge = document.getElementById('cancelledBadge');
  const activeTripsCount = document.getElementById('activeTripsCount');
  const completedTripsCount = document.getElementById('completedTripsCount');
  
  // Stats
  const totalTripsStat = document.getElementById('totalTripsStat');
  const moneySavedStat = document.getElementById('moneySavedStat');
  const avgRatingStat = document.getElementById('avgRatingStat');
  const co2SavedStat = document.getElementById('co2SavedStat');
  const recentActivity = document.getElementById('recentActivity');

  // Modal elements
  const cancelModal = document.getElementById('cancelModal');
  const closeCancelModal = document.getElementById('closeCancelModal');
  const cancelCancelBtn = document.getElementById('cancelCancelBtn');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');
  const cancelModalMessage = document.getElementById('cancelModalMessage');

  // Initialize
  function init() {
    setupEventListeners();
    loadReservations();
  }

  function setupEventListeners() {
    // Tab buttons
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Modal listeners
    if (closeCancelModal) {
      closeCancelModal.addEventListener('click', closeCancelModalFunc);
    }
    if (cancelCancelBtn) {
      cancelCancelBtn.addEventListener('click', closeCancelModalFunc);
    }
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', handleConfirmCancel);
    }
    if (cancelModal && cancelModal.querySelector('.modal-overlay')) {
      cancelModal.querySelector('.modal-overlay').addEventListener('click', closeCancelModalFunc);
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

  // Load reservations
  function loadReservations() {
    showLoading();
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes iniciar sesión para ver tus reservas');
      }

      // Get all trips and reservations
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      const reservationsData = JSON.parse(localStorage.getItem('reservations') || '[]');
      
      // Build reservations list
      const reservations = [];
      
      // Get reservations from reservations storage
      reservationsData.forEach(reservationData => {
        if (reservationData.passengerId === currentUser.id) {
          const trip = trips.find(t => t.id === reservationData.tripId);
          if (trip) {
            reservations.push({
              trip: trip,
              reservationId: reservationData.id || `res-${trip.id}-${currentUser.id}`,
              status: reservationData.status || 'pending',
              createdAt: reservationData.createdAt || new Date().toISOString(),
              price: reservationData.price || trip.price
            });
          }
        }
      });
      
      // Also check trips where user is in passengers array (for backward compatibility)
      trips.forEach(trip => {
        if (trip.passengers && trip.passengers.includes(currentUser.id)) {
          // Check if already added
          const exists = reservations.some(r => r.trip.id === trip.id);
          if (!exists) {
            reservations.push({
              trip: trip,
              reservationId: `res-${trip.id}-${currentUser.id}`,
              status: 'confirmed',
              createdAt: trip.createdAt || new Date().toISOString(),
              price: trip.price
            });
          }
        }
      });

      allReservations = reservations;
      hideLoading();
      showContent();
      updateBadges();
      filterAndRenderReservations();
      updateStats();
      updateRecentActivity();
    } catch (error) {
      console.error('Error loading reservations:', error);
      hideLoading();
      showError(error.message);
    }
  }

  // Switch tab
  function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab
    tabButtons.forEach(button => {
      const buttonTab = button.getAttribute('data-tab');
      if (buttonTab === tab) {
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
      } else {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      }
    });

    filterAndRenderReservations();
  }

  // Filter and render reservations
  function filterAndRenderReservations() {
    const now = new Date();
    let filteredReservations = [];

    switch (currentTab) {
      case 'upcoming':
        filteredReservations = allReservations.filter(res => {
          if (!res.trip.date || !res.trip.time) return false;
          const tripDateTime = new Date(res.trip.date + 'T' + res.trip.time);
          return tripDateTime > now && res.status !== 'cancelled';
        });
        break;
      case 'history':
        filteredReservations = allReservations.filter(res => {
          if (!res.trip.date || !res.trip.time) return false;
          const tripDateTime = new Date(res.trip.date + 'T' + res.trip.time);
          return tripDateTime <= now && res.status !== 'cancelled';
        });
        break;
      case 'cancelled':
        filteredReservations = allReservations.filter(res => res.status === 'cancelled');
        break;
    }

    if (filteredReservations.length === 0) {
      showEmptyState();
      if (reservationsListContent) reservationsListContent.innerHTML = '';
    } else {
      hideEmptyState();
      renderReservations(filteredReservations);
    }
  }

  // Render reservations
  function renderReservations(reservations) {
    if (!reservationsListContent) return;

    reservationsListContent.innerHTML = reservations.map(reservation => 
      createReservationCard(reservation)
    ).join('');

    // Inicializa avatares aleatorios para imágenes con clase js-random-avatar
    setRandomAvatars();

    // Add event listeners for cancel buttons
    document.querySelectorAll('.link-cancel').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const reservationId = link.getAttribute('data-reservation-id');
        openCancelModal(reservationId);
      });
    });
  }

  // --- Utilidades de avatar aleatorio (DiceBear v8) ---
  function randomAvatarUrl(size, variant) {
    const seed = Math.random().toString(36).slice(2, 10);
    const sprite = typeof variant === 'string' && variant.length ? variant : 'avataaars';
    const s = parseInt(size || 64, 10);
    return `https://api.dicebear.com/8.x/${sprite}/png?seed=${seed}&size=${s}`;
  }

  function setRandomAvatars() {
    const imgs = document.querySelectorAll('img.js-random-avatar');
    imgs.forEach(img => {
      const fallback = img.getAttribute('src');
      const size = img.dataset.size || '64';
      const variant = img.dataset.variant || 'avataaars';
      const url = randomAvatarUrl(size, variant);
      img.onerror = function() { img.src = fallback; };
      img.src = url;
    });
  }

  // Create reservation card HTML
  function createReservationCard(reservation) {
    const trip = reservation.trip;
    const status = reservation.status;
    const cancelReason = reservation.cancelReason || '';
    
    // Get driver info from trip or default
    const driverName = trip.driverName || 'Carlos M.';
    const driverMajor = trip.driverMajor || 'Ing. Sistemas';
    const driverRating = trip.driverRating || 4.9;
    const vehicle = trip.vehicle || 'Vehiculo';
    
    // Format date and time
    const tripDate = new Date(trip.date + 'T' + trip.time);
    const dateStr = tripDate.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    const timeStr = trip.time.substring(0, 5);
    
    // Calculate days remaining
    const now = new Date();
    const daysDiff = Math.ceil((tripDate - now) / (1000 * 60 * 60 * 24));
    const daysText = daysDiff === 1 ? '1 día' : `${daysDiff} días`;
    
    // Status config
    const statusConfig = {
      confirmed: {
        icon: 'check',
        text: 'Confirmado',
        class: 'reservation-status--confirmed'
      },
      pending: {
        icon: 'hourglass_empty',
        text: 'Pendiente',
        class: 'reservation-status--pending'
      },
      cancelled: {
        icon: 'close',
        text: 'Cancelado',
        class: 'reservation-status--cancelled'
      }
    };
    
    const statusInfo = statusConfig[status] || statusConfig.pending;
    
    // Cost label
    const costLabel = status === 'confirmed' ? 'pagado' : 'por confirmar';
    
    // Get driver initials for avatar
    const driverInitials = driverName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Determine if past
    const isPast = tripDate < now;
    
    return `
      <article class="trip-card">
        <div class="trip-card-header driver-header">
          <div class="driver-avatar"><img class="js-random-avatar" data-size="64" data-variant="avataaars" src="../../assets/images/avatars/default.svg" alt="Avatar de ${driverName}"></div>
          <div class="driver-info">
            <h3>${driverName} <span class="text-muted">- ${driverMajor}</span></h3>
            <div class="driver-meta">
              <span class="rating-stars">${'★'.repeat(Math.round(driverRating))}${'☆'.repeat(5-Math.round(driverRating))}</span>
              <span class="rating-value">${driverRating}</span>
            </div>
            <div class="driver-meta">
              <span class="reservation-status ${statusInfo.class}"><span class="reservation-status-icon material-icons">${statusInfo.icon}</span> ${statusInfo.text}</span>
              <span class="reservation-id">#VJ-${trip.date.replace(/-/g, '')}-${String(trip.id).slice(-3)}</span>
            </div>
          </div>
          <div class="price-box">
            <span class="price-amount">S/ ${trip.price.toFixed(2)}</span>
            <span class="price-unit">${costLabel}</span>
          </div>
        </div>

        <div class="trip-route">
          <div class="route-point departure">
            <span class="route-dot green"></span>
            <div class="route-details">
              <span class="route-time">${timeStr}</span>
              <span class="route-location">${trip.origin}</span>
              ${trip.originAddress ? `<small class="text-muted">${trip.originAddress}</small>` : ''}
            </div>
          </div>
          <div class="route-middle">
            <span class="duration">45 min</span>
            <div class="route-line"></div>
            <span class="car-icon material-icons" aria-hidden="true">directions_car</span>
          </div>
          <div class="route-point arrival">
            <span class="route-dot red"></span>
            <div class="route-details">
              <span class="route-time">${calculateArrivalTime(trip.time, 45)}</span>
              <span class="route-location">${trip.destination}</span>
              ${trip.destinationAddress ? `<small class="text-muted">${trip.destinationAddress}</small>` : ''}
            </div>
          </div>
        </div>

        <div class="trip-details">
          <div class="trip-info">
            <div class="trip-meta-row">
              <span class="trip-duration"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">access_time</span> 45 min</span>
              ${status === 'confirmed' ? `<span class="trip-seats"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">event_seat</span> 1 asiento reservado</span>` : ''}
            </div>
            <span class="trip-vehicle"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">directions_car</span> ${vehicle}</span>
          </div>
          <div class="trip-actions" style="gap: 8px;">
            ${status !== 'cancelled' 
              ? `<a href="#" class="btn btn-secondary link-cancel" data-reservation-id="${reservation.reservationId}">Cancelar reserva</a>`
              : ''
            }
            <a href="../../pages/chat/messages.html" class="btn btn-primary">Ver conversación</a>
          </div>
        </div>

        ${status === 'cancelled' && cancelReason ? `
          <div style="margin-top: 12px; padding: 10px; border: 1px solid var(--gray-100); border-radius: 8px; background: var(--gray-50);">
            <span style="font-size:12px; color: var(--text-light);">Motivo de cancelación:</span>
            <p style="font-size:13px; color: var(--text-dark); margin:4px 0 0 0;">${cancelReason}</p>
          </div>
        ` : ''}
      </article>
    `;
  }

  // Helper functions
  function calculateArrivalTime(departureTime, durationMinutes) {
    const [hours, minutes] = departureTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const arrivalHours = Math.floor(totalMinutes / 60);
    const arrivalMinutes = totalMinutes % 60;
    return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
  }

  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  }

  // Update badges
  function updateBadges() {
    const now = new Date();
    const upcoming = allReservations.filter(res => {
      if (!res.trip.date || !res.trip.time) return false;
      const tripDateTime = new Date(res.trip.date + 'T' + res.trip.time);
      return tripDateTime > now && res.status !== 'cancelled';
    }).length;
    
    const history = allReservations.filter(res => {
      if (!res.trip.date || !res.trip.time) return false;
      const tripDateTime = new Date(res.trip.date + 'T' + res.trip.time);
      return tripDateTime <= now && res.status !== 'cancelled';
    }).length;
    
    const cancelled = allReservations.filter(res => res.status === 'cancelled').length;
    
    if (upcomingBadge) upcomingBadge.textContent = upcoming;
    if (historyBadge) historyBadge.textContent = history;
    if (cancelledBadge) cancelledBadge.textContent = cancelled;
    
    if (activeTripsCount) activeTripsCount.textContent = upcoming;
    if (completedTripsCount) completedTripsCount.textContent = history;
  }

  // Update statistics
  function updateStats() {
    const total = allReservations.length;
    const confirmed = allReservations.filter(res => res.status === 'confirmed' || res.status === 'pending');
    const totalSaved = confirmed.reduce((sum, res) => sum + (res.price || 0), 0);
    
    // Calculate CO2 saved (mock: ~2.5kg per trip)
    const co2Saved = (total * 2.5).toFixed(1);
    
    // Average rating (mock)
    const avgRating = '4.8';
    
    if (totalTripsStat) totalTripsStat.textContent = total;
    if (moneySavedStat) moneySavedStat.textContent = `S/ ${totalSaved.toFixed(0)}`;
    if (avgRatingStat) avgRatingStat.textContent = `${avgRating}`;
    if (co2SavedStat) co2SavedStat.textContent = `${co2Saved} kg`;
  }

  // Update recent activity
  function updateRecentActivity() {
    if (!recentActivity) return;
    
    const recent = allReservations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    if (recent.length === 0) {
      recentActivity.innerHTML = '<p style="color: var(--text-light); font-size: 13px;">No hay actividad reciente</p>';
      return;
    }
    
    recentActivity.innerHTML = recent.map(res => {
      const trip = res.trip;
      const status = res.status;
      const timeAgo = getTimeAgo(res.createdAt);
      
      let icon = 'check';
      let text = '';
      
      if (status === 'confirmed') {
        icon = 'check';
        text = `Viaje completado Con ${trip.driverId || 'Conductor'} • hace ${timeAgo}`;
      } else if (status === 'pending') {
        icon = 'hourglass_empty';
        text = `Solicitud enviada A ${trip.driverId || 'Conductor'} • hace ${timeAgo}`;
      } else {
        icon = 'close';
        text = `Reserva cancelada • hace ${timeAgo}`;
      }
      
      return `
        <div class="activity-item">
          <span class="activity-icon material-icons">${icon}</span>
          <div class="activity-content">
            <p class="activity-text">${text}</p>
            <span class="activity-time">${new Date(res.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Modal functions
  function openCancelModal(reservationId) {
    const reservation = allReservations.find(res => res.reservationId === reservationId);
    if (!reservation) return;
    
    currentCancelReservation = reservation;
    
    const trip = reservation.trip;
    const message = `¿Estás seguro de que deseas cancelar esta reserva para el viaje del ${new Date(trip.date + 'T' + trip.time).toLocaleDateString('es-ES')}?`;
    
    if (cancelModalMessage) cancelModalMessage.textContent = message;
    // Reset motivo de cancelación
    const reasonInput = document.getElementById('cancelReasonInput');
    if (reasonInput) {
      reasonInput.value = '';
    }
    if (cancelModal) cancelModal.style.display = 'flex';
  }

  function closeCancelModalFunc() {
    if (cancelModal) cancelModal.style.display = 'none';
    currentCancelReservation = null;
  }

  function handleConfirmCancel() {
    if (!currentCancelReservation) return;
    
    // Leer motivo (opcional)
    const reasonInput = document.getElementById('cancelReasonInput');
    const cancelReason = reasonInput ? (reasonInput.value || '').trim() : '';

    // Update reservation status
    currentCancelReservation.status = 'cancelled';
    if (cancelReason) {
      currentCancelReservation.cancelReason = cancelReason;
    }
    
    // Update in localStorage (simplified - in real app would update properly)
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const existingRes = reservations.find(r => r.id === currentCancelReservation.reservationId);
    if (existingRes) {
      existingRes.status = 'cancelled';
      if (cancelReason) {
        existingRes.cancelReason = cancelReason;
      }
      localStorage.setItem('reservations', JSON.stringify(reservations));
    }
    
    // Reload
    closeCancelModalFunc();
    loadReservations();
  }

  // UI helpers
  function showLoading() {
    if (loadingState) loadingState.style.display = 'block';
    if (tripsContent) tripsContent.style.display = 'none';
  }

  function hideLoading() {
    if (loadingState) loadingState.style.display = 'none';
  }

  function showContent() {
    if (tripsContent) tripsContent.style.display = 'grid';
  }

  function showEmptyState() {
    if (emptyState) emptyState.style.display = 'block';
  }

  function hideEmptyState() {
    if (emptyState) emptyState.style.display = 'none';
  }

  function showError(message) {
    console.error(message);
    // You can add a notification here
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

