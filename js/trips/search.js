// Search functionality for trips page
(function() {
  'use strict';

  // DOM elements
  const searchForm = document.getElementById('searchForm');
  const swapButton = document.getElementById('swapButton');
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const dateInput = document.getElementById('date');
  const seatsSelect = document.getElementById('seats');
  const sortSelect = document.getElementById('sortSelect');
  const tripsList = document.getElementById('tripsList');
  const activeFilters = document.getElementById('activeFilters');
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const searchBarSection = document.querySelector('.search-bar-section');

  const tabListBtn = document.getElementById('tabList');
  const tabMapBtn = document.getElementById('tabMap');
  const listTabPane = document.getElementById('listTabPane');
  const mapTabPane = document.getElementById('mapTabPane');

  const fromError = document.getElementById('from-error');
  const toError = document.getElementById('to-error');
  const dateError = document.getElementById('date-error');
  const seatsError = document.getElementById('seats-error');
  const formAlert = document.getElementById('searchFormAlert');
  const emptyResults = document.getElementById('emptyResults');
  const resetSearchBtn = document.getElementById('resetSearch');

  const MIN_LOCATION_LENGTH = 3;
  const MAX_LOCATION_LENGTH = 120;
  const MIN_SEATS = 1;
  const MAX_SEATS = 4;
  const locationPattern = /^[\p{L}\d\s.,'-]+$/u;
  const SUCCESS_ALERT_TIMEOUT = 2500;

  const errorMessages = {
    routeRequired: 'Ingresa al menos un origen o destino',
    locationMinLength: `Debes ingresar al menos ${MIN_LOCATION_LENGTH} caracteres`,
    locationMaxLength: `No puedes exceder ${MAX_LOCATION_LENGTH} caracteres`,
    locationInvalid: 'Solo se permiten letras, números y signos básicos',
    dateInvalid: 'Selecciona una fecha válida',
    datePast: 'La fecha no puede ser anterior a hoy',
    seatsRequired: 'Selecciona el número de asientos',
    seatsRange: `Puedes solicitar entre ${MIN_SEATS} y ${MAX_SEATS} asientos`
  };

  let currentResults = [];
  let formAlertTimeoutId = null;

  // Initialize
  function init() {
    if (!searchForm) return;

    try {
      searchForm.setAttribute('novalidate', 'novalidate');
    } catch (_) {}

    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.setAttribute('min', today);
      try { dateInput.value = ''; } catch (_) {}
    }

    // Limpiar filtros de origen/destino para que el render inicial no descarte viajes
    if (fromInput) { try { fromInput.value = ''; } catch (_) {} }
    if (toInput) { try { toInput.value = ''; } catch (_) {} }

    if (swapButton) {
      swapButton.addEventListener('click', handleSwapLocations);
    }

    if (searchForm) {
      searchForm.addEventListener('submit', handleSearch);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', handleSort);
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', handleLoadMore);
    }

    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', handleResetSearch);
    }

    if (tabListBtn && tabMapBtn && listTabPane && mapTabPane) {
      tabListBtn.addEventListener('click', () => activateTab('list'));
      tabMapBtn.addEventListener('click', () => activateTab('map'));
      // Ensure default
      activateTab('list');
    }

    const filterTagRemoves = document.querySelectorAll('.filter-tag-remove');
    filterTagRemoves.forEach(btn => {
      btn.addEventListener('click', handleRemoveFilterTag);
    });

    updateActiveFilters();

    attachFieldValidationHandlers();

    setRandomAvatars();

    const initialFormData = collectFormData();
    performSearch(initialFormData);
  }


  function handleSwapLocations(e) {
    e.preventDefault();
    if (!fromInput || !toInput) return;

    const fromValue = fromInput.value;
    const toValue = toInput.value;

    fromInput.value = toValue;
    toInput.value = fromValue;

    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }
  }

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

  function handleSearch(e) {
    e.preventDefault();

    if (!validateSearchForm()) {
      showFormAlert('Revisa los campos resaltados antes de buscar.');
      focusFirstError();
      return;
    }

    clearFormAlert();

    const formData = collectFormData();

    updateActiveFilters(formData);

    performSearch(formData);

    updateURLParams(formData);

    showFormAlert('Búsqueda aplicada correctamente', 'success');
  }

  function updateActiveFilters(formData = null) {
    if (!activeFilters) return;

    if (!formData) {
      formData = {
        date: dateInput?.value || '',
        seats: seatsSelect?.value || '1'
      };
    }

    const existingTags = activeFilters.querySelectorAll('.filter-tag');
    existingTags.forEach(tag => {
      const type = tag.getAttribute('data-filter');
      if (type === 'date' || type === 'seats') {
        tag.remove();
      }
    });
    
    if (formData.date) {
      const dateObj = new Date(formData.date);
      const formattedDate = dateObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      
      let dateTag = activeFilters.querySelector('[data-filter="date"]');
      if (!dateTag) {
        dateTag = createFilterTag('date', formattedDate);
        activeFilters.appendChild(dateTag);
      } else {
        dateTag.querySelector('span:first-child').textContent = formattedDate;
      }
    }

    if (formData.seats) {
      const seatsText = formData.seats === '1' ? '1 pasajero' : `${formData.seats} pasajeros`;
      
      let seatsTag = activeFilters.querySelector('[data-filter="seats"]');
      if (!seatsTag) {
        seatsTag = createFilterTag('seats', seatsText);
        activeFilters.appendChild(seatsTag);
      } else {
        seatsTag.querySelector('span:first-child').textContent = seatsText;
      }
    }
  }

  function createFilterTag(filterType, text) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.setAttribute('data-filter', filterType);
    tag.innerHTML = `
      <span>${text}</span>
      <button type="button" class="filter-tag-remove" data-filter="${filterType}">×</button>
    `;

    const removeBtn = tag.querySelector('.filter-tag-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', handleRemoveFilterTag);
    }

    return tag;
  }

  function handleRemoveFilterTag(e) {
    e.preventDefault();
    const filterType = e.target.getAttribute('data-filter');
    
    if (filterType === 'date' && dateInput) {
      dateInput.value = '';
    } else if (filterType === 'seats' && seatsSelect) {
      seatsSelect.value = '1';
    }

    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }
  }

  function performSearch(formData) {
    const allTrips = getStoredTrips();
    currentResults = filterTrips(allTrips, formData);
    renderTrips(currentResults);
  }

  function handleSort(e) {
    const sortValue = e.target.value;
    if (!Array.isArray(currentResults) || !currentResults.length) return;
    const sorted = sortTrips([...currentResults], sortValue);
    currentResults = sorted;
    renderTrips(currentResults);
  }

  function handleLoadMore(e) {
    e.preventDefault();
    console.log('Loading more trips...');
  
  }

  function handleResetSearch(e) {
    e.preventDefault();
    if (!searchForm) return;

    searchForm.reset();

    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
    if (dateInput) dateInput.value = '';
    if (seatsSelect) seatsSelect.value = String(MIN_SEATS);

    clearAllFieldErrors();
    clearFormAlert();

    const resetData = collectFormData();
    updateActiveFilters(resetData);
    performSearch(resetData);
    updateURLParams(resetData);

    showFormAlert('Formulario restablecido. Ingresa nuevos datos para filtrar.', 'success');
  }

  function updateURLParams(formData) {
    const params = new URLSearchParams();
    
    if (formData.from) params.set('from', formData.from);
    if (formData.to) params.set('to', formData.to);
    if (formData.date) params.set('date', formData.date);
    if (formData.seats) params.set('seats', formData.seats);

    const newURL = window.location.pathname + '?' + params.toString();
    window.history.pushState({}, '', newURL);
  }

  function getStoredTrips() {
    try {
      const raw = localStorage.getItem('trips');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error leyendo trips de localStorage', e);
      return [];
    }
  }

  function filterTrips(trips, formData) {
    const seatsNeeded = parseInt(formData?.seats || '1', 10);
    const dateFilter = (formData?.date || '').trim();
    const fromFilter = (formData?.from || '').trim().toLowerCase();
    const toFilter = (formData?.to || '').trim().toLowerCase();

    return (trips || []).filter(t => {
      const seatsOk = (availableSeats(t) >= seatsNeeded);
      const dateOk = dateFilter ? (String(t.date || '') === dateFilter) : true;
      const fromOk = fromFilter ? String(t.origin || '').toLowerCase().includes(fromFilter) : true;
      const toOk = toFilter ? String(t.destination || '').toLowerCase().includes(toFilter) : true;
      return seatsOk && dateOk && fromOk && toOk;
    });
  }

  function availableSeats(trip) {
    const capacity = parseInt(trip?.seats || 0, 10);
    const taken = Array.isArray(trip?.passengers) ? trip.passengers.length : 0;
    return Math.max(0, capacity - taken);
  }

  function sortTrips(trips, sortValue) {
    switch (sortValue) {
      case 'price-asc':
        return trips.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case 'price-desc':
        return trips.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case 'time-asc':
        return trips.sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
      case 'time-desc':
        return trips.sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')));
      case 'rating-desc':
        return trips.sort((a, b) => (getDriverRating(b.driverId) - getDriverRating(a.driverId)));
      default:
        return trips;
    }
  }

  function getDriverRating(driverId) {
    try {
      const users = (window.Storage && typeof window.Storage.getUsers === 'function')
        ? window.Storage.getUsers()
        : JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === driverId);
      return Number(user?.rating || 0);
    } catch {
      return 0;
    }
  }

  function renderTrips(trips) {
    if (!tripsList) return;
    tripsList.innerHTML = '';

    const hasTrips = Array.isArray(trips) && trips.length > 0;

    if (hasTrips) {
      trips.forEach(trip => {
        if (window.TripCard && typeof window.TripCard.render === 'function') {
          const el = window.TripCard.render(trip);
          tripsList.appendChild(el);
        }
      });
    }

    toggleEmptyResults(!hasTrips);

    if (resultsCount) {
      const count = hasTrips ? trips.length : 0;
      const label = count === 1 ? '1 viaje encontrado' : `${count} viajes encontrados`;
      resultsCount.textContent = label;
    }

    if (loadMoreBtn) {
      loadMoreBtn.style.display = hasTrips ? 'inline-flex' : 'none';
    }

    if (hasTrips) {
      setRandomAvatars();
    }
  }

  function attachFieldValidationHandlers() {
    ['from', 'to'].forEach(name => {
      const field = getFieldElement(name);
      if (!field) return;
      field.addEventListener('input', () => handleFieldInput(name));
      field.addEventListener('blur', () => validateField(name));
    });

    dateInput?.addEventListener('change', () => validateField('date'));
    seatsSelect?.addEventListener('change', () => validateField('seats'));
  }

  function handleFieldInput(fieldName) {
    const field = getFieldElement(fieldName);
    const errorEl = getErrorElement(fieldName);
    if (!field) return;

    if (field.classList.contains('error')) {
      clearFieldError(field, errorEl);
    }

    if ((fieldName === 'from' || fieldName === 'to') && field.value.trim().length) {
      clearRouteRequirementError();
    }
  }

  function validateSearchForm() {
    let isValid = true;

    const fromOk = validateField('from');
    const toOk = validateField('to');
    const dateOk = validateField('date');
    const seatsOk = validateField('seats');

    const hasRouteValue = Boolean(
      (fromInput?.value || '').trim() ||
      (toInput?.value || '').trim()
    );

    if (!hasRouteValue) {
      setFieldError(fromInput, fromError, errorMessages.routeRequired, 'route-required');
      setFieldError(toInput, toError, errorMessages.routeRequired, 'route-required');
      isValid = false;
    }

    return fromOk && toOk && dateOk && seatsOk && isValid;
  }

  function validateField(fieldName) {
    const field = getFieldElement(fieldName);
    const errorEl = getErrorElement(fieldName);
    if (!field || !errorEl) return true;

    const value = (field.value || '').trim();
    let isValid = true;
    let message = '';

    switch (fieldName) {
      case 'from':
      case 'to':
        if (!value) {
          clearFieldError(field, errorEl);
          break;
        }
        if (value.length < MIN_LOCATION_LENGTH) {
          isValid = false;
          message = errorMessages.locationMinLength;
        } else if (value.length > MAX_LOCATION_LENGTH) {
          isValid = false;
          message = errorMessages.locationMaxLength;
        } else if (!locationPattern.test(value)) {
          isValid = false;
          message = errorMessages.locationInvalid;
        }
        break;

      case 'date':
        if (!value) {
          clearFieldError(field, errorEl);
          break;
        }
        const selectedDate = new Date(value);
        if (Number.isNaN(selectedDate.getTime())) {
          isValid = false;
          message = errorMessages.dateInvalid;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            isValid = false;
            message = errorMessages.datePast;
          }
        }
        break;

      case 'seats':
        if (!value) {
          isValid = false;
          message = errorMessages.seatsRequired;
          break;
        }
        const seatsValue = parseInt(value, 10);
        if (Number.isNaN(seatsValue)) {
          isValid = false;
          message = errorMessages.seatsRequired;
        } else if (seatsValue < MIN_SEATS || seatsValue > MAX_SEATS) {
          isValid = false;
          message = errorMessages.seatsRange;
        }
        break;

      default:
        break;
    }

    if (!isValid) {
      setFieldError(field, errorEl, message);
      return false;
    }

    clearFieldError(field, errorEl);
    return true;
  }

  function setFieldError(field, errorElement, message, type = 'validation') {
    if (!field || !errorElement) return;
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    field.dataset.errorType = type;
    errorElement.textContent = message;
  }

  function clearFieldError(field, errorElement) {
    if (!field || !errorElement) return;
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    delete field.dataset.errorType;
    errorElement.textContent = '';
  }

  function clearAllFieldErrors() {
    clearFieldError(fromInput, fromError);
    clearFieldError(toInput, toError);
    clearFieldError(dateInput, dateError);
    clearFieldError(seatsSelect, seatsError);
  }

  function clearRouteRequirementError() {
    if (fromInput?.dataset.errorType === 'route-required') {
      clearFieldError(fromInput, fromError);
    }
    if (toInput?.dataset.errorType === 'route-required') {
      clearFieldError(toInput, toError);
    }
  }

  function focusFirstError() {
    if (!searchForm) return;
    const firstError = searchForm.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showFormAlert(message, type = 'error') {
    if (!formAlert) return;
    if (formAlertTimeoutId) {
      clearTimeout(formAlertTimeoutId);
      formAlertTimeoutId = null;
    }
    formAlert.textContent = message;
    formAlert.dataset.state = type;

    if (type === 'success') {
      formAlertTimeoutId = window.setTimeout(() => {
        clearFormAlert();
      }, SUCCESS_ALERT_TIMEOUT);
    }
  }

  function clearFormAlert() {
    if (!formAlert) return;
    formAlert.textContent = '';
    formAlert.removeAttribute('data-state');
    if (formAlertTimeoutId) {
      clearTimeout(formAlertTimeoutId);
      formAlertTimeoutId = null;
    }
  }

  function getFieldElement(fieldName) {
    switch (fieldName) {
      case 'from':
        return fromInput;
      case 'to':
        return toInput;
      case 'date':
        return dateInput;
      case 'seats':
        return seatsSelect;
      default:
        return null;
    }
  }

  function getErrorElement(fieldName) {
    switch (fieldName) {
      case 'from':
        return fromError;
      case 'to':
        return toError;
      case 'date':
        return dateError;
      case 'seats':
        return seatsError;
      default:
        return null;
    }
  }

  function collectFormData() {
    return {
      from: sanitizeText(fromInput?.value || ''),
      to: sanitizeText(toInput?.value || ''),
      date: (dateInput?.value || '').trim(),
      seats: seatsSelect?.value || String(MIN_SEATS)
    };
  }

  function sanitizeText(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    const div = document.createElement('div');
    div.textContent = trimmed;
    return div.textContent || '';
  }

  function toggleEmptyResults(isEmpty) {
    if (!emptyResults) return;
    emptyResults.hidden = !isEmpty;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function activateTab(name) {
    if (!tabListBtn || !tabMapBtn || !listTabPane || !mapTabPane) return;

    const isList = name === 'list';
    tabListBtn.classList.toggle('active', isList);
    tabMapBtn.classList.toggle('active', !isList);
    tabListBtn.setAttribute('aria-selected', isList ? 'true' : 'false');
    tabMapBtn.setAttribute('aria-selected', !isList ? 'true' : 'false');

    listTabPane.classList.toggle('active', isList);
    mapTabPane.classList.toggle('active', !isList);
    mapTabPane.style.display = isList ? 'none' : 'block';

    if (!isList) {
      if (typeof window.invalidateOnepathMap === 'function') {
        setTimeout(() => window.invalidateOnepathMap(), 50);
      }
    }
  }

})();

