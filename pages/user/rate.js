// Reviews Page functionality - OnePath
(function() {
    'use strict';

    // Reviews data and state
    let reviewsData = [];
    let filteredReviews = [];
    let currentFilters = {
        rating: '',
        role: '',
        period: ''
    };
    let currentSort = 'newest';

    const ICON_MAP = {
        '🕐': 'schedule',
        '⏰': 'schedule',
        '✅': 'check_circle',
        '✔️': 'check_circle',
        '🚗': 'directions_car',
        '🛣️': 'alt_route',
        '🤝': 'handshake',
        '❤️': 'favorite',
        '💬': 'chat',
        '🛡️': 'verified_user',
        '📝': 'rate_review',
        '👍': 'thumb_up',
        '💡': 'lightbulb',
        '📊': 'insights'
    };

    function toMaterialIcon(value, fallback = 'star') {
        if (!value) return fallback;
        const normalized = value.trim();
        if (ICON_MAP[normalized]) {
            return ICON_MAP[normalized];
        }
        if (/^[a-z_]+$/i.test(normalized)) {
            return normalized;
        }
        return fallback;
    }

    const AVATAR_BASE_PATH = '../../assets/images/avatars/';

    function getAvatarPath(filename) {
        if (!filename) {
            return `${AVATAR_BASE_PATH}default.svg`;
        }
        const trimmed = filename.trim();
        if (trimmed.startsWith('http')) {
            return trimmed;
        }
        if (trimmed.includes('/')) {
            return trimmed;
        }
        return `${AVATAR_BASE_PATH}${trimmed}`;
    }

    // DOM elements
    let reviewsList, reviewCount, ratingFilter, roleFilter, periodFilter, sortSelect;
    let ratingSummary, offerTripBtn, viewTipsBtn;

    // Initialize reviews system
    function initReviews() {
        // Get DOM elements
        reviewsList = document.getElementById('reviewsList');
        reviewCount = document.getElementById('reviewCount');
        ratingFilter = document.getElementById('ratingFilter');
        roleFilter = document.getElementById('roleFilter');
        periodFilter = document.getElementById('periodFilter');
        sortSelect = document.getElementById('sortSelect');
        ratingSummary = document.getElementById('ratingSummary');
        offerTripBtn = document.getElementById('offerTripBtn');
        viewTipsBtn = document.getElementById('viewTipsBtn');

        // Load reviews data
        loadReviewsData();

        // Bind events
        bindEvents();

        // Initial render
        applyFiltersAndSort();
        updateRatingSummary();
    }

    // Load reviews data from localStorage or use mock data
    function loadReviewsData() {
        try {
            const stored = localStorage.getItem('onepath_user_reviews');
            if (stored) {
                reviewsData = normalizeReviews(JSON.parse(stored));
            } else {
                // Use mock data
                reviewsData = normalizeReviews(getMockReviewsData());
                saveReviewsData();
            }
        } catch (e) {
            console.error('Error loading reviews data:', e);
            reviewsData = normalizeReviews(getMockReviewsData());
        }
    }

    // Save reviews data to localStorage
    function saveReviewsData() {
        try {
            localStorage.setItem('onepath_user_reviews', JSON.stringify(reviewsData));
        } catch (e) {
            console.error('Error saving reviews data:', e);
        }
    }

    // Bind event listeners
    function bindEvents() {
        // Filter controls
        if (ratingFilter) {
            ratingFilter.addEventListener('change', handleFilterChange);
        }

        if (roleFilter) {
            roleFilter.addEventListener('change', handleFilterChange);
        }

        if (periodFilter) {
            periodFilter.addEventListener('change', handleFilterChange);
        }

        // Sort control
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSortChange);
        }

        // Action buttons
        if (offerTripBtn) {
            offerTripBtn.addEventListener('click', () => {
                window.location.href = '../../pages/trips/publish.html';
            });
        }

        if (viewTipsBtn) {
            viewTipsBtn.addEventListener('click', () => {
                showTipsModal();
            });
        }

        // Reply buttons (delegated event handling)
        document.addEventListener('click', function(e) {
            if (e.target.matches('.reply-btn')) {
                handleReplyClick(e);
            }
        });

        // Pagination buttons
        document.addEventListener('click', function(e) {
            if (e.target.matches('.pagination-btn:not(.active):not(:disabled)')) {
                handlePaginationClick(e);
            }
        });
    }

    // Handle filter changes
    function handleFilterChange(e) {
        const filterType = e.target.id.replace('Filter', '').toLowerCase();
        currentFilters[filterType] = e.target.value;
        console.log('Filter changed:', filterType, '=', e.target.value);
        console.log('Current filters:', currentFilters);
        applyFiltersAndSort();
    }

    // Handle sort changes
    function handleSortChange(e) {
        currentSort = e.target.value;
        applyFiltersAndSort();
    }

    // Apply filters and sorting
    function applyFiltersAndSort() {
        // Start with all reviews
        filteredReviews = [...reviewsData];
        
        console.log('Total reviews before filter:', filteredReviews.length);

        // Apply rating filter
        if (currentFilters.rating && currentFilters.rating !== '') {
            const ratingValue = parseInt(currentFilters.rating);
            filteredReviews = filteredReviews.filter(review => {
                const reviewRating = parseInt(review.rating) || 0;
                return reviewRating === ratingValue;
            });
            console.log('After rating filter:', filteredReviews.length);
        }

        // Apply role filter
        if (currentFilters.role && currentFilters.role !== '') {
            filteredReviews = filteredReviews.filter(review => 
                review.role === currentFilters.role
            );
            console.log('After role filter:', filteredReviews.length);
        }

        // Apply period filter
        if (currentFilters.period && currentFilters.period !== '') {
            const now = new Date();
            const filterDate = new Date();
            
            switch (currentFilters.period) {
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    filterDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filteredReviews = filteredReviews.filter(review => {
                const reviewDate = new Date(review.date);
                return reviewDate >= filterDate;
            });
            console.log('After period filter:', filteredReviews.length);
        }

        // Apply sorting
        filteredReviews.sort((a, b) => {
            switch (currentSort) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'highest':
                    return b.rating - a.rating;
                case 'lowest':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        console.log('Final filtered reviews:', filteredReviews.length);

        // Update UI
        renderReviews();
        updateReviewCount();
    }

    // Render reviews list
    function renderReviews() {
        if (!reviewsList) return;

        if (filteredReviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="no-reviews">
                    <div class="no-reviews-icon"><span class="material-icons">rate_review</span></div>
                    <h3>No se encontraron reseñas</h3>
                    <p>Intenta ajustar los filtros para ver más resultados.</p>
                </div>
            `;
            return;
        }

        reviewsList.innerHTML = filteredReviews.map(review => createReviewHTML(review)).join('');
    }

    // Create HTML for a single review
    function createReviewHTML(review) {
        const ratingValue = Number(review.rating) || 0;
        const starsHTML = Array.from({ length: 5 }, (_, i) => {
            const filled = i < ratingValue;
            const iconName = filled ? 'star' : 'star_outline';
            return `<span class="material-icons star ${filled ? 'filled' : ''}">${iconName}</span>`;
        }).join('');

        const roleClass = review.role === 'driver' ? 'driver' : 'passenger';
        const roleText = review.role === 'driver' ? 'Como Conductor/a' : 'Como Pasajero/a';
        const highlightIcon = toMaterialIcon(review.highlight?.icon, 'grade');
        const ratingDisplay = ratingValue.toFixed(1);
        const helpfulCount = Number(review.helpful || 0);
        const highlightHTML = review.highlight && review.highlight.text ? `
                        <span class="highlight-tag">
                            <span class="material-icons tag-icon">${highlightIcon}</span>
                            ${review.highlight.text}
                        </span>` : '';
        const avatarSrc = getAvatarPath(review.avatar);
        const fallbackAvatar = getAvatarPath('default.svg');

        return `
            <div class="review-card" data-rating="${review.rating}" data-role="${review.role}" data-date="${review.date}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${avatarSrc}" alt="${review.name}" class="reviewer-avatar" onerror="this.onerror=null;this.src='${fallbackAvatar}'">
                        <div class="reviewer-details">
                            <h4 class="reviewer-name">${review.name}</h4>
                            <p class="reviewer-career">${review.career}</p>
                            <div class="review-rating">
                                <div class="stars">${starsHTML}</div>
                                    <span class="rating-value">${ratingDisplay}</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-meta">
                        <span class="role-badge ${roleClass}">${roleText}</span>
                        <p class="review-date">${formatDate(review.date)}</p>
                    </div>
                </div>
                <div class="review-content">
                    <p class="review-text">"${review.comment}"</p>
                    <div class="trip-info">
                        <span class="material-icons trip-icon">alt_route</span>
                        <span class="trip-route">${review.route} • S/ ${review.price}</span>
                    </div>
                </div>
                <div class="review-footer">
                    <div class="review-stats">
                        <span class="helpful-count">
                            <span class="material-icons helpful-icon">thumb_up</span>
                            Útil (${helpfulCount})
                        </span>
                        ${highlightHTML}
                    </div>
                    <button class="reply-btn" data-review-id="${review.id}">Responder</button>
                </div>
            </div>
        `;
    }

    // Update review count
    function updateReviewCount() {
        if (reviewCount) {
            reviewCount.textContent = filteredReviews.length;
        }
    }

    // Update rating summary
    function updateRatingSummary() {
        if (!ratingSummary || reviewsData.length === 0) return;

        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviewsData.length).toFixed(1);
        const totalReviews = reviewsData.length;

        const ratingScore = ratingSummary.querySelector('.rating-score');
        const reviewCountEl = ratingSummary.querySelector('.review-count');

        if (ratingScore) {
            ratingScore.textContent = averageRating;
        }

        if (reviewCountEl) {
            reviewCountEl.textContent = `${totalReviews} reseñas`;
        }

        const starsContainer = ratingSummary.querySelector('.stars');
        if (starsContainer) {
            const filledStars = Math.round(averageRating);
            starsContainer.innerHTML = Array.from({ length: 5 }, (_, i) => {
                const filled = i < filledStars;
                const iconName = filled ? 'star' : 'star_outline';
                return `<span class="material-icons star ${filled ? 'filled' : ''}">${iconName}</span>`;
            }).join('');
        }
    }

    // Handle reply button clicks
    function handleReplyClick(e) {
        const reviewId = e.target.dataset.reviewId;
        const review = reviewsData.find(r => r.id == reviewId);
        
        if (review) {
            showReplyModal(review);
        }
    }

    // Handle pagination clicks
    function handlePaginationClick(e) {
        const button = e.target.closest('.pagination-btn');
        
        // Remove active class from all buttons
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // In a real app, this would load the appropriate page
        showMessage('Navegación de páginas no implementada en la demo.', 'info');
    }

    // Show reply modal
    function showReplyModal(review) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Responder a ${review.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="original-review">
                        <p><strong>Reseña original:</strong></p>
                        <p>"${review.comment}"</p>
                    </div>
                    <div class="reply-form">
                        <label for="replyText">Tu respuesta:</label>
                        <textarea id="replyText" rows="4" placeholder="Escribe tu respuesta..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-cancel">Cancelar</button>
                    <button class="btn-primary modal-send">Enviar Respuesta</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind modal events
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-send').addEventListener('click', () => {
            const replyText = modal.querySelector('#replyText').value.trim();
            if (replyText) {
                // In a real app, this would send the reply to the server
                showMessage('Respuesta enviada exitosamente.', 'success');
                document.body.removeChild(modal);
            } else {
                showMessage('Por favor escribe una respuesta.', 'error');
            }
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Show tips modal
    function showTipsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Consejos para Mejorar tu Calificación</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tips-list">
                        <div class="tip-item">
                            <div class="tip-icon"><span class="material-icons">schedule</span></div>
                            <div class="tip-content">
                                <h4>Sé Puntual</h4>
                                <p>Llega siempre a tiempo y avisa si hay algún retraso.</p>
                            </div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon"><span class="material-icons">directions_car</span></div>
                            <div class="tip-content">
                                <h4>Mantén tu Vehículo Limpio</h4>
                                <p>Un auto limpio y en buen estado genera confianza.</p>
                            </div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon"><span class="material-icons">chat</span></div>
                            <div class="tip-content">
                                <h4>Comunícate Bien</h4>
                                <p>Mantén una comunicación clara antes y durante el viaje.</p>
                            </div>
                        </div>
                        <div class="tip-item">
                            <div class="tip-icon"><span class="material-icons">verified_user</span></div>
                            <div class="tip-content">
                                <h4>Conduce Seguro</h4>
                                <p>Respeta las normas de tránsito y conduce con precaución.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary modal-close">Entendido</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind close events
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    }

    // Show message notification
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

    function normalizeReviewEntry(review) {
        if (!review || typeof review !== 'object') return review;

        return {
            ...review,
            rating: Number(review.rating) || 0,
            helpful: Number(review.helpful) || 0,
            avatar: review.avatar || '',
            highlight: review.highlight ? {
                ...review.highlight,
                icon: toMaterialIcon(review.highlight.icon, 'grade')
            } : null
        };
    }

    function normalizeReviews(data) {
        return Array.isArray(data) ? data.map(normalizeReviewEntry) : [];
    }

    // Get mock reviews data
    function getMockReviewsData() {
        return [
            {
                id: 1,
                name: 'Carlos Mendoza',
                career: 'Estudiante de Ingeniería',
                avatar: 'carlos.svg',
                rating: 5,
                role: 'driver',
                date: '2025-10-02',
                comment: 'María es una excelente conductora. Muy puntual, amable y su auto siempre está limpio. El viaje fue muy cómodo y llegamos a tiempo a la universidad. La conversación durante el trayecto fue muy agradable y me sentí muy seguro. Definitivamente la recomiendo a otros estudiantes.',
                route: 'San Isidro → UNMSM',
                price: 8,
                helpful: 3,
                highlight: { icon: 'schedule', text: 'Puntualidad: Excelente' }
            },
            {
                id: 2,
                name: 'Ana López',
                career: 'Estudiante de Medicina',
                avatar: 'ana.svg',
                rating: 5,
                role: 'passenger',
                date: '2025-09-28',
                comment: 'Excelente pasajera. María fue muy respetuosa y puntual. La conversación fue muy agradable durante el viaje y se adaptó perfectamente a las reglas del auto. Es una persona muy educada y responsable. Sin duda la invitaría de nuevo a mis viajes.',
                route: 'Miraflores → UNMSM',
                price: 7,
                helpful: 2,
                highlight: { icon: 'check_circle', text: 'Comportamiento: Excelente' }
            },
            {
                id: 3,
                name: 'Diego Martínez',
                career: 'Estudiante de Economía',
                avatar: 'miguel.svg',
                rating: 4,
                role: 'driver',
                date: '2025-09-25',
                comment: 'Buen viaje en general. María maneja con cuidado y es muy responsable. Solo llegamos un poco tarde por el tráfico intenso, pero no fue culpa suya. El auto está en buenas condiciones y la música estuvo bien. La recomiendo.',
                route: 'San Isidro → UNMSM',
                price: 8,
                helpful: 1,
                highlight: { icon: 'directions_car', text: 'Manejo: Muy bueno' }
            },
            {
                id: 4,
                name: 'Luis García',
                career: 'Estudiante de Derecho',
                avatar: 'roberto.svg',
                rating: 5,
                role: 'passenger',
                date: '2025-09-20',
                comment: 'María es una pasajera modelo. Siempre está lista a la hora acordada, es muy respetuosa con el vehículo y las reglas. Además, es muy buena compañía durante el viaje. Totalmente recomendada para otros conductores.',
                route: 'Surco → UNMSM',
                price: 10,
                helpful: 4,
                highlight: { icon: 'handshake', text: 'Respeto: Excelente' }
            },
            {
                id: 5,
                name: 'Sofía Ruiz',
                career: 'Estudiante de Psicología',
                avatar: 'ana.svg',
                rating: 5,
                role: 'driver',
                date: '2025-09-18',
                comment: 'Increíble experiencia con María. Es súper puntual, muy amable y hace que el viaje sea muy placentero. Su auto está impecable y maneja muy bien. Me ayudó mucho durante mis primeras semanas en la universidad. ¡Gracias!',
                route: 'San Isidro → UNMSM',
                price: 8,
                helpful: 5,
                highlight: { icon: 'favorite', text: 'Amabilidad: Excelente' }
            }
        ];
    }

    // Add modal styles to document
    function addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 1rem;
            }

            .modal-content {
                background-color: white;
                border-radius: 0.5rem;
                max-width: 500px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-light);
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text);
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-light);
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-body {
                padding: 1.5rem;
            }

            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                padding: 1.5rem;
                border-top: 1px solid var(--border-light);
            }

            .original-review {
                background-color: var(--gray-50);
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 1rem;
            }

            .reply-form label {
                display: block;
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: var(--text);
            }

            .reply-form textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-light);
                border-radius: 0.375rem;
                font-family: inherit;
                resize: vertical;
            }

            .tips-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .tip-item {
                display: flex;
                gap: 1rem;
                align-items: flex-start;
            }

            .tip-icon {
                flex-shrink: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: var(--primary-blue);
            }

            .tip-icon .material-icons {
                font-size: 1.5rem;
            }

            .tip-content h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1rem;
                font-weight: 600;
                color: var(--text);
            }

            .tip-content p {
                margin: 0;
                color: var(--text-light);
                font-size: 0.875rem;
            }

            .no-reviews {
                text-align: center;
                padding: 3rem 1rem;
                color: var(--text-light);
            }

            .no-reviews-icon {
                margin-bottom: 1rem;
                color: var(--primary-blue);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .no-reviews-icon .material-icons {
                font-size: 3rem;
            }

            .no-reviews h3 {
                margin: 0 0 0.5rem 0;
                color: var(--text);
            }

            .no-reviews p {
                margin: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addModalStyles();
            initReviews();
        });
    } else {
        addModalStyles();
        initReviews();
    }

    // Export functions for external use
    window.OnepathReviews = {
        addReview: function(reviewData) {
            reviewsData.unshift(reviewData);
            saveReviewsData();
            applyFiltersAndSort();
            updateRatingSummary();
        },
        getReviews: () => reviewsData,
        refreshReviews: applyFiltersAndSort
    };

})();
