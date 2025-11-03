// Publish Trip functionality
(function() {
  'use strict';

  // DOM elements
  const publishForm = document.getElementById('publishForm');
  const originInput = document.getElementById('origin');
  const destinationInput = document.getElementById('destination');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const seatsInput = document.getElementById('seats');
  const priceInput = document.getElementById('price');
  const notesTextarea = document.getElementById('notes');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Error messages
  const errorMessages = {
    origin: 'El campo Origen es obligatorio',
    destination: 'El campo Destino es obligatorio',
    date: 'La fecha es obligatoria',
    time: 'La hora es obligatoria',
    seats: 'El número de asientos es obligatorio',
    seatsInvalid: 'El número de asientos debe ser mayor a 0',
    datePast: 'La fecha no puede ser anterior a hoy',
    dateInvalid: 'Por favor, selecciona una fecha válida'
  };

  // Initialize
  function init() {
    if (!publishForm) return;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.setAttribute('min', today);
    }

    // Set default time to current time + 1 hour
    if (timeInput) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const defaultTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      timeInput.value = defaultTime;
    }

    // Event listeners
    publishForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    originInput?.addEventListener('blur', () => validateField('origin'));
    destinationInput?.addEventListener('blur', () => validateField('destination'));
    dateInput?.addEventListener('change', () => validateField('date'));
    timeInput?.addEventListener('change', () => validateField('time'));
    seatsInput?.addEventListener('blur', () => validateField('seats'));

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', handleCancel);
    }

    // Remove error styling on input
    const inputs = publishForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          clearFieldError(input);
        }
      });
    });
  }

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      // Focus on first invalid field
      const firstErrorField = publishForm.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Get form data
    const formData = {
      origin: originInput.value.trim(),
      destination: destinationInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      seats: parseInt(seatsInput.value, 10),
      price: priceInput.value ? parseFloat(priceInput.value) : null,
      notes: notesTextarea.value.trim() || null
    };

    // Disable submit button
    setSubmitButtonState(true);

    try {
      // Submit trip (this would normally call an API)
      await publishTrip(formData);
      
      // Show success notification
      showSuccessNotification('¡Viaje publicado exitosamente! Ya está visible para otros estudiantes.');
      
      // Reset form after short delay
      setTimeout(() => {
        publishForm.reset();
        // Reset date min attribute
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) {
          dateInput.setAttribute('min', today);
        }
        // Reset time to default
        if (timeInput) {
          const now = new Date();
          now.setHours(now.getHours() + 1);
          const defaultTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
          timeInput.value = defaultTime;
        }
        clearAllErrors();
      }, 2000);

    } catch (error) {
      console.error('Error publishing trip:', error);
      showErrorNotification('Hubo un error al publicar el viaje. Por favor, intenta nuevamente.');
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
    if (!validateField('seats')) isValid = false;

    return isValid;
  }

  // Validate individual field
  function validateField(fieldName) {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'origin':
        if (!originInput.value.trim()) {
          isValid = false;
          errorMessage = errorMessages.origin;
        }
        break;

      case 'destination':
        if (!destinationInput.value.trim()) {
          isValid = false;
          errorMessage = errorMessages.destination;
        }
        break;

      case 'date':
        if (!dateInput.value) {
          isValid = false;
          errorMessage = errorMessages.date;
        } else {
          const selectedDate = new Date(dateInput.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            isValid = false;
            errorMessage = errorMessages.datePast;
          }
        }
        break;

      case 'time':
        if (!timeInput.value) {
          isValid = false;
          errorMessage = errorMessages.time;
        } else {
          // Validate time for today's date
          if (dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDateTime = new Date(dateInput.value + 'T' + timeInput.value);
            
            if (selectedDate.getTime() === today.getTime() && selectedDateTime < new Date()) {
              isValid = false;
              errorMessage = 'La hora no puede ser anterior a la hora actual';
            }
          }
        }
        break;

      case 'seats':
        const seatsValue = parseInt(seatsInput.value, 10);
        if (!seatsInput.value || isNaN(seatsValue)) {
          isValid = false;
          errorMessage = errorMessages.seats;
        } else if (seatsValue <= 0) {
          isValid = false;
          errorMessage = errorMessages.seatsInvalid;
        }
        break;
    }

    // Show or clear error
    if (isValid) {
      clearFieldError(getFieldElement(fieldName));
    } else {
      showFieldError(getFieldElement(fieldName), errorMessage);
    }

    return isValid;
  }

  // Get field element
  function getFieldElement(fieldName) {
    const fieldMap = {
      origin: originInput,
      destination: destinationInput,
      date: dateInput,
      time: timeInput,
      seats: seatsInput
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

  // Clear all errors
  function clearAllErrors() {
    const errorFields = publishForm.querySelectorAll('.error');
    errorFields.forEach(field => {
      clearFieldError(field);
    });
  }

  // Set submit button state
  function setSubmitButtonState(disabled) {
    if (submitBtn) {
      submitBtn.disabled = disabled;
      if (disabled) {
        submitBtn.textContent = 'Publicando...';
        submitBtn.classList.add('disabled');
      } else {
        submitBtn.innerHTML = '<span class="btn-icon">🚀</span>\n                                Publicar Viaje';
        submitBtn.classList.remove('disabled');
      }
    }
  }

  // Publish trip (API call)
  async function publishTrip(formData) {
    // TODO: Replace with actual API endpoint
    // const response = await fetch('/api/trips', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(formData)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to publish trip');
    // }
    // 
    // return await response.json();

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Trip published:', formData);
        resolve({ success: true, tripId: Date.now() });
      }, 1000);
    });
  }

  // Show success notification
  function showSuccessNotification(message) {
    // Create notification element
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

  // Show error notification
  function showErrorNotification(message) {
    // Create notification element
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

  // Handle cancel
  function handleCancel() {
    if (confirm('¿Estás seguro de que quieres cancelar? Los datos ingresados se perderán.')) {
      window.location.href = '../../pages/trips/my-trips.html';
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

