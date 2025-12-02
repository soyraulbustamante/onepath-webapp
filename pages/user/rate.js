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
    let reputationView = 'all';
    
    // Advanced reputation features state
    let reputationHistory = [];
    let verificationData = {
        identity: false,
        drivingLicense: false,
        firstAid: false,
        defensiveDriving: false,
        socialMedia: false,
        university: false
    };
    let securityHistory = [];
    let reputationPrediction = null;
    let dashboardMetrics = {};
    let chartInstances = {};

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
    let repAllBtn, repDriverBtn, repPassengerBtn, reputationLabelEl;
    
    // Advanced dashboard elements
    let dashboardContainer, metricsContainer, chartsContainer, verificationContainer;
    let predictionContainer, historyContainer, securityContainer, certificationsContainer;
    let reputationChart, trendsChart, comparisonChart, predictionChart;

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
        repAllBtn = document.getElementById('repAllBtn');
        repDriverBtn = document.getElementById('repDriverBtn');
        repPassengerBtn = document.getElementById('repPassengerBtn');
        reputationLabelEl = document.getElementById('reputationLabel');

        // Load reviews data
        loadReviewsData();

        // Bind events
        bindEvents();

        // Initialize advanced features
        initAdvancedDashboard();
        loadAdvancedData();
        
        // Initial render
        applyFiltersAndSort();
        updateRatingSummary();
        updateAdvancedMetrics();
        renderVerificationStatus();
        generateReputationPrediction();
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

        // Reputation view buttons
        if (repAllBtn) {
            repAllBtn.addEventListener('click', () => changeReputationView('all'));
        }
        if (repDriverBtn) {
            repDriverBtn.addEventListener('click', () => changeReputationView('driver'));
        }
        if (repPassengerBtn) {
            repPassengerBtn.addEventListener('click', () => changeReputationView('passenger'));
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

    // Handle reputation view changes
    function changeReputationView(view) {
        reputationView = view;

        if (repAllBtn && repDriverBtn && repPassengerBtn) {
            repAllBtn.classList.toggle('active', view === 'all');
            repDriverBtn.classList.toggle('active', view === 'driver');
            repPassengerBtn.classList.toggle('active', view === 'passenger');
        }

        updateRatingSummary();
    }

    // Handle filter changes
    function handleFilterChange(e) {
        const filterType = e.target.id.replace('Filter', '').toLowerCase();
        currentFilters[filterType] = e.target.value;
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

        // Apply rating filter
        if (currentFilters.rating && currentFilters.rating !== '') {
            const ratingValue = parseInt(currentFilters.rating);
            filteredReviews = filteredReviews.filter(review => {
                const reviewRating = parseInt(review.rating) || 0;
                return reviewRating === ratingValue;
            });
        }

        // Apply role filter
        if (currentFilters.role && currentFilters.role !== '') {
            filteredReviews = filteredReviews.filter(review => 
                review.role === currentFilters.role
            );
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

    // Update rating summary (reputación)
    function updateRatingSummary() {
        if (!ratingSummary || reviewsData.length === 0) {
            if (reputationLabelEl) {
                reputationLabelEl.textContent = 'Aún no tienes reseñas suficientes para calcular tu reputación.';
            }
            return;
        }

        let dataForView = reviewsData;
        if (reputationView === 'driver') {
            dataForView = reviewsData.filter(r => r.role === 'driver');
        } else if (reputationView === 'passenger') {
            dataForView = reviewsData.filter(r => r.role === 'passenger');
        }

        if (dataForView.length === 0) {
            if (reputationLabelEl) {
                if (reputationView === 'driver') {
                    reputationLabelEl.textContent = 'Aún no tienes reseñas como conductor/a.';
                } else if (reputationView === 'passenger') {
                    reputationLabelEl.textContent = 'Aún no tienes reseñas como pasajero/a.';
                } else {
                    reputationLabelEl.textContent = 'Aún no tienes reseñas.';
                }
            }
            const ratingScoreEmpty = ratingSummary.querySelector('.rating-score');
            const reviewCountEmpty = ratingSummary.querySelector('.review-count');
            const starsContainerEmpty = ratingSummary.querySelector('.stars');

            if (ratingScoreEmpty) ratingScoreEmpty.textContent = '0.0';
            if (reviewCountEmpty) reviewCountEmpty.textContent = '0 reseñas';
            if (starsContainerEmpty) {
                starsContainerEmpty.innerHTML = Array.from({ length: 5 }, () =>
                    '<span class="material-icons star">star_outline</span>'
                ).join('');
            }
            return;
        }

        const totalRating = dataForView.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / dataForView.length).toFixed(1);
        const totalReviews = dataForView.length;

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

        if (reputationLabelEl) {
            const avgNum = parseFloat(averageRating);
            let nivel = 'Reputación general';
            if (reputationView === 'driver') {
                nivel = 'Reputación como conductor/a';
            } else if (reputationView === 'passenger') {
                nivel = 'Reputación como pasajero/a';
            }

            let textoCalidad = '';
            if (avgNum >= 4.8) {
                textoCalidad = 'Excelente';
            } else if (avgNum >= 4.5) {
                textoCalidad = 'Muy buena';
            } else if (avgNum >= 4.0) {
                textoCalidad = 'Buena';
            } else if (avgNum >= 3.0) {
                textoCalidad = 'Aceptable';
            } else {
                textoCalidad = 'En proceso de mejora';
            }

            reputationLabelEl.textContent = `${nivel}: ${textoCalidad}`;
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

            .reputation-view-toggle {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.75rem;
            }

            .rep-view-btn {
                border: 1px solid var(--border-light);
                background-color: white;
                border-radius: 999px;
                padding: 0.25rem 0.75rem;
                font-size: 0.8rem;
                cursor: pointer;
                color: var(--text-light);
            }

            .rep-view-btn.active {
                background-color: var(--primary-blue);
                border-color: var(--primary-blue);
                color: #fff;
            }

            .reputation-label {
                margin-top: 0.5rem;
                font-size: 0.9rem;
                color: var(--text-light);
            }
        `;
        document.head.appendChild(style);
    }

    // Advanced Dashboard Functions
    
    // Initialize advanced dashboard components
    function initAdvancedDashboard() {
        // Get advanced dashboard elements
        dashboardContainer = document.getElementById('advancedDashboard');
        metricsContainer = document.getElementById('metricsContainer');
        chartsContainer = document.getElementById('chartsContainer');
        verificationContainer = document.getElementById('verificationContainer');
        predictionContainer = document.getElementById('predictionContainer');
        historyContainer = document.getElementById('historyContainer');
        securityContainer = document.getElementById('securityContainer');
        certificationsContainer = document.getElementById('certificationsContainer');
        
        // Create dashboard if it doesn't exist
        if (!dashboardContainer) {
            createAdvancedDashboard();
        }
        
        // Initialize charts
        initializeCharts();
        
        // Bind advanced events
        bindAdvancedEvents();
    }
    
    // Load advanced data from localStorage or generate mock data
    function loadAdvancedData() {
        try {
            // Load reputation history
            const storedHistory = localStorage.getItem('onepath_reputation_history');
            if (storedHistory) {
                reputationHistory = JSON.parse(storedHistory);
            } else {
                reputationHistory = generateMockReputationHistory();
                localStorage.setItem('onepath_reputation_history', JSON.stringify(reputationHistory));
            }
            
            // Load verification data
            const storedVerification = localStorage.getItem('onepath_verification_data');
            if (storedVerification) {
                verificationData = { ...verificationData, ...JSON.parse(storedVerification) };
            } else {
                verificationData = generateMockVerificationData();
                localStorage.setItem('onepath_verification_data', JSON.stringify(verificationData));
            }
            
            // Load security history
            const storedSecurity = localStorage.getItem('onepath_security_history');
            if (storedSecurity) {
                securityHistory = JSON.parse(storedSecurity);
            } else {
                securityHistory = generateMockSecurityHistory();
                localStorage.setItem('onepath_security_history', JSON.stringify(securityHistory));
            }
            
        } catch (error) {
            console.error('Error loading advanced data:', error);
            // Generate mock data as fallback
            reputationHistory = generateMockReputationHistory();
            verificationData = generateMockVerificationData();
            securityHistory = generateMockSecurityHistory();
        }
    }
    
    // Create advanced dashboard HTML structure
    function createAdvancedDashboard() {
        const mainContent = document.querySelector('.main-content .container');
        if (!mainContent) return;
        
        const dashboardHTML = `
            <section class="advanced-dashboard" id="advancedDashboard">
                <div class="dashboard-header">
                    <h2>Dashboard de Reputación Avanzado</h2>
                    <div class="dashboard-controls">
                        <button class="dashboard-toggle" id="toggleDashboard" title="Mostrar/Ocultar Dashboard">
                            <span class="material-icons">dashboard</span>
                        </button>
                    </div>
                </div>
                
                <div class="dashboard-content" id="dashboardContent">
                    <!-- Metrics Overview -->
                    <div class="metrics-section" id="metricsContainer">
                        <h3>Métricas Detalladas</h3>
                        <div class="metrics-grid" id="metricsGrid">
                            <!-- Metrics will be populated by JavaScript -->
                        </div>
                    </div>
                    
                    <!-- Interactive Charts -->
                    <div class="charts-section" id="chartsContainer">
                        <h3>Análisis Visual</h3>
                        <div class="charts-grid">
                            <div class="chart-container">
                                <h4>Evolución de Reputación</h4>
                                <canvas id="reputationChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Tendencias por Período</h4>
                                <canvas id="trendsChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Comparación Temporal</h4>
                                <canvas id="comparisonChart" width="400" height="200"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Predicción de Reputación</h4>
                                <canvas id="predictionChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Verification and Trust System -->
                    <div class="verification-section" id="verificationContainer">
                        <h3>Sistema de Verificación y Confianza</h3>
                        <div class="verification-grid">
                            <div class="verification-card" id="identityVerification">
                                <h4>Verificación de Identidad</h4>
                                <div class="verification-content" id="identityContent">
                                    <!-- Content populated by JavaScript -->
                                </div>
                            </div>
                            <div class="verification-card" id="certificationsCard">
                                <h4>Certificaciones</h4>
                                <div class="certifications-content" id="certificationsContent">
                                    <!-- Content populated by JavaScript -->
                                </div>
                            </div>
                            <div class="verification-card" id="securityCard">
                                <h4>Historial de Seguridad</h4>
                                <div class="security-content" id="securityContent">
                                    <!-- Content populated by JavaScript -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reputation Prediction -->
                    <div class="prediction-section" id="predictionContainer">
                        <h3>Predicción de Reputación</h3>
                        <div class="prediction-content" id="predictionContent">
                            <!-- Content populated by JavaScript -->
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Insert dashboard after the page header
        const pageHeader = mainContent.querySelector('.page-header');
        if (pageHeader) {
            pageHeader.insertAdjacentHTML('afterend', dashboardHTML);
        }
    }
    
    // Initialize charts using Chart.js simulation (mock implementation)
    function initializeCharts() {
        // Simulate Chart.js initialization
        // In a real implementation, you would use Chart.js library
        console.log('Initializing charts...');
        
        // Create mock chart canvases
        setTimeout(() => {
            createMockCharts();
        }, 100);
    }
    
    // Create mock charts with canvas drawing
    function createMockCharts() {
        const chartIds = ['reputationChart', 'trendsChart', 'comparisonChart', 'predictionChart'];
        
        chartIds.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                drawMockChart(ctx, canvas.width, canvas.height, chartId);
            }
        });
    }
    
    // Draw mock chart data
    function drawMockChart(ctx, width, height, chartType) {
        ctx.clearRect(0, 0, width, height);
        
        // Set up chart styling
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // Draw chart based on type
        switch (chartType) {
            case 'reputationChart':
                drawReputationEvolution(ctx, width, height);
                break;
            case 'trendsChart':
                drawTrendsChart(ctx, width, height);
                break;
            case 'comparisonChart':
                drawComparisonChart(ctx, width, height);
                break;
            case 'predictionChart':
                drawPredictionChart(ctx, width, height);
                break;
        }
    }
    
    // Draw reputation evolution chart
    function drawReputationEvolution(ctx, width, height) {
        const data = reputationHistory.slice(-12); // Last 12 months
        if (data.length === 0) return;
        
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const stepX = width / (data.length - 1);
        const maxRating = 5;
        
        data.forEach((point, index) => {
            const x = index * stepX;
            const y = height - (point.rating / maxRating) * (height - 40) - 20;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Draw data points
            ctx.fillStyle = '#007bff';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        data.forEach((point, index) => {
            const x = index * stepX;
            ctx.fillText(point.rating.toFixed(1), x, height - 5);
        });
    }
    
    // Draw trends chart
    function drawTrendsChart(ctx, width, height) {
        const periods = ['1M', '3M', '6M', '1A'];
        const values = [4.8, 4.7, 4.6, 4.5];
        
        ctx.fillStyle = '#28a745';
        const barWidth = width / periods.length - 20;
        
        periods.forEach((period, index) => {
            const x = index * (width / periods.length) + 10;
            const barHeight = (values[index] / 5) * (height - 40);
            const y = height - barHeight - 20;
            
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Labels
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(period, x + barWidth / 2, height - 5);
            ctx.fillText(values[index].toFixed(1), x + barWidth / 2, y - 5);
            
            ctx.fillStyle = '#28a745';
        });
    }
    
    // Draw comparison chart
    function drawComparisonChart(ctx, width, height) {
        const categories = ['Conductor', 'Pasajero', 'General'];
        const currentValues = [4.9, 4.7, 4.8];
        const previousValues = [4.6, 4.5, 4.5];
        
        const barWidth = (width / categories.length) / 3;
        
        categories.forEach((category, index) => {
            const baseX = index * (width / categories.length) + 20;
            
            // Current period bar
            ctx.fillStyle = '#007bff';
            const currentHeight = (currentValues[index] / 5) * (height - 40);
            ctx.fillRect(baseX, height - currentHeight - 20, barWidth, currentHeight);
            
            // Previous period bar
            ctx.fillStyle = '#6c757d';
            const previousHeight = (previousValues[index] / 5) * (height - 40);
            ctx.fillRect(baseX + barWidth + 5, height - previousHeight - 20, barWidth, previousHeight);
            
            // Labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(category, baseX + barWidth, height - 5);
        });
    }
    
    // Draw prediction chart
    function drawPredictionChart(ctx, width, height) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const historical = [4.5, 4.6, 4.7, 4.8];
        const predicted = [4.8, 4.9, 5.0];
        
        const stepX = width / (months.length - 1);
        
        // Historical data
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        historical.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 5) * (height - 40) - 20;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Predicted data (dashed line)
        ctx.strokeStyle = '#ffc107';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        const startX = (historical.length - 1) * stepX;
        const startY = height - (historical[historical.length - 1] / 5) * (height - 40) - 20;
        ctx.moveTo(startX, startY);
        
        predicted.forEach((value, index) => {
            const x = (historical.length + index) * stepX;
            const y = height - (value / 5) * (height - 40) - 20;
            ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
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

    // Mock data generation functions
    
    // Generate mock reputation history
    function generateMockReputationHistory() {
        const history = [];
        const currentDate = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            
            // Generate realistic rating progression
            const baseRating = 4.2 + (Math.random() * 0.6);
            const progressionFactor = (11 - i) * 0.02; // Gradual improvement
            const rating = Math.min(5.0, baseRating + progressionFactor + (Math.random() * 0.2 - 0.1));
            
            history.push({
                date: date.toISOString(),
                rating: parseFloat(rating.toFixed(1)),
                reviewCount: Math.floor(Math.random() * 5) + 1,
                period: date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
            });
        }
        
        return history;
    }
    
    // Generate mock verification data
    function generateMockVerificationData() {
        // Simulate partial verification for realistic scenario
        return {
            identity: Math.random() > 0.3, // 70% chance verified
            drivingLicense: Math.random() > 0.4, // 60% chance verified
            firstAid: Math.random() > 0.7, // 30% chance verified
            defensiveDriving: Math.random() > 0.8, // 20% chance verified
            socialMedia: Math.random() > 0.5, // 50% chance verified
            university: Math.random() > 0.2 // 80% chance verified
        };
    }
    
    // Generate mock security history
    function generateMockSecurityHistory() {
        // Most users should have clean history
        if (Math.random() > 0.8) {
            return []; // 80% chance of clean history
        }
        
        const incidents = [];
        const incidentTypes = [
            { type: 'Reporte de Retraso', severity: 'Bajo' },
            { type: 'Queja de Comportamiento', severity: 'Medio' },
            { type: 'Problema de Comunicación', severity: 'Bajo' },
            { type: 'Incidente de Tráfico Menor', severity: 'Medio' }
        ];
        
        const numIncidents = Math.floor(Math.random() * 2) + 1; // 1-2 incidents
        
        for (let i = 0; i < numIncidents; i++) {
            const incident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
            const date = new Date();
            date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
            
            incidents.push({
                ...incident,
                date: date.toISOString(),
                status: Math.random() > 0.3 ? 'Resuelto' : 'En Revisión',
                id: `INC-${Date.now()}-${i}`
            });
        }
        
        return incidents;
    }
    
    // Export functions for external use
})();
