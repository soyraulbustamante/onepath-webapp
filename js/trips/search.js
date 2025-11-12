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

  let currentResults = [];

  // Initialize
  function init() {
    if (!searchForm) return;


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

    setRandomAvatars();

    const initialFormData = {
      from: fromInput?.value || '',
      to: toInput?.value || '',
      date: dateInput?.value || '',
      seats: seatsSelect?.value || '1'
    };
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

    const formData = {
      from: fromInput?.value || '',
      to: toInput?.value || '',
      date: dateInput?.value || '',
      seats: seatsSelect?.value || '1'
    };

    updateActiveFilters(formData);

    performSearch(formData);

    updateURLParams(formData);
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

    (trips || []).forEach(trip => {
      if (window.TripCard && typeof window.TripCard.render === 'function') {
        const el = window.TripCard.render(trip);
        tripsList.appendChild(el);
      }
    });

    if (resultsCount) {
      const count = Array.isArray(trips) ? trips.length : 0;
      resultsCount.textContent = `${count} viajes encontrados`;
    }

    setRandomAvatars();
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

