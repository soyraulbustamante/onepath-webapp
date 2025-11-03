// Edit Trip Modal functionality
(function() {
  'use strict';

  // DOM elements
  const editModal = document.getElementById('editTripModal');
  const editForm = document.getElementById('editTripForm');
  const originInput = document.getElementById('editOrigin');
  const destinationInput = document.getElementById('editDestination');
  const dateInput = document.getElementById('editDate');
  const timeInput = document.getElementById('editTime');
  const seatsInput = document.getElementById('editSeats');
  const priceInput = document.getElementById('editPrice');
  const submitBtn = document.getElementById('submitEditBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const closeBtn = document.getElementById('closeEditModal');
  const loadingState = document.getElementById('editModalLoadingState');
  const errorState = document.getElementById('editModalErrorState');
  const formSection = document.getElementById('editModalFormSection');
  const errorMessage = document.getElementById('editModalErrorMessage');

  // Trip data
  let currentTrip = null;
  let tripId = null;

  // Error messages
  const errorMessages = {
    origin: 'El campo Origen es obligatorio',
    destination: 'El campo Destino es obligatorio',
    date: 'La fecha es obligatoria',
    time: 'La hora es obligatoria',
    datePast: 'La fecha no puede ser anterior a hoy',
    dateInvalid: 'Por favor, selecciona una fecha válida',
    tripNotFound: 'El viaje no fue encontrado',
    notCreator: 'No tienes permiso para editar este viaje. Solo el creador puede modificarlo.',
    tripStarted: 'No se puede editar un viaje que ya ha iniciado',
    loadError: 'Hubo un error al cargar la información del viaje'
  };

  // Initialize
  function init() {
    // Event listeners
    if (editForm) {
      editForm.addEventListener('submit', handleFormSubmit);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking overlay
    if (editModal) {
      const overlay = editModal.querySelector('.modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', closeModal);
      }
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && editModal && editModal.style.display !== 'none') {
        closeModal();
      }
    });

    // Real-time validation
    originInput?.addEventListener('blur', () => validateField('origin'));
    destinationInput?.addEventListener('blur', () => validateField('destination'));
    dateInput?.addEventListener('change', () => validateField('date'));
    timeInput?.addEventListener('change', () => validateField('time'));

    // Remove error styling on input
    if (editForm) {
      const inputs = editForm.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) {
            clearFieldError(input);
          }
        });
      });
    }
  }

  // Open modal with trip ID
  function openModal(tripIdParam) {
    tripId = tripIdParam;
    
    if (!editModal) return;

    // Reset form
    resetForm();
    
    // Show modal
    editModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Load trip data
    loadTrip(tripId);
  }

  // Close modal
  function closeModal() {
    if (!editModal) return;

    editModal.style.display = 'none';
    document.body.style.overflow = '';
    resetForm();
    tripId = null;
    currentTrip = null;
  }

  // Reset form
  function resetForm() {
    if (editForm) {
      editForm.reset();
    }
    
    // Clear all error messages
    const errorElements = editForm?.querySelectorAll('.error-message');
    errorElements?.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });

    // Remove error classes
    const inputs = editForm?.querySelectorAll('.error');
    inputs?.forEach(input => {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
    });

    // Hide all states
    showLoading(false);
    showError(false);
    showForm(false);
  }

  // Load trip data
  async function loadTrip(id) {
    showLoading(true);

    try {
      // Get trip from storage (simulating API call)
      const trips = JSON.parse(localStorage.getItem('trips') || '[]');
      const trip = trips.find(t => t.id === id || String(t.id) === String(id));

      if (!trip) {
        throw new Error(errorMessages.tripNotFound);
      }

      // Check if user is the creator (más permisivo para maquetado)
      const currentUser = getCurrentUser();
      
      // Si no hay usuario, usar el conductor de demo para maquetar
      if (!currentUser) {
        // Crear usuario conductor de demo si no existe
        const demoDriver = localStorage.getItem('demoDriver');
        if (demoDriver) {
          const user = JSON.parse(demoDriver);
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          const user = { id: 'driver-001', name: 'Carlos Mendoza', role: 'driver', university: 'UNMSM', major: 'Ing. Sistemas' };
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('demoDriver', JSON.stringify(user));
        }
      }

      // Para maquetado: permitir editar si el trip tiene driverId o si no hay usuario actual
      // (comentado temporalmente para maquetado)
      /*
      if (String(trip.driverId) !== String(currentUser.id) && String(trip.creatorId) !== String(currentUser.id)) {
        throw new Error(errorMessages.notCreator);
      }
      */

      // Para maquetado: permitir editar incluso si el viaje ya inició
      // (comentado temporalmente para maquetado)
      /*
      if (isTripStarted(trip)) {
        throw new Error(errorMessages.tripStarted);
      }
      */

      currentTrip = trip;
      populateForm(trip);
      showLoading(false);
      showForm(true);

    } catch (error) {
      console.error('Error loading trip:', error);
      showLoading(false);
      showError(true, error.message || errorMessages.loadError);
    }
  }

  // Check if trip has started
  function isTripStarted(trip) {
    if (!trip.date || !trip.time) return false;

    const tripDateTime = new Date(trip.date + 'T' + trip.time);
    const now = new Date();

    return tripDateTime <= now;
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

  // Populate form with trip data
  function populateForm(trip) {
    if (originInput) originInput.value = trip.origin || '';
    if (destinationInput) destinationInput.value = trip.destination || '';
    if (dateInput) dateInput.value = trip.date || '';
    if (timeInput) timeInput.value = trip.time || '';
    if (seatsInput) seatsInput.value = trip.seats || '';
    if (priceInput) priceInput.value = trip.price || '';

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.setAttribute('min', today);
    }
  }

  // Show loading state
  function showLoading(show) {
    if (loadingState) loadingState.style.display = show ? 'block' : 'none';
  }

  // Show error state
  function showError(show, message) {
    if (errorState) {
      errorState.style.display = show ? 'block' : 'none';
      if (errorMessage && message) {
        errorMessage.textContent = message;
      }
    }
    if (formSection) formSection.style.display = show ? 'none' : 'block';
  }

  // Show form
  function showForm(show) {
    if (formSection) formSection.style.display = show ? 'block' : 'none';
    if (errorState && show) errorState.style.display = 'none';
  }

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      // Focus on first invalid field
      const firstErrorField = editForm.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Para maquetado: permitir editar incluso si el viaje ya inició
    // (comentado temporalmente para maquetado)
    /*
    if (isTripStarted(currentTrip)) {
      showNotification('El viaje ya ha iniciado y no se puede editar', 'error');
      closeModal();
      return;
    }
    */

    // Get form data
    const formData = {
      origin: originInput.value.trim(),
      destination: destinationInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value
    };

    // Check if anything changed
    const hasChanges = 
      formData.origin !== currentTrip.origin ||
      formData.destination !== currentTrip.destination ||
      formData.date !== currentTrip.date ||
      formData.time !== currentTrip.time;

    if (!hasChanges) {
      showNotification('No se han realizado cambios en el viaje', 'error');
      return;
    }

    // Disable submit button
    setSubmitButtonState(true);

    try {
      // Update trip
      await updateTrip(tripId, formData);
      
      // Notify passengers
      await notifyPassengers(tripId, formData);
      
      // Show success notification
      showNotification('¡Viaje actualizado exitosamente! Los pasajeros han sido notificados de los cambios.', 'success');
      
      // Close modal
      closeModal();

      // Reload trips list (trigger custom event for my-trips.js to listen)
      window.dispatchEvent(new CustomEvent('tripUpdated'));

    } catch (error) {
      console.error('Error updating trip:', error);
      showNotification(error.message || 'Hubo un error al actualizar el viaje. Por favor, intenta nuevamente.', 'error');
    } finally {
      setSubmitButtonState(false);
    }
  }

  // Validate entire form
  function validateForm() {
    let isValid = true;

    // Validate all required fields
    if (!validateField('origin')) isValid = false;
    if (!validateField('destination')) isValid = false;
    if (!validateField('date')) isValid = false;
    if (!validateField('time')) isValid = false;

    return isValid;
  }

  // Validate individual field
  function validateField(fieldName) {
    let isValid = true;
    let errorMsg = '';

    switch (fieldName) {
      case 'origin':
        if (!originInput.value.trim()) {
          isValid = false;
          errorMsg = errorMessages.origin;
        }
        break;

      case 'destination':
        if (!destinationInput.value.trim()) {
          isValid = false;
          errorMsg = errorMessages.destination;
        }
        break;

      case 'date':
        if (!dateInput.value) {
          isValid = false;
          errorMsg = errorMessages.date;
        } else {
          const selectedDate = new Date(dateInput.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            isValid = false;
            errorMsg = errorMessages.datePast;
          }
        }
        break;

      case 'time':
        if (!timeInput.value) {
          isValid = false;
          errorMsg = errorMessages.time;
        } else {
          // Validate time for today's date
          if (dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDateTime = new Date(dateInput.value + 'T' + timeInput.value);
            
            if (selectedDate.getTime() === today.getTime() && selectedDateTime < new Date()) {
              isValid = false;
              errorMsg = 'La hora no puede ser anterior a la hora actual';
            }
          }
        }
        break;
    }

    // Show or clear error
    if (isValid) {
      clearFieldError(getFieldElement(fieldName));
    } else {
      showFieldError(getFieldElement(fieldName), errorMsg);
    }

    return isValid;
  }

  // Get field element
  function getFieldElement(fieldName) {
    const fieldMap = {
      origin: originInput,
      destination: destinationInput,
      date: dateInput,
      time: timeInput
    };
    return fieldMap[fieldName];
  }

  // Show field error
  function showFieldError(field, message) {
    if (!field) return;

    // Add error class to input
    field.classList.add('error');
    field.classList.remove('success');
    field.setAttribute('aria-invalid', 'true');

    // Show error message
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  // Clear field error
  function clearFieldError(field) {
    if (!field) return;

    // Remove error class
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');

    // Hide error message
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  // Set submit button state
  function setSubmitButtonState(disabled) {
    if (submitBtn) {
      submitBtn.disabled = disabled;
      if (disabled) {
        submitBtn.innerHTML = '<span class="btn-icon material-icons">hourglass_empty</span> Guardando...';
        submitBtn.classList.add('disabled');
      } else {
        submitBtn.innerHTML = '<span class="btn-icon material-icons">save</span> Guardar Cambios';
        submitBtn.classList.remove('disabled');
      }
    }
  }

  // Update trip (API call simulation)
  async function updateTrip(id, formData) {
    // TODO: Replace with actual API endpoint
    // const response = await fetch(`/api/trips/${id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(formData)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to update trip');
    // }
    // 
    // return await response.json();

    // Simulate API call and update local storage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const trips = JSON.parse(localStorage.getItem('trips') || '[]');
          const tripIndex = trips.findIndex(t => String(t.id) === String(id));
          
          if (tripIndex === -1) {
            reject(new Error('Viaje no encontrado'));
            return;
          }

          // Update trip data
          trips[tripIndex] = {
            ...trips[tripIndex],
            ...formData,
            updatedAt: new Date().toISOString()
          };

          localStorage.setItem('trips', JSON.stringify(trips));
          
          console.log('Trip updated:', trips[tripIndex]);
          resolve({ success: true, trip: trips[tripIndex] });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  }

  // Notify passengers about trip changes
  async function notifyPassengers(tripId, changes) {
    // TODO: Replace with actual API endpoint
    // const response = await fetch(`/api/trips/${tripId}/notify-passengers`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ changes })
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
        // Use currentTrip to compare with changes
        if (!currentTrip) {
          resolve({ success: true });
          return;
        }

        // Get trip to find passengers
        const trips = JSON.parse(localStorage.getItem('trips') || '[]');
        const trip = trips.find(t => String(t.id) === String(tripId));

        if (trip && trip.passengers && trip.passengers.length > 0) {
          // Create notification for each passenger
          const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
          const changesList = [];
          
          if (changes.origin !== currentTrip.origin) {
            changesList.push(`Origen: ${currentTrip.origin} → ${changes.origin}`);
          }
          if (changes.destination !== currentTrip.destination) {
            changesList.push(`Destino: ${currentTrip.destination} → ${changes.destination}`);
          }
          if (changes.date !== currentTrip.date || changes.time !== currentTrip.time) {
            const oldDateTime = `${currentTrip.date} ${currentTrip.time}`;
            const newDateTime = `${changes.date} ${changes.time}`;
            changesList.push(`Fecha/Hora: ${oldDateTime} → ${newDateTime}`);
          }

          // Only notify if there are actual changes
          if (changesList.length > 0) {
            trip.passengers.forEach(passengerId => {
              notifications.push({
                id: Date.now() + Math.random(),
                userId: passengerId,
                type: 'trip_updated',
                title: 'Viaje Actualizado',
                message: `El conductor ha actualizado el viaje. Cambios: ${changesList.join(', ')}`,
                tripId: tripId,
                read: false,
                createdAt: new Date().toISOString()
              });
            });

            localStorage.setItem('notifications', JSON.stringify(notifications));
            console.log('Passengers notified:', trip.passengers.length);
          }
        }

        resolve({ success: true });
      }, 500);
    });
  }

  // Show notification
  function showNotification(message, type = 'success') {
    // Try to use existing notification system if available
    if (window.showNotification) {
      window.showNotification(message, type);
      return;
    }

    // Fallback: create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon material-icons">${type === 'success' ? 'check' : 'close'}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }

  // Expose openModal function globally
  window.openEditTripModal = openModal;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
