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

  // Constants
  const MIN_ORIGIN_LENGTH = 3;
  const MAX_ORIGIN_LENGTH = 200;
  const MIN_DESTINATION_LENGTH = 3;
  const MAX_DESTINATION_LENGTH = 200;

  // State
  let isSubmitting = false;

  // Error messages
  const errorMessages = {
    origin: 'El campo Origen es obligatorio',
    originMinLength: `El origen debe tener al menos ${MIN_ORIGIN_LENGTH} caracteres`,
    originMaxLength: `El origen no puede exceder ${MAX_ORIGIN_LENGTH} caracteres`,
    originInvalid: 'El origen contiene caracteres inválidos',
    destination: 'El campo Destino es obligatorio',
    destinationMinLength: `El destino debe tener al menos ${MIN_DESTINATION_LENGTH} caracteres`,
    destinationMaxLength: `El destino no puede exceder ${MAX_DESTINATION_LENGTH} caracteres`,
    destinationInvalid: 'El destino contiene caracteres inválidos',
    date: 'La fecha es obligatoria',
    datePast: 'La fecha no puede ser anterior a hoy',
    dateInvalid: 'Por favor, selecciona una fecha válida',
    time: 'La hora es obligatoria',
    timePast: 'La hora no puede ser anterior a la hora actual',
    timeInvalid: 'Por favor, selecciona una hora válida',
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

    // Set maxlength for text inputs
    if (originInput) {
      originInput.setAttribute('maxlength', MAX_ORIGIN_LENGTH);
    }
    if (destinationInput) {
      destinationInput.setAttribute('maxlength', MAX_DESTINATION_LENGTH);
    }

    // Real-time validation on blur (after user leaves field)
    originInput?.addEventListener('blur', () => validateField('origin'));
    destinationInput?.addEventListener('blur', () => validateField('destination'));
    dateInput?.addEventListener('change', () => {
      validateField('date');
      // Re-validate time when date changes
      if (timeInput.value) {
        validateField('time');
      }
    });
    timeInput?.addEventListener('change', () => validateField('time'));

    // Real-time validation on input (as user types)
    originInput?.addEventListener('input', () => {
      clearFieldError(originInput);
      // Show success state if valid
      if (originInput.value.trim().length >= MIN_ORIGIN_LENGTH) {
        showFieldSuccess(originInput);
      }
    });

    destinationInput?.addEventListener('input', () => {
      clearFieldError(destinationInput);
      // Show success state if valid
      if (destinationInput.value.trim().length >= MIN_DESTINATION_LENGTH) {
        showFieldSuccess(destinationInput);
      }
    });

    // Remove error styling on input for all fields
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

      // Normalize trip data before storing
      currentTrip = {
        ...trip,
        time: normalizeTime(trip.time || ''),
        origin: String(trip.origin || '').trim(),
        destination: String(trip.destination || '').trim(),
        date: String(trip.date || '').trim()
      };
      populateForm(currentTrip);
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

  // Normalize time format (HH:MM)
  function normalizeTime(timeStr) {
    if (!timeStr) return '';
    const trimmed = String(timeStr).trim();
    // If already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // Try to parse and format
    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const hours = String(parseInt(parts[0], 10) || 0).padStart(2, '0');
      const minutes = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return trimmed;
  }

  // Populate form with trip data
  function populateForm(trip) {
    if (originInput) originInput.value = trip.origin || '';
    if (destinationInput) destinationInput.value = trip.destination || '';
    if (dateInput) dateInput.value = trip.date || '';
    if (timeInput) {
      // Normalize time before setting
      const normalizedTime = normalizeTime(trip.time || '');
      timeInput.value = normalizedTime;
    }
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

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      // Focus on first invalid field
      const firstErrorField = editForm.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Show error notification
      showNotification('Por favor, corrige los errores en el formulario antes de continuar.', 'error');
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

    // Sanitize and get form data
    const formData = {
      origin: sanitizeInput(originInput.value.trim()),
      destination: sanitizeInput(destinationInput.value.trim()),
      date: dateInput.value ? dateInput.value.trim() : '',
      time: normalizeTime(timeInput.value)
    };

    // Check if anything changed (currentTrip is already normalized when loaded)
    const hasChanges = 
      formData.origin !== (currentTrip.origin || '') ||
      formData.destination !== (currentTrip.destination || '') ||
      formData.date !== (currentTrip.date || '') ||
      formData.time !== (currentTrip.time || '');

    if (!hasChanges) {
      showNotification('No se han realizado cambios en el viaje', 'error');
      return;
    }

    // Set submitting state
    isSubmitting = true;
    setSubmitButtonState(true);

    try {
      // Update trip
      await updateTrip(tripId, formData);
      
      // Notify passengers
      await notifyPassengers(tripId, formData);
      
      // Show success popup bubble
      showSuccessPopup('¡Cambios guardados exitosamente!');
      
      // Close modal after popup disappears
      setTimeout(() => {
        closeModal();
        // Reload trips list (trigger custom event for my-trips.js to listen)
        window.dispatchEvent(new CustomEvent('tripUpdated'));
      }, 3000);

    } catch (error) {
      console.error('Error updating trip:', error);
      showNotification(error.message || 'Hubo un error al actualizar el viaje. Por favor, intenta nuevamente.', 'error');
    } finally {
      isSubmitting = false;
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
    const field = getFieldElement(fieldName);

    if (!field) return false;

    switch (fieldName) {
      case 'origin':
        const originValue = originInput.value.trim();
        if (!originValue) {
          isValid = false;
          errorMsg = errorMessages.origin;
        } else if (originValue.length < MIN_ORIGIN_LENGTH) {
          isValid = false;
          errorMsg = errorMessages.originMinLength;
        } else if (originValue.length > MAX_ORIGIN_LENGTH) {
          isValid = false;
          errorMsg = errorMessages.originMaxLength;
        } else if (!isValidText(originValue)) {
          isValid = false;
          errorMsg = errorMessages.originInvalid;
        }
        break;

      case 'destination':
        const destinationValue = destinationInput.value.trim();
        if (!destinationValue) {
          isValid = false;
          errorMsg = errorMessages.destination;
        } else if (destinationValue.length < MIN_DESTINATION_LENGTH) {
          isValid = false;
          errorMsg = errorMessages.destinationMinLength;
        } else if (destinationValue.length > MAX_DESTINATION_LENGTH) {
          isValid = false;
          errorMsg = errorMessages.destinationMaxLength;
        } else if (!isValidText(destinationValue)) {
          isValid = false;
          errorMsg = errorMessages.destinationInvalid;
        } else if (originInput && originInput.value.trim().toLowerCase() === destinationValue.toLowerCase()) {
          isValid = false;
          errorMsg = 'El origen y el destino no pueden ser iguales';
        }
        break;

      case 'date':
        if (!dateInput.value) {
          isValid = false;
          errorMsg = errorMessages.date;
        } else {
          // Parse date correctly in local timezone
          const dateParts = dateInput.value.split('-');
          const selectedDate = new Date(
            parseInt(dateParts[0], 10),
            parseInt(dateParts[1], 10) - 1,
            parseInt(dateParts[2], 10),
            0, 0, 0, 0
          );
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(selectedDate.getTime())) {
            isValid = false;
            errorMsg = errorMessages.dateInvalid;
          } else if (selectedDate < today) {
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
          // Validate time format
          const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timePattern.test(timeInput.value)) {
            isValid = false;
            errorMsg = errorMessages.timeInvalid;
          } else if (dateInput.value) {
            // Validate time for today's date only
            const dateParts = dateInput.value.split('-');
            const selectedDate = new Date(
              parseInt(dateParts[0], 10),
              parseInt(dateParts[1], 10) - 1,
              parseInt(dateParts[2], 10),
              0, 0, 0, 0
            );
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Only validate if it's today
            if (selectedDate.getTime() === today.getTime()) {
              const timeParts = timeInput.value.split(':');
              const selectedDateTime = new Date(
                parseInt(dateParts[0], 10),
                parseInt(dateParts[1], 10) - 1,
                parseInt(dateParts[2], 10),
                parseInt(timeParts[0], 10),
                parseInt(timeParts[1], 10),
                0, 0
              );
              const now = new Date();
              
              // Al editar, solo validar si NO es la hora original del viaje
              const isOriginalDateTime = currentTrip && 
                                        dateInput.value === currentTrip.date && 
                                        normalizeTime(timeInput.value) === currentTrip.time;
              
              if (!isOriginalDateTime && selectedDateTime < now) {
                isValid = false;
                errorMsg = errorMessages.timePast;
              }
            }
          }
        }
        break;
    }

    // Show or clear error/success
    if (isValid) {
      clearFieldError(field);
      // Show success state for required fields that are valid
      if (['origin', 'destination', 'date', 'time'].includes(fieldName)) {
        showFieldSuccess(field);
      }
    } else {
      showFieldError(field, errorMsg);
    }

    return isValid;
  }

  // Validate text input (allows letters, numbers, spaces, and common punctuation)
  function isValidText(str) {
    // Allow letters, numbers, spaces, and common punctuation for addresses
    const textPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:()\-'"]+$/;
    return textPattern.test(str);
  }

  // Sanitize input to prevent XSS
  function sanitizeInput(str) {
    // Use textContent to escape HTML and return the safe text
    const div = document.createElement('div');
    div.textContent = str;
    return div.textContent || div.innerText || '';
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
    field.setAttribute('aria-describedby', field.id + '-error');

    // Show error message
    const errorElement = document.getElementById(field.id + '-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      errorElement.setAttribute('role', 'alert');
    }
  }

  // Show field success state
  function showFieldSuccess(field) {
    if (!field) return;

    // Add success class
    field.classList.add('success');
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    field.setAttribute('aria-invalid', 'false');
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
      errorElement.removeAttribute('role');
    }
  }

  // Set submit button state
  function setSubmitButtonState(disabled) {
    if (submitBtn) {
      submitBtn.disabled = disabled;
      if (disabled) {
        submitBtn.innerHTML = '<span class="btn-icon material-icons">hourglass_empty</span> Guardando...';
        submitBtn.classList.add('disabled');
        submitBtn.setAttribute('aria-busy', 'true');
      } else {
        submitBtn.innerHTML = '<span class="btn-icon material-icons">save</span> Guardar Cambios';
        submitBtn.classList.remove('disabled');
        submitBtn.removeAttribute('aria-busy');
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

  // Show success popup bubble
  function showSuccessPopup(message) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.trip-save-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'trip-save-popup';
    popup.setAttribute('role', 'alert');
    popup.setAttribute('aria-live', 'assertive');

    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'trip-save-popup__icon';
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = 'check_circle';
    iconContainer.appendChild(icon);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'trip-save-popup__content';
    const messageElement = document.createElement('p');
    messageElement.className = 'trip-save-popup__message';
    messageElement.textContent = sanitizeInput(message);
    contentContainer.appendChild(messageElement);

    // Assemble popup
    popup.appendChild(iconContainer);
    popup.appendChild(contentContainer);

    // Add to body
    document.body.appendChild(popup);

    // Animate in
    setTimeout(() => {
      popup.classList.add('show');
    }, 10);

    // Remove after delay
    setTimeout(() => {
      popup.classList.add('hide');
      setTimeout(() => {
        popup.remove();
      }, 400);
    }, 3000);
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
