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

  // Constants
  const MIN_ORIGIN_LENGTH = 3;
  const MAX_ORIGIN_LENGTH = 200;
  const MAX_NOTES_LENGTH = 500;
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000;
  const MAX_SEATS = 4;

  // Error messages
  const errorMessages = {
    origin: 'El campo Origen es obligatorio',
    originMinLength: `El origen debe tener al menos ${MIN_ORIGIN_LENGTH} caracteres`,
    originMaxLength: `El origen no puede exceder ${MAX_ORIGIN_LENGTH} caracteres`,
    originInvalid: 'El origen contiene caracteres inválidos',
    destination: 'El campo Destino es obligatorio',
    date: 'La fecha es obligatoria',
    datePast: 'La fecha no puede ser anterior a hoy',
    dateInvalid: 'Por favor, selecciona una fecha válida',
    time: 'La hora es obligatoria',
    timePast: 'La hora no puede ser anterior a la hora actual',
    timeInvalid: 'Por favor, selecciona una hora válida',
    seats: 'El número de asientos es obligatorio',
    seatsInvalid: 'El número de asientos debe ser mayor a 0',
    seatsMax: `El número máximo de asientos es ${MAX_SEATS}`,
    priceInvalid: `El precio debe estar entre S/ ${MIN_PRICE} y S/ ${MAX_PRICE}`,
    priceNegative: 'El precio no puede ser negativo',
    notesMaxLength: `Las notas no pueden exceder ${MAX_NOTES_LENGTH} caracteres`
  };

  // State
  let isSubmitting = false;

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

    // Set max price attribute
    if (priceInput) {
      priceInput.setAttribute('max', MAX_PRICE);
      priceInput.setAttribute('min', MIN_PRICE);
    }

    // Set max seats attribute
    if (seatsInput) {
      const maxSeatsOption = seatsInput.querySelector(`option[value="${MAX_SEATS}"]`);
      if (!maxSeatsOption && seatsInput.options.length > 0) {
        // Ensure max seats is available
        const lastOption = seatsInput.options[seatsInput.options.length - 1];
        const maxValue = parseInt(lastOption.value, 10);
        if (maxValue < MAX_SEATS) {
          const newOption = document.createElement('option');
          newOption.value = MAX_SEATS;
          newOption.textContent = `${MAX_SEATS} asientos`;
          seatsInput.appendChild(newOption);
        }
      }
    }

    // Set maxlength for text inputs
    if (originInput) {
      originInput.setAttribute('maxlength', MAX_ORIGIN_LENGTH);
    }
    if (notesTextarea) {
      notesTextarea.setAttribute('maxlength', MAX_NOTES_LENGTH);
    }

    // Event listeners
    publishForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation on blur (after user leaves field)
    originInput?.addEventListener('blur', () => validateField('origin'));
    destinationInput?.addEventListener('change', () => validateField('destination'));
    dateInput?.addEventListener('change', () => {
      validateField('date');
      // Re-validate time when date changes
      if (timeInput.value) {
        validateField('time');
      }
    });
    timeInput?.addEventListener('change', () => validateField('time'));
    seatsInput?.addEventListener('change', () => validateField('seats'));
    priceInput?.addEventListener('blur', () => validateField('price'));
    notesTextarea?.addEventListener('input', () => validateField('notes'));

    // Real-time validation on input (as user types)
    originInput?.addEventListener('input', () => {
      clearFieldError(originInput);
      // Show success state if valid
      if (originInput.value.trim().length >= MIN_ORIGIN_LENGTH) {
        showFieldSuccess(originInput);
      }
    });

    notesTextarea?.addEventListener('input', () => {
      clearFieldError(notesTextarea);
      // Update character count if needed
      updateCharacterCount(notesTextarea, MAX_NOTES_LENGTH);
    });

    priceInput?.addEventListener('input', () => {
      clearFieldError(priceInput);
      // Validate format in real-time
      const value = priceInput.value;
      if (value && !isNaN(parseFloat(value)) && parseFloat(value) >= 0) {
        showFieldSuccess(priceInput);
      }
    });

    // Remove error styling on input for all fields
    const inputs = publishForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          clearFieldError(input);
        }
      });
    });

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', handleCancel);
    }

    // Prevent form submission on Enter key in textarea
    if (notesTextarea) {
      notesTextarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          // Allow Ctrl+Enter to submit
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          // Prevent default Enter behavior, allow Shift+Enter for new line
          e.preventDefault();
        }
      });
    }
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
      const firstErrorField = publishForm.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Show error notification
      showErrorNotification('Por favor, corrige los errores en el formulario antes de continuar.');
      return;
    }

    // Sanitize and get form data
    const formData = {
      origin: sanitizeInput(originInput.value.trim()),
      destination: destinationInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      seats: parseInt(seatsInput.value, 10),
      price: priceInput.value ? parseFloat(parseFloat(priceInput.value).toFixed(2)) : null,
      notes: notesTextarea.value.trim() ? sanitizeInput(notesTextarea.value.trim()) : null,
      preferences: {
        onlyVerified: document.getElementById('only-verified')?.checked || false,
        instantBooking: document.getElementById('instant-booking')?.checked || false,
        recurring: document.getElementById('recurring')?.checked || false
      }
    };

    // Set submitting state
    isSubmitting = true;
    setSubmitButtonState(true);

    try {
      // Submit trip (this would normally call an API)
      await publishTrip(formData);
      
      // Show success notification
      showSuccessNotification('¡Viaje publicado exitosamente! Ya está visible para otros estudiantes.');
      
      // Reset form after short delay
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error publishing trip:', error);
      const errorMsg = error.message || 'Hubo un error al publicar el viaje. Por favor, intenta nuevamente.';
      showErrorNotification(errorMsg);
    } finally {
      isSubmitting = false;
      setSubmitButtonState(false);
    }
  }

  // Reset form to initial state
  function resetForm() {
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
    
    // Clear all errors and success states
    clearAllErrors();
    clearAllSuccessStates();
    
    // Reset checkboxes
    const checkboxes = publishForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  }

  // Sanitize input to prevent XSS
  function sanitizeInput(str) {
    // Use textContent to escape HTML and return the safe text
    const div = document.createElement('div');
    div.textContent = str;
    return div.textContent || div.innerText || '';
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
    
    // Validate optional fields if they have values
    if (priceInput && priceInput.value) {
      if (!validateField('price')) isValid = false;
    }
    if (notesTextarea && notesTextarea.value) {
      if (!validateField('notes')) isValid = false;
    }

    return isValid;
  }

  // Validate individual field
  function validateField(fieldName) {
    let isValid = true;
    let errorMessage = '';
    const field = getFieldElement(fieldName);

    if (!field) return false;

    switch (fieldName) {
      case 'origin':
        const originValue = originInput.value.trim();
        if (!originValue) {
          isValid = false;
          errorMessage = errorMessages.origin;
        } else if (originValue.length < MIN_ORIGIN_LENGTH) {
          isValid = false;
          errorMessage = errorMessages.originMinLength;
        } else if (originValue.length > MAX_ORIGIN_LENGTH) {
          isValid = false;
          errorMessage = errorMessages.originMaxLength;
        } else if (!isValidText(originValue)) {
          isValid = false;
          errorMessage = errorMessages.originInvalid;
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
          
          if (isNaN(selectedDate.getTime())) {
            isValid = false;
            errorMessage = errorMessages.dateInvalid;
          } else if (selectedDate < today) {
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
          // Validate time format
          const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timePattern.test(timeInput.value)) {
            isValid = false;
            errorMessage = errorMessages.timeInvalid;
          } else if (dateInput.value) {
            // Validate time for today's date
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDateTime = new Date(dateInput.value + 'T' + timeInput.value);
            const now = new Date();
            
            if (selectedDate.getTime() === today.getTime() && selectedDateTime < now) {
              isValid = false;
              errorMessage = errorMessages.timePast;
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
        } else if (seatsValue > MAX_SEATS) {
          isValid = false;
          errorMessage = errorMessages.seatsMax;
        }
        break;

      case 'price':
        if (priceInput.value) {
          const priceValue = parseFloat(priceInput.value);
          if (isNaN(priceValue)) {
            isValid = false;
            errorMessage = errorMessages.priceInvalid;
          } else if (priceValue < MIN_PRICE) {
            isValid = false;
            errorMessage = errorMessages.priceNegative;
          } else if (priceValue > MAX_PRICE) {
            isValid = false;
            errorMessage = errorMessages.priceInvalid;
          }
        }
        break;

      case 'notes':
        if (notesTextarea.value) {
          const notesValue = notesTextarea.value.trim();
          if (notesValue.length > MAX_NOTES_LENGTH) {
            isValid = false;
            errorMessage = errorMessages.notesMaxLength;
          }
        }
        break;
    }

    // Show or clear error/success
    if (isValid) {
      clearFieldError(field);
      // Show success state for required fields that are valid
      if (['origin', 'destination', 'date', 'time', 'seats'].includes(fieldName)) {
        showFieldSuccess(field);
      }
    } else {
      showFieldError(field, errorMessage);
    }

    return isValid;
  }

  // Validate text input (allows letters, numbers, spaces, and common punctuation)
  function isValidText(str) {
    // Allow letters, numbers, spaces, and common punctuation for addresses
    const textPattern = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,;:()\-'"]+$/;
    return textPattern.test(str);
  }

  // Get field element
  function getFieldElement(fieldName) {
    const fieldMap = {
      origin: originInput,
      destination: destinationInput,
      date: dateInput,
      time: timeInput,
      seats: seatsInput,
      price: priceInput,
      notes: notesTextarea
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

  // Clear all errors
  function clearAllErrors() {
    const errorFields = publishForm.querySelectorAll('.error');
    errorFields.forEach(field => {
      clearFieldError(field);
    });
  }

  // Clear all success states
  function clearAllSuccessStates() {
    const successFields = publishForm.querySelectorAll('.success');
    successFields.forEach(field => {
      field.classList.remove('success');
    });
  }

  // Update character count for textarea
  function updateCharacterCount(field, maxLength) {
    if (!field) return;
    
    const currentLength = field.value.length;
    const remaining = maxLength - currentLength;
    
    // Find or create character count element
    let countElement = document.getElementById(field.id + '-count');
    if (!countElement) {
      countElement = document.createElement('small');
      countElement.id = field.id + '-count';
      countElement.className = 'form-hint';
      countElement.style.marginTop = '4px';
      countElement.style.display = 'block';
      
      // Insert after the field or after the error message if it exists
      const errorElement = document.getElementById(field.id + '-error');
      const formGroup = field.closest('.form-group');
      if (errorElement && errorElement.nextSibling) {
        formGroup.insertBefore(countElement, errorElement.nextSibling);
      } else if (formGroup) {
        formGroup.appendChild(countElement);
      } else {
        field.parentElement.appendChild(countElement);
      }
    }
    
    if (currentLength > 0) {
      countElement.textContent = `${currentLength}/${maxLength} caracteres`;
      countElement.style.color = remaining < 50 ? 'var(--error)' : 'var(--text-light)';
      countElement.style.display = 'block';
    } else {
      countElement.textContent = '';
      countElement.style.display = 'none';
    }
  }

  // Set submit button state
  function setSubmitButtonState(disabled) {
    if (submitBtn) {
      submitBtn.disabled = disabled;
      if (disabled) {
        submitBtn.innerHTML = '<span class="btn-icon material-icons">hourglass_empty</span>Publicando...';
        submitBtn.classList.add('disabled');
        submitBtn.setAttribute('aria-busy', 'true');
      } else {
        submitBtn.innerHTML = '<span class="btn-icon material-icons">send</span>Publicar Viaje';
        submitBtn.classList.remove('disabled');
        submitBtn.removeAttribute('aria-busy');
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
    if (typeof showNotification === 'function') {
      showNotification(message, 'success');
      return;
    }

    // Fallback simple notification if global helper is not available
    alert(message);
  }

  // Show error notification
  function showErrorNotification(message) {
    if (typeof showNotification === 'function') {
      showNotification(message, 'error');
      return;
    }

    // Fallback simple notification if global helper is not available
    alert(message);
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

