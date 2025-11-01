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

  // Initialize
  function init() {
    if (!searchForm) return;

    // Set today as minimum date
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
      dateInput.setAttribute('min', today);
    }

    // Sticky search bar is handled by CSS (position: sticky)

    // Event listeners
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

    // Remove active filter tags
    const filterTagRemoves = document.querySelectorAll('.filter-tag-remove');
    filterTagRemoves.forEach(btn => {
      btn.addEventListener('click', handleRemoveFilterTag);
    });

    // Update active filters on page load
    updateActiveFilters();
  }


  // Swap from and to locations
  function handleSwapLocations(e) {
    e.preventDefault();
    if (!fromInput || !toInput) return;

    const fromValue = fromInput.value;
    const toValue = toInput.value;

    fromInput.value = toValue;
    toInput.value = fromValue;

    // Trigger search
    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }
  }

  // Handle search form submission
  function handleSearch(e) {
    e.preventDefault();

    const formData = {
      from: fromInput?.value || '',
      to: toInput?.value || '',
      date: dateInput?.value || '',
      seats: seatsSelect?.value || '1'
    };

    // Update active filters
    updateActiveFilters(formData);

    // Perform search (this would normally call an API)
    performSearch(formData);

    // Update URL params (optional)
    updateURLParams(formData);
  }

  // Update active filter tags
  function updateActiveFilters(formData = null) {
    if (!activeFilters) return;

    // Get form data if not provided
    if (!formData) {
      formData = {
        date: dateInput?.value || '',
        seats: seatsSelect?.value || '1'
      };
    }

    // Clear existing tags (except custom ones)
    const existingTags = activeFilters.querySelectorAll('.filter-tag');
    
    // Add date filter tag
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

    // Add seats filter tag
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

  // Create filter tag element
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

  // Handle remove filter tag
  function handleRemoveFilterTag(e) {
    const filterType = e.target.getAttribute('data-filter');
    
    if (filterType === 'date' && dateInput) {
      dateInput.value = '';
    } else if (filterType === 'seats' && seatsSelect) {
      seatsSelect.value = '1';
    }

    // Remove the tag
    const tag = e.target.closest('.filter-tag');
    if (tag) {
      tag.remove();
    }

    // Trigger search
    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }
  }

  // Perform search (mock function - replace with API call)
  function performSearch(formData) {
    console.log('Searching trips with:', formData);
    
    // In a real app, this would fetch data from an API
    // For now, we'll just show the existing trips
    // The results would be filtered and sorted based on formData

    // Update results count (this would come from API response)
    if (resultsCount) {
      resultsCount.textContent = '47 viajes encontrados';
    }
  }

  // Handle sort change
  function handleSort(e) {
    const sortValue = e.target.value;
    console.log('Sorting by:', sortValue);
    
    // In a real app, this would re-fetch or re-sort the trips
    // For now, we'll just log the sort option
  }

  // Handle load more
  function handleLoadMore(e) {
    e.preventDefault();
    console.log('Loading more trips...');
    
    // In a real app, this would load the next page of results
    // For now, we'll just log the action
  }

  // Update URL parameters
  function updateURLParams(formData) {
    const params = new URLSearchParams();
    
    if (formData.from) params.set('from', formData.from);
    if (formData.to) params.set('to', formData.to);
    if (formData.date) params.set('date', formData.date);
    if (formData.seats) params.set('seats', formData.seats);

    const newURL = window.location.pathname + '?' + params.toString();
    window.history.pushState({}, '', newURL);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

