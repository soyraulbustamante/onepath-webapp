// Profile Page JavaScript - OnePath
(function() {
    'use strict';

    // Mock user data for different users
    const mockUsers = {
        'maria.gonzalez@unmsm.edu.pe': {
            id: 1,
            name: 'María González Pérez',
            email: 'maria.gonzalez@unmsm.edu.pe',
            phone: '+51 987 654 321',
            birthdate: '15 de Marzo, 1999',
            university: 'Universidad Nacional Mayor de San Marcos',
            major: 'Administración de Empresas',
            role: 'driver',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            rating: 4.8,
            totalTrips: 23,
            totalReviews: 15,
            bio: '¡Hola! Soy María, estudiante de Administración en la UNMSM. Me encanta conocer gente nueva y hacer que los viajes a la universidad sean más divertidos y económicos.',
            interests: ['Música', 'Lectura', 'Deportes', 'Viajes'],
            vehicle: {
                make: 'Honda',
                model: 'Civic',
                year: 2020,
                color: 'Blanco',
                plate: 'ABC-123',
                seats: 4,
                image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/112490cd10-54f7bdee4a08eadacf39.png'
            }
        },
        'carlos.mendoza@uni.edu.pe': {
            id: 2,
            name: 'Carlos Mendoza Silva',
            email: 'carlos.mendoza@uni.edu.pe',
            phone: '+51 987 123 456',
            birthdate: '22 de Julio, 1998',
            university: 'Universidad Nacional de Ingeniería',
            major: 'Ingeniería de Sistemas',
            role: 'driver',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            rating: 4.9,
            totalTrips: 31,
            totalReviews: 28,
            bio: 'Estudiante de Ingeniería de Sistemas en la UNI. Conductor responsable con más de 2 años de experiencia.',
            interests: ['Tecnología', 'Gaming', 'Música', 'Programación'],
            vehicle: {
                make: 'Volkswagen',
                model: 'Golf',
                year: 2019,
                color: 'Gris',
                plate: 'DEF-456',
                seats: 4,
                image: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/vw-golf-2019.png'
            }
        },
        'ana.rodriguez@pucp.edu.pe': {
            id: 3,
            name: 'Ana Rodríguez López',
            email: 'ana.rodriguez@pucp.edu.pe',
            phone: '+51 987 789 123',
            birthdate: '10 de Diciembre, 1999',
            university: 'Pontificia Universidad Católica del Perú',
            major: 'Derecho',
            role: 'passenger',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            rating: 4.7,
            totalTrips: 18,
            totalReviews: 12,
            bio: 'Estudiante de Derecho en la PUCP. Me gusta viajar de manera segura y conocer nuevas personas.',
            interests: ['Lectura', 'Cine', 'Arte', 'Historia'],
            vehicle: null
        }
    };

    let currentUser = null;

    // Initialize page
    function init() {
        currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = '../../pages/auth/login.html';
            return;
        }

        loadUserProfile();
        setupEventListeners();
        setupTabs();
    }

    function getCurrentUser() {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.email) {
                return mockUsers[user.email] || user;
            }
        } catch (e) {
            console.error('Error getting user:', e);
        }
        return null;
    }

    function loadUserProfile() {
        if (!currentUser) return;

        // Update hero section
        document.getElementById('profileAvatar').src = currentUser.avatar;
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileInfo').textContent = `Estudiante de ${currentUser.major}`;
        document.getElementById('userRating').textContent = currentUser.rating;
        document.getElementById('totalTrips').textContent = currentUser.totalTrips;
        document.getElementById('totalReviews').textContent = currentUser.totalReviews;

        // Update personal information
        document.getElementById('fullName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userPhone').textContent = currentUser.phone;
        document.getElementById('userBirthdate').textContent = currentUser.birthdate;
        document.getElementById('userUniversity').textContent = currentUser.university;
        document.getElementById('userMajor').textContent = currentUser.major;

        // Update bio and interests
        document.getElementById('userBio').textContent = currentUser.bio;
        
        const interestsContainer = document.getElementById('userInterests');
        interestsContainer.innerHTML = '';
        currentUser.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'interest-tag';
            tag.textContent = interest;
            interestsContainer.appendChild(tag);
        });

        // Show/hide vehicle tab based on role
        const vehicleTab = document.getElementById('vehicleTab');
        if (currentUser.role === 'passenger') {
            vehicleTab.style.display = 'none';
        }

        loadQuickActions();
        loadTripStats();
        loadRecentTrips();
        loadReviews();
        loadVehicleInfo();
        loadSettings();
        loadSidebarContent();
    }

    function loadQuickActions() {
        const container = document.getElementById('quickActions');
        const isDriver = currentUser.role === 'driver';
        
        container.innerHTML = isDriver ? `
            <a href="../trips/publish.html" class="quick-action-btn primary">
                <span>📝</span> Publicar Viaje
            </a>
            <a href="../trips/my-trips.html" class="quick-action-btn secondary">
                <span>🚗</span> Mis Viajes
            </a>
            <a href="../chat/messages.html" class="quick-action-btn secondary">
                <span>💬</span> Mensajes
            </a>
        ` : `
            <a href="../trips/search.html" class="quick-action-btn primary">
                <span>🔍</span> Buscar Viaje
            </a>
            <a href="../reservations/my-reservations.html" class="quick-action-btn secondary">
                <span>📅</span> Mis Reservas
            </a>
            <a href="../chat/messages.html" class="quick-action-btn secondary">
                <span>💬</span> Mensajes
            </a>
        `;
    }

    function loadTripStats() {
        const stats = {
            tripsAsDriver: currentUser.role === 'driver' ? 12 : 0,
            tripsAsPassenger: currentUser.role === 'passenger' ? 18 : 11,
            punctualityRate: '98%',
            totalSavings: 'S/ 184'
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = stats[key];
            }
        });
    }

    function loadRecentTrips() {
        const mockTrips = [
            {
                type: 'driver',
                route: 'San Isidro → UNMSM',
                date: 'Lunes, 30 Sep 2025 - 07:30',
                amount: '+S/ 16',
                participants: '2 pasajeros'
            },
            {
                type: 'passenger',
                route: 'Miraflores → UNMSM',
                date: 'Viernes, 27 Sep 2025 - 08:00',
                amount: '-S/ 7',
                participants: 'Con Carlos M.'
            }
        ];

        const container = document.getElementById('recentTripsList');
        container.innerHTML = mockTrips.map(trip => `
            <div class="trip-item">
                <div class="trip-info">
                    <div class="trip-type-icon ${trip.type}">
                        ${trip.type === 'driver' ? '🚗' : '👤'}
                    </div>
                    <div class="trip-details">
                        <h3>Como ${trip.type === 'driver' ? 'Conductora' : 'Pasajera'}</h3>
                        <p>${trip.route}</p>
                        <p>${trip.date}</p>
                    </div>
                </div>
                <div class="trip-amount">
                    <div class="amount ${trip.amount.includes('+') ? 'positive' : 'negative'}">${trip.amount}</div>
                    <div class="participants">${trip.participants}</div>
                </div>
            </div>
        `).join('');
    }

    function loadReviews() {
        // Rating distribution
        const distribution = [
            { stars: 5, count: 12, percentage: 80 },
            { stars: 4, count: 3, percentage: 20 },
            { stars: 3, count: 0, percentage: 0 },
            { stars: 2, count: 0, percentage: 0 },
            { stars: 1, count: 0, percentage: 0 }
        ];

        const distributionContainer = document.getElementById('ratingDistribution');
        distributionContainer.innerHTML = distribution.map(item => `
            <div class="distribution-bar">
                <span class="distribution-label">${item.stars}★</span>
                <div class="distribution-progress">
                    <div class="distribution-fill" style="width: ${item.percentage}%"></div>
                </div>
                <span class="distribution-count">${item.count}</span>
            </div>
        `).join('');

        // Recent reviews
        const mockReviews = [
            {
                reviewer: 'Carlos M.',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
                rating: 5,
                text: 'María es una excelente conductora. Muy puntual, amable y su auto siempre está limpio.',
                role: 'pasajero',
                time: 'Hace 2 días'
            },
            {
                reviewer: 'Ana L.',
                avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
                rating: 5,
                text: 'Excelente pasajera. María fue muy respetuosa y puntual.',
                role: 'conductora',
                time: 'Hace 1 semana'
            }
        ];

        const reviewsContainer = document.getElementById('recentReviewsList');
        reviewsContainer.innerHTML = mockReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <img src="${review.avatar}" alt="${review.reviewer}" class="reviewer-avatar">
                    <div class="reviewer-info">
                        <h4 class="reviewer-name">${review.reviewer}</h4>
                        <div class="review-stars">
                            ${'⭐'.repeat(review.rating)}
                        </div>
                    </div>
                </div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-meta">Como ${review.role} • ${review.time}</div>
            </div>
        `).join('');
    }

    function loadVehicleInfo() {
        if (!currentUser.vehicle) return;

        const vehicle = currentUser.vehicle;
        const container = document.getElementById('vehicleContent');
        
        container.innerHTML = `
            <div class="vehicle-overview">
                <img src="${vehicle.image}" alt="${vehicle.make} ${vehicle.model}" class="vehicle-image">
                <div class="vehicle-details">
                    <h3>${vehicle.make} ${vehicle.model} ${vehicle.year}</h3>
                    <p class="vehicle-description">${vehicle.color} • Sedán</p>
                    <div class="vehicle-specs">
                        <div class="spec-item">
                            <label class="spec-label">Placa</label>
                            <p class="spec-value">${vehicle.plate}</p>
                        </div>
                        <div class="spec-item">
                            <label class="spec-label">Asientos</label>
                            <p class="spec-value">${vehicle.seats} pasajeros</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="vehicle-features">
                <div class="features-section">
                    <h4>Características</h4>
                    <div class="features-list">
                        <div class="feature-item">
                            <span class="feature-icon">❄️</span>
                            <span class="feature-text">Aire Acondicionado</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🎵</span>
                            <span class="feature-text">Sistema de Audio</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">📱</span>
                            <span class="feature-text">Bluetooth</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🔌</span>
                            <span class="feature-text">Cargador USB</span>
                        </div>
                    </div>
                </div>
                <div class="features-section">
                    <h4>Documentación</h4>
                    <div class="features-list">
                        <div class="feature-item">
                            <span class="feature-icon">✅</span>
                            <span class="feature-text">SOAT Vigente</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">✅</span>
                            <span class="feature-text">Revisión Técnica</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">✅</span>
                            <span class="feature-text">Licencia de Conducir</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">✅</span>
                            <span class="feature-text">Tarjeta de Propiedad</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function loadSettings() {
        const notificationSettings = [
            { id: 'trip-requests', title: 'Solicitudes de Viaje', description: 'Recibir notificaciones cuando alguien solicite un viaje', enabled: true },
            { id: 'messages', title: 'Mensajes', description: 'Notificaciones de mensajes de otros usuarios', enabled: true },
            { id: 'reminders', title: 'Recordatorios de Viaje', description: 'Recordatorios 30 minutos antes del viaje', enabled: true },
            { id: 'promotions', title: 'Promociones', description: 'Recibir información sobre promociones y descuentos', enabled: false }
        ];

        const container = document.getElementById('notificationSettings');
        container.innerHTML = notificationSettings.map(setting => `
            <div class="setting-item">
                <div class="setting-info">
                    <h3>${setting.title}</h3>
                    <p>${setting.description}</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" ${setting.enabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');
    }

    function loadSidebarContent() {
        // Completion tasks
        const tasks = [
            { text: 'Verificar documento', action: 'Completar' },
            { text: 'Agregar foto del vehículo', action: 'Agregar' }
        ];

        const tasksContainer = document.getElementById('completionTasks');
        tasksContainer.innerHTML = tasks.map(task => `
            <div class="completion-task">
                <span class="task-text">${task.text}</span>
                <a href="#" class="task-action">${task.action}</a>
            </div>
        `).join('');

        // Recent activity
        const activities = [
            { type: 'review', text: 'Carlos M. te dejó una reseña de 5 estrellas', time: 'Hace 2 días' },
            { type: 'trip', text: 'Completaste un viaje como conductora', time: 'Hace 3 días' },
            { type: 'message', text: 'Nuevo mensaje de Ana L.', time: 'Hace 1 semana' }
        ];

        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.type === 'review' ? '⭐' : activity.type === 'trip' ? '🚗' : '💬'}
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab + '-tab');
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    function setupEventListeners() {
        // Edit buttons
        document.getElementById('editPersonalBtn')?.addEventListener('click', () => {
            alert('Función de edición en desarrollo');
        });

        document.getElementById('editAboutBtn')?.addEventListener('click', () => {
            alert('Función de edición en desarrollo');
        });

        document.getElementById('editVehicleBtn')?.addEventListener('click', () => {
            alert('Función de edición en desarrollo');
        });

        // View all buttons
        document.getElementById('viewAllTripsBtn')?.addEventListener('click', () => {
            window.location.href = '../trips/my-trips.html';
        });

        document.getElementById('viewAllReviewsBtn')?.addEventListener('click', () => {
            window.location.href = 'rate.html';
        });

        document.getElementById('viewAllActivityBtn')?.addEventListener('click', () => {
            alert('Ver toda la actividad - función en desarrollo');
        });
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();
