// Advanced filters functionality
(function() {
  'use strict';

  // Initialize filters
  function init() {
    // Setup filter toggles
    const filterToggles = document.querySelectorAll('.filter-toggle');
    filterToggles.forEach(toggle => {
      toggle.addEventListener('click', handleFilterToggle);
      // Open first filter by default
      if (toggle.getAttribute('data-filter') === 'rating') {
        toggle.classList.add('active');
        const content = document.getElementById('filter-' + toggle.getAttribute('data-filter'));
        if (content) {
          content.classList.add('active');
        }
      }
    });

    // Setup apply filters button
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', handleApplyFilters);
    }

    // Setup clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', handleClearFilters);
    }
  }

  // Handle filter section toggle
  function handleFilterToggle(e) {
    e.preventDefault();
    const toggle = e.currentTarget;
    const filterName = toggle.getAttribute('data-filter');
    const content = document.getElementById('filter-' + filterName);

    if (!content) return;

    // Toggle active class
    toggle.classList.toggle('active');
    content.classList.toggle('active');
  }

  // Handle apply filters
  function handleApplyFilters(e) {
    e.preventDefault();

    const filters = collectFilters();
    console.log('Applying filters:', filters);

    // In a real app, this would filter the trips
    // For now, we'll just log the filters
    applyFiltersToResults(filters);
  }

  // Handle clear filters
  function handleClearFilters(e) {
    e.preventDefault();

    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('.filter-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    // Clear filter data and re-apply
    const filters = collectFilters();
    applyFiltersToResults(filters);
  }

  // Collect all active filter values
  function collectFilters() {
    const filters = {
      rating: [],
      pickup: [],
      destination: [],
      price: [],
      vehicle: []
    };

    // Collect rating filters
    const ratingCheckboxes = document.querySelectorAll('#filter-rating input[type="checkbox"]:checked');
    ratingCheckboxes.forEach(checkbox => {
      filters.rating.push(checkbox.value);
    });

    // Collect pickup filters
    const pickupCheckboxes = document.querySelectorAll('#filter-pickup input[type="checkbox"]:checked');
    pickupCheckboxes.forEach(checkbox => {
      filters.pickup.push(checkbox.value);
    });

    // Collect destination filters
    const destinationCheckboxes = document.querySelectorAll('#filter-destination input[type="checkbox"]:checked');
    destinationCheckboxes.forEach(checkbox => {
      filters.destination.push(checkbox.value);
    });

    // Collect price filters
    const priceCheckboxes = document.querySelectorAll('#filter-price input[type="checkbox"]:checked');
    priceCheckboxes.forEach(checkbox => {
      filters.price.push(checkbox.value);
    });

    // Collect vehicle filters
    const vehicleCheckboxes = document.querySelectorAll('#filter-vehicle input[type="checkbox"]:checked');
    vehicleCheckboxes.forEach(checkbox => {
      filters.vehicle.push(checkbox.value);
    });

    return filters;
  }

  // Apply filters to results (mock function)
  function applyFiltersToResults(filters) {
    // In a real app, this would:
    // 1. Filter the trips based on the selected filters
    // 2. Update the trips list
    // 3. Update the results count
    // 4. Show/hide trip cards based on filter criteria

    console.log('Filters applied:', filters);
    
    // Example: Update results count
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
      // In a real app, this would come from the filtered results
      resultsCount.textContent = '47 viajes encontrados';
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

