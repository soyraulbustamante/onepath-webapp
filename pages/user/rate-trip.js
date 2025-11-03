// Rate Trip functionality - OnePath
(function() {
    'use strict';

    // Rating system state
    let ratingData = {
        overall: 0,
        categories: {
            punctuality: 0,
            safety: 0,
            cleanliness: 0,
            communication: 0
        },
        comment: '',
        tags: [],
        tripId: null,
        driverId: null
    };

    // Rating text mappings
    const ratingTexts = {
        1: 'Muy malo',
        2: 'Malo',
        3: 'Regular',
        4: 'Bueno',
        5: 'Excelente'
    };

    // DOM elements
    let overallStars, categoryStars, feedbackTags, commentTextarea, charCounter;
    let submitBtn, rateLaterBtn, reportBtn;
    let ratingText, thankYouSection;

    // Initialize rating system
    function initRating() {
        // Get DOM elements
        overallStars = document.querySelectorAll('.star-btn');
        categoryStars = document.querySelectorAll('.category-star');
        feedbackTags = document.querySelectorAll('.feedback-tag');
        commentTextarea = document.getElementById('commentTextarea');
        charCounter = document.getElementById('charCounter');
        submitBtn = document.getElementById('submitRatingBtn');
        rateLaterBtn = document.getElementById('rateLaterBtn');
        reportBtn = document.getElementById('reportBtn');
        ratingText = document.getElementById('ratingText');
        thankYouSection = document.getElementById('thankYouSection');

        // Load trip data from URL params or localStorage
        loadTripData();

        // Bind events
        bindEvents();

        // Initialize character counter
        updateCharCounter();
    }

    // Load trip data
    function loadTripData() {
        try {
            // In a real app, this would come from URL params or API
            const urlParams = new URLSearchParams(window.location.search);
            ratingData.tripId = urlParams.get('tripId') || 'trip_123';
            ratingData.driverId = urlParams.get('driverId') || 'driver_456';
            
            // Load any existing rating data
            const savedRating = localStorage.getItem(`rating_${ratingData.tripId}`);
            if (savedRating) {
                const parsed = JSON.parse(savedRating);
                ratingData = { ...ratingData, ...parsed };
                restoreRatingUI();
            }
        } catch (e) {
            console.error('Error loading trip data:', e);
        }
    }

    // Bind event listeners
    function bindEvents() {
        // Overall rating stars
        overallStars.forEach((star, index) => {
            star.addEventListener('click', () => handleOverallRating(index + 1));
            star.addEventListener('mouseenter', () => highlightStars(overallStars, index + 1));
        });

        // Reset overall stars on mouse leave
        document.getElementById('overallRating').addEventListener('mouseleave', () => {
            highlightStars(overallStars, ratingData.overall);
        });

        // Category rating stars
        categoryStars.forEach(star => {
            star.addEventListener('click', handleCategoryRating);
            star.addEventListener('mouseenter', handleCategoryHover);
        });

        // Reset category stars on mouse leave
        document.querySelectorAll('.rating-category').forEach(category => {
            category.addEventListener('mouseleave', () => {
                const categoryName = category.querySelector('.category-star').dataset.category;
                const categoryButtons = category.querySelectorAll('.category-star');
                highlightStars(categoryButtons, ratingData.categories[categoryName]);
            });
        });

        // Feedback tags
        feedbackTags.forEach(tag => {
            tag.addEventListener('click', handleTagSelection);
        });

        // Comment textarea
        if (commentTextarea) {
            commentTextarea.addEventListener('input', handleCommentInput);
        }

        // Action buttons
        if (submitBtn) {
            submitBtn.addEventListener('click', handleSubmitRating);
        }

        if (rateLaterBtn) {
            rateLaterBtn.addEventListener('click', handleRateLater);
        }

        if (reportBtn) {
            reportBtn.addEventListener('click', handleReportProblem);
        }

        // Next action buttons
        const searchTripBtn = document.getElementById('searchTripBtn');
        const goHomeBtn = document.getElementById('goHomeBtn');

        if (searchTripBtn) {
            searchTripBtn.addEventListener('click', () => {
                window.location.href = '../../pages/trips/search.html';
            });
        }

        if (goHomeBtn) {
            goHomeBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }
    }

    // Handle overall rating
    function handleOverallRating(rating) {
        ratingData.overall = rating;
        highlightStars(overallStars, rating);
        
        if (ratingText) {
            ratingText.textContent = ratingTexts[rating];
        }

        saveRatingData();
        updateSubmitButton();
    }

    // Handle category rating
    function handleCategoryRating(e) {
        const category = e.target.dataset.category;
        const rating = parseInt(e.target.dataset.rating);
        
        ratingData.categories[category] = rating;
        
        const categoryButtons = document.querySelectorAll(`[data-category="${category}"]`);
        highlightStars(categoryButtons, rating);
        
        saveRatingData();
    }

    // Handle category hover
    function handleCategoryHover(e) {
        const category = e.target.dataset.category;
        const rating = parseInt(e.target.dataset.rating);
        
        const categoryButtons = document.querySelectorAll(`[data-category="${category}"]`);
        highlightStars(categoryButtons, rating);
    }

    // Handle tag selection
    function handleTagSelection(e) {
        const tag = e.target.dataset.tag;
        const tagIndex = ratingData.tags.indexOf(tag);
        
        if (tagIndex > -1) {
            // Remove tag
            ratingData.tags.splice(tagIndex, 1);
            e.target.classList.remove('selected');
        } else {
            // Add tag
            ratingData.tags.push(tag);
            e.target.classList.add('selected');
        }
        
        saveRatingData();
    }

    // Handle comment input
    function handleCommentInput(e) {
        ratingData.comment = e.target.value;
        updateCharCounter();
        saveRatingData();
    }

    // Update character counter
    function updateCharCounter() {
        if (!commentTextarea || !charCounter) return;
        
        const length = commentTextarea.value.length;
        const maxLength = 500;
        
        charCounter.textContent = `${length}/${maxLength} caracteres`;
        
        if (length > maxLength) {
            charCounter.classList.add('over-limit');
            commentTextarea.value = commentTextarea.value.substring(0, maxLength);
            charCounter.textContent = `${maxLength}/${maxLength} caracteres`;
        } else {
            charCounter.classList.remove('over-limit');
        }
    }

    // Highlight stars
    function highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Handle submit rating
    function handleSubmitRating() {
        if (ratingData.overall === 0) {
            showMessage('Por favor selecciona una calificación general antes de enviar.', 'error');
            return;
        }

        // Validate minimum requirements
        if (!validateRating()) {
            return;
        }

        // Prepare rating data for submission
        const submissionData = {
            ...ratingData,
            timestamp: new Date().toISOString(),
            submitted: true
        };

        // Save to localStorage (in real app, send to API)
        try {
            localStorage.setItem(`rating_${ratingData.tripId}`, JSON.stringify(submissionData));
            
            // Add to user's rating history
            const ratingHistory = JSON.parse(localStorage.getItem('user_rating_history') || '[]');
            ratingHistory.push(submissionData);
            localStorage.setItem('user_rating_history', JSON.stringify(ratingHistory));

            // Show success and thank you section
            showSuccessMessage();
            showThankYouSection();
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-icon">✅</span>Calificación enviada';
            submitBtn.classList.add('disabled');

        } catch (e) {
            console.error('Error submitting rating:', e);
            showMessage('Error al enviar la calificación. Inténtalo de nuevo.', 'error');
        }
    }

    // Validate rating data
    function validateRating() {
        if (ratingData.overall === 0) {
            showMessage('Debes seleccionar una calificación general.', 'error');
            return false;
        }

        // Check if at least one category is rated
        const hasCategories = Object.values(ratingData.categories).some(rating => rating > 0);
        if (!hasCategories) {
            showMessage('Por favor califica al menos un aspecto específico del viaje.', 'warning');
        }

        return true;
    }

    // Handle rate later
    function handleRateLater() {
        // Save current progress
        saveRatingData();
        
        // Set reminder (in real app, this would schedule a notification)
        const reminderData = {
            tripId: ratingData.tripId,
            driverId: ratingData.driverId,
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        
        localStorage.setItem(`rating_reminder_${ratingData.tripId}`, JSON.stringify(reminderData));
        
        showMessage('Te recordaremos calificar este viaje mañana.', 'success');
        
        // Redirect after a delay
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 2000);
    }

    // Handle report problem
    function handleReportProblem() {
        const confirmed = confirm('¿Quieres reportar un problema con este viaje? Esto abrirá un formulario de reporte.');
        
        if (confirmed) {
            // In a real app, this would open a report form or modal
            showMessage('Función de reporte no implementada en la demo. En la app real, esto abriría un formulario de reporte.', 'info');
        }
    }

    // Show thank you section
    function showThankYouSection() {
        if (thankYouSection) {
            thankYouSection.style.display = 'block';
            thankYouSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Save rating data to localStorage
    function saveRatingData() {
        try {
            localStorage.setItem(`rating_draft_${ratingData.tripId}`, JSON.stringify(ratingData));
        } catch (e) {
            console.error('Error saving rating data:', e);
        }
    }

    // Restore rating UI from saved data
    function restoreRatingUI() {
        // Restore overall rating
        if (ratingData.overall > 0) {
            highlightStars(overallStars, ratingData.overall);
            if (ratingText) {
                ratingText.textContent = ratingTexts[ratingData.overall];
            }
        }

        // Restore category ratings
        Object.keys(ratingData.categories).forEach(category => {
            const rating = ratingData.categories[category];
            if (rating > 0) {
                const categoryButtons = document.querySelectorAll(`[data-category="${category}"]`);
                highlightStars(categoryButtons, rating);
            }
        });

        // Restore comment
        if (ratingData.comment && commentTextarea) {
            commentTextarea.value = ratingData.comment;
            updateCharCounter();
        }

        // Restore selected tags
        ratingData.tags.forEach(tag => {
            const tagElement = document.querySelector(`[data-tag="${tag}"]`);
            if (tagElement) {
                tagElement.classList.add('selected');
            }
        });

        updateSubmitButton();
    }

    // Update submit button state
    function updateSubmitButton() {
        if (submitBtn) {
            if (ratingData.overall > 0) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('disabled');
            } else {
                submitBtn.disabled = true;
                submitBtn.classList.add('disabled');
            }
        }
    }

    // Show success message
    function showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>✅</span>
                <span>¡Calificación enviada exitosamente!</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    // Show general message
    function showMessage(text, type = 'info') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3498db'
        };

        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 4000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRating);
    } else {
        initRating();
    }

    // Export functions for external use
    window.OnepathRating = {
        getRatingData: () => ratingData,
        submitRating: handleSubmitRating
    };

})();
