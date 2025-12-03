// Notifications functionality - OnePath
(function() {
    'use strict';

    // Notification system state
    let notifications = [];
    let notificationSettings = {
        tripChanges: true,
        tripReminders: true,
        emailNotifications: false,
        pushNotifications: true,
        // New intelligent settings
        intelligentNotifications: true,
        geolocationAlerts: true,
        trafficPredictions: true,
        smsNotifications: false,
        emailDigest: false,
        calendarSync: false,
        customSchedule: {
            enabled: false,
            quietHours: { start: '22:00', end: '07:00' },
            weekendMode: false
        }
    };
    let notificationFilter = 'all';
    
    // User behavior patterns for intelligent notifications
    let userPatterns = {
        frequentRoutes: [],
        preferredTimes: [],
        responsePatterns: {},
        lastActivity: null
    };

    // DOM elements
    let notificationsList, loadMoreBtn, markAllReadBtn, clearAllBtn, settingsSummary, filterAllBtn, filterUnreadBtn;

    // Initialize notifications system
    function initNotifications() {
        // Get DOM elements
        notificationsList = document.getElementById('notificationsList');
        loadMoreBtn = document.getElementById('loadMoreBtn');
        markAllReadBtn = document.getElementById('markAllReadBtn');
        clearAllBtn = document.getElementById('clearAllBtn');
        settingsSummary = document.getElementById('notificationSettingsSummary');
        filterAllBtn = document.getElementById('filterAllBtn');
        filterUnreadBtn = document.getElementById('filterUnreadBtn');

        if (!notificationsList) {
            console.error('Notifications list element not found');
            return;
        }

        // Load notifications from storage
        loadNotifications();
        
        // Load settings from storage
        loadSettings();

        // Bind events
        bindEvents();

        // Start automatic notification simulation
        startNotificationSimulation();

        // Update notification count in navbar
        updateNotificationCount();

        applyNotificationFilter(notificationFilter);
        
        // Schedule weekly email digest check
        setInterval(scheduleWeeklyDigest, 60 * 60 * 1000); // Check every hour
        setInterval(generateEmailDigest, 7 * 24 * 60 * 60 * 1000); // Check every week
    }

    // Bind event listeners
    function bindEvents() {
        // Toggle switches for settings
        const toggleInputs = document.querySelectorAll('.toggle-input');
        toggleInputs.forEach(toggle => {
            toggle.addEventListener('change', handleSettingChange);
        });

        // Notification action buttons
        document.addEventListener('click', function(e) {
            if (e.target.matches('.notification-action-btn')) {
                handleNotificationAction(e);
            }
        });

        // Bulk actions
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMoreNotifications);
        }

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', markAllAsRead);
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', clearAllNotifications);
        }

        if (filterAllBtn) {
            filterAllBtn.addEventListener('click', function() {
                notificationFilter = 'all';
                applyNotificationFilter(notificationFilter);
            });
        }

        if (filterUnreadBtn) {
            filterUnreadBtn.addEventListener('click', function() {
                notificationFilter = 'unread';
                applyNotificationFilter(notificationFilter);
            });
        }
    }

    // Load notifications from localStorage
    function loadNotifications() {
        try {
            const stored = localStorage.getItem('onepath_notifications');
            if (stored) {
                notifications = JSON.parse(stored);
            } else {
                // Initialize with default notifications
                notifications = getDefaultNotifications();
                saveNotifications();
            }
        } catch (e) {
            console.error('Error loading notifications:', e);
            notifications = getDefaultNotifications();
        }
    }

    // Save notifications to localStorage
    function saveNotifications() {
        try {
            localStorage.setItem('onepath_notifications', JSON.stringify(notifications));
        } catch (e) {
            console.error('Error saving notifications:', e);
        }
    }

    // Load settings from localStorage
    function loadSettings() {
        try {
            const stored = localStorage.getItem('onepath_notification_settings');
            if (stored) {
                notificationSettings = { ...notificationSettings, ...JSON.parse(stored) };
            }
            
            // Update toggle switches
            updateSettingsUI();
            updateSettingsSummary();
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        try {
            localStorage.setItem('onepath_notification_settings', JSON.stringify(notificationSettings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    // Update settings UI
    function updateSettingsUI() {
        const toggles = document.querySelectorAll('.toggle-input');
        const settingsMap = ['tripChanges', 'tripReminders', 'emailNotifications', 'pushNotifications'];
        
        toggles.forEach((toggle, index) => {
            if (settingsMap[index]) {
                toggle.checked = notificationSettings[settingsMap[index]];
            }
        });
    }

    // Handle setting change
    function handleSettingChange(e) {
        const toggles = Array.from(document.querySelectorAll('.toggle-input'));
        const index = toggles.indexOf(e.target);
        const settingsMap = ['tripChanges', 'tripReminders', 'emailNotifications', 'pushNotifications'];
        
        if (settingsMap[index]) {
            notificationSettings[settingsMap[index]] = e.target.checked;
            saveSettings();
            
            // Show feedback
            showToast(`Configuración ${e.target.checked ? 'activada' : 'desactivada'}`);
            updateSettingsSummary();
        }
    }

    // Handle notification actions
    function handleNotificationAction(e) {
        const action = e.target.dataset.action;
        const notificationItem = e.target.closest('.notification-item');
        const notificationId = notificationItem.dataset.id;

        switch (action) {
            case 'mark-read':
                markAsRead(notificationId);
                break;
            case 'mark-unread':
                markAsUnread(notificationId);
                break;
        }
    }

    // Mark notification as read
    function markAsRead(id) {
        const notification = notifications.find(n => n.id == id);
        if (notification) {
            notification.read = true;
            saveNotifications();
            updateNotificationUI(id);
            updateNotificationCount();
            showToast('Notificación marcada como leída');
            applyNotificationFilter(notificationFilter);
        }
    }

    // Mark notification as unread
    function markAsUnread(id) {
        const notification = notifications.find(n => n.id == id);
        if (notification) {
            notification.read = false;
            saveNotifications();
            updateNotificationUI(id);
            updateNotificationCount();
            showToast('Notificación marcada como no leída');
            applyNotificationFilter(notificationFilter);
        }
    }

    // Update notification UI
    function updateNotificationUI(id) {
        const notificationItem = document.querySelector(`[data-id="${id}"]`);
        const notification = notifications.find(n => n.id == id);
        
        if (notificationItem && notification) {
            const actionBtn = notificationItem.querySelector('.notification-action-btn');
            
            if (notification.read) {
                notificationItem.classList.add('read');
                actionBtn.textContent = '↻';
                actionBtn.dataset.action = 'mark-unread';
                actionBtn.classList.add('read');
            } else {
                notificationItem.classList.remove('read');
                actionBtn.textContent = '✓';
                actionBtn.dataset.action = 'mark-read';
                actionBtn.classList.remove('read');
            }
        }
    }

    // Mark all notifications as read
    function markAllAsRead() {
        notifications.forEach(notification => {
            notification.read = true;
        });
        
        saveNotifications();
        
        // Update UI for all notifications
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            const id = item.dataset.id;
            updateNotificationUI(id);
        });
        
        updateNotificationCount();
        showToast('Todas las notificaciones marcadas como leídas');
        applyNotificationFilter(notificationFilter);
    }

    // Clear all notifications
    function clearAllNotifications() {
        if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
            notifications = [];
            saveNotifications();
            notificationsList.innerHTML = '<div class="no-notifications"><p>No tienes notificaciones</p></div>';
            updateNotificationCount();
            showToast('Todas las notificaciones eliminadas');
            applyNotificationFilter(notificationFilter);
        }
    }

    // Load more notifications (simulation)
    function loadMoreNotifications() {
        const moreNotifications = generateRandomNotifications(3);
        notifications.push(...moreNotifications);
        saveNotifications();
        
        // Add to UI
        moreNotifications.forEach(notification => {
            const element = createNotificationElement(notification);
            notificationsList.appendChild(element);
        });
        
        showToast('Más notificaciones cargadas');
        applyNotificationFilter(notificationFilter);
    }

    // Enhanced notification actions
    function handleNotificationQuickAction(action, notificationData) {
        switch (action) {
            case 'view_location':
                showToast('Abriendo mapa con ubicación del conductor...');
                // In real app: open map with driver location
                break;
            case 'call_driver':
                showToast('Iniciando llamada al conductor...');
                // In real app: initiate phone call
                break;
            case 'alternative_routes':
                showToast('Buscando rutas alternativas...');
                // In real app: show alternative routes
                break;
            case 'notify_passengers':
                showToast('Notificando a los pasajeros sobre el retraso...');
                sendSMSNotification('Retraso por tráfico. Llegada estimada: +15 min.');
                break;
            case 'view_trip':
                showToast('Redirigiendo a detalles del viaje...');
                // In real app: navigate to trip details
                break;
            case 'contact_driver':
                showToast('Abriendo chat con el conductor...');
                // In real app: open chat
                break;
            case 'search_trips':
                showToast('Buscando viajes disponibles...');
                // In real app: navigate to search
                break;
            case 'set_reminder':
                scheduleCalendarReminder(notificationData);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }
    
    // SMS notification system
    function sendSMSNotification(message, phoneNumber = null) {
        if (!notificationSettings.smsNotifications) return;
        
        // Simulate SMS sending (in real app, integrate with SMS service like Twilio)
        console.log('SMS sent:', message);
        showToast('SMS enviado: ' + message);
        
        // Log SMS for email digest
        logNotificationForDigest({
            type: 'sms',
            message: message,
            timestamp: new Date().toISOString()
        });
    }
    
    // Email digest system
    function generateEmailDigest() {
        if (!notificationSettings.emailDigest) return;
        
        const digestData = getDigestData();
        const emailContent = {
            subject: 'Resumen semanal de OnePath',
            body: `
                <h2>Tu actividad esta semana</h2>
                <p>Viajes completados: ${digestData.completedTrips}</p>
                <p>Nuevas conexiones: ${digestData.newConnections}</p>
                <p>Notificaciones importantes: ${digestData.importantNotifications}</p>
                <p>Próximos viajes: ${digestData.upcomingTrips}</p>
            `,
            timestamp: new Date().toISOString()
        };
        
        // Simulate email sending (in real app, integrate with email service)
        console.log('Email digest generated:', emailContent);
        showToast('Resumen semanal enviado por email');
    }
    
    // Calendar integration
    function scheduleCalendarReminder(notificationData) {
        if (!notificationSettings.calendarSync) {
            showToast('Sincronización de calendario deshabilitada');
            return;
        }
        
        const event = {
            title: 'Recordatorio OnePath: ' + notificationData.title,
            description: notificationData.message,
            start: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
            end: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
        };
        
        // Simulate calendar integration (in real app, use Google Calendar API or similar)
        console.log('Calendar event created:', event);
        showToast('Recordatorio añadido al calendario');
    }
    
    // Enhanced browser notifications with actions
    function showEnhancedBrowserNotification(notification) {
        if (!notificationSettings.pushNotifications) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: '/assets/images/logo-small.png',
                badge: '/assets/images/badge.png',
                tag: notification.id || 'onepath-notification',
                requireInteraction: notification.type === 'error',
                silent: notification.type === 'info'
            };
            
            // Add action buttons for supported browsers
            if ('actions' in Notification.prototype && notification.actions) {
                options.actions = notification.actions.map(action => ({
                    action: action.action,
                    title: action.text,
                    icon: '/assets/images/action-icon.png'
                }));
            }
            
            const browserNotification = new Notification(notification.title, options);
            
            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
            };
            
            // Handle action clicks
            if (browserNotification.addEventListener) {
                browserNotification.addEventListener('notificationclick', (event) => {
                    if (event.action) {
                        handleNotificationQuickAction(event.action, notification);
                    }
                });
            }
        }
    }
    
    // Helper functions for digest system
    function logNotificationForDigest(data) {
        try {
            const digestLog = JSON.parse(localStorage.getItem('onepath_digest_log') || '[]');
            digestLog.push(data);
            
            // Keep only last 100 entries
            if (digestLog.length > 100) {
                digestLog.splice(0, digestLog.length - 100);
            }
            
            localStorage.setItem('onepath_digest_log', JSON.stringify(digestLog));
        } catch (e) {
            console.error('Error logging notification for digest:', e);
        }
    }
    
    function getDigestData() {
        // Simulate digest data (in real app, fetch from server)
        return {
            completedTrips: Math.floor(Math.random() * 10) + 1,
            newConnections: Math.floor(Math.random() * 5),
            importantNotifications: Math.floor(Math.random() * 8) + 2,
            upcomingTrips: Math.floor(Math.random() * 3) + 1
        };
    }
    
    // Schedule weekly email digest
    function scheduleWeeklyDigest() {
        if (!notificationSettings.emailDigest) return;
        
        // Check if it's Sunday and generate digest
        const now = new Date();
        if (now.getDay() === 0 && now.getHours() === 9) { // Sunday at 9 AM
            generateEmailDigest();
        }
    }
    
    // Create enhanced notification element
    function createNotificationElement(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-item ${notification.read ? 'read' : 'unread'} ${notification.type || 'info'}`;
        notificationEl.dataset.id = notification.id || Date.now();

        const typeIcon = getNotificationTypeIcon(notification.type);
        const metaHtml = notification.meta ? notification.meta.map(item => 
            `<span class="notification-meta-item"><span class="material-icons">${getNotificationTypeIcon(item.icon)}</span>${item.text}</span>`
        ).join('') : '';
        
        // Enhanced action buttons
        const quickActionsHtml = notification.actions ? notification.actions.map(action => 
            `<button class="notification-quick-action" data-action="${action.action}">${action.text}</button>`
        ).join('') : '';

        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-icon">
                        <span class="material-icons">${typeIcon}</span>
                    </div>
                    <div class="notification-info">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                    <div class="notification-actions">
                        <button class="notification-action-btn" data-action="mark-read" title="Marcar como leída">
                            <span class="material-icons">${notification.read ? 'mark_email_unread' : 'mark_email_read'}</span>
                        </button>
                        <button class="notification-action-btn" data-action="delete" title="Eliminar">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                <div class="notification-message">${notification.message}</div>
                ${metaHtml ? `<div class="notification-meta">${metaHtml}</div>` : ''}
                ${quickActionsHtml ? `<div class="notification-quick-actions">${quickActionsHtml}</div>` : ''}
            </div>
        `;
        
        return notificationEl;
    }

    

    // Add new notification with enhanced features
    function addNotification(notification) {
        // Generate unique ID if not provided
        if (!notification.id) {
            notification.id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Set default properties
        notification.read = false;
        notification.time = notification.time || 'Ahora';
        notification.timestamp = new Date().toISOString();

        // Add to notifications array
        notifications.unshift(notification);

        // Keep only last 50 notifications to prevent memory issues
        if (notifications.length > 50) {
            notifications = notifications.slice(0, 50);
        }

        // Save to storage
        saveNotifications();
        

        // Update UI
        renderNotifications();
        updateNotificationCount();

        // Show enhanced browser notification
        showEnhancedBrowserNotification(notification);
        
        // Log for email digest
        logNotificationForDigest({
            type: 'notification',
            title: notification.title,
            message: notification.message,
            timestamp: notification.timestamp
        });
    }

    // Show browser notification
    function showBrowserNotification(notification) {
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/assets/icon-192x192.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/assets/icon-192x192.png'
                    });
                }
            });
        }
    }

    // Update notification count in navbar
    function updateNotificationCount() {
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // Update navbar notification badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    function applyNotificationFilter(filter) {
        const items = document.querySelectorAll('.notification-item');
        items.forEach(item => {
            const id = item.dataset.id;
            const notification = notifications.find(n => n.id == id);
            const isRead = notification ? notification.read : item.classList.contains('read');

            if (filter === 'unread' && isRead) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
            }
        });

        if (filterAllBtn && filterUnreadBtn) {
            if (filter === 'all') {
                filterAllBtn.classList.add('active');
                filterUnreadBtn.classList.remove('active');
            } else {
                filterUnreadBtn.classList.add('active');
                filterAllBtn.classList.remove('active');
            }
        }
    }

    // Helper function to get notification type icon
    function getNotificationTypeIcon(type) {
        const iconMap = {
            'info': 'info',
            'warning': 'warning',
            'error': 'error',
            'success': 'check_circle',
            '📍': 'location_on',
            '🚗': 'directions_car',
            '🚦': 'traffic',
            '🕐': 'schedule',
            '🌅': 'wb_sunny',
            '🌆': 'wb_twilight',
            '📊': 'analytics',
            '🛣️': 'alt_route',
            '💬': 'chat',
            '✅': 'check_circle',
            '✏️': 'edit'
        };
        return iconMap[type] || 'notifications';
    }
    
    function updateSettingsSummary() {
        if (!settingsSummary) return;
        const enabled = [];

        if (notificationSettings.tripChanges) {
            enabled.push('cambios en viajes');
        }
        if (notificationSettings.tripReminders) {
            enabled.push('recordatorios de viaje');
        }
        if (notificationSettings.emailNotifications) {
            enabled.push('notificaciones por email');
        }
        if (notificationSettings.pushNotifications) {
            enabled.push('notificaciones push');
        }
        if (notificationSettings.intelligentNotifications) {
            enabled.push('notificaciones inteligentes');
        }
        if (notificationSettings.geolocationAlerts) {
            enabled.push('alertas de ubicación');
        }
        if (notificationSettings.trafficPredictions) {
            enabled.push('predicciones de tráfico');
        }
        if (notificationSettings.smsNotifications) {
            enabled.push('SMS');
        }
        if (notificationSettings.emailDigest) {
            enabled.push('resumen por email');
        }
        if (notificationSettings.calendarSync) {
            enabled.push('sincronización de calendario');
        }

        if (!enabled.length) {
            settingsSummary.textContent = 'Has desactivado todas las notificaciones. Es posible que no recibas alertas importantes sobre tus viajes.';
            settingsSummary.classList.add('settings-summary-warning');
        } else {
            settingsSummary.textContent = 'Notificaciones activas: ' + enabled.join(', ') + '.';
            settingsSummary.classList.remove('settings-summary-warning');
        }
    }

    // Intelligent notification system
    function analyzeUserPatterns() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        
        // Update user activity patterns
        if (!userPatterns.preferredTimes.includes(currentHour)) {
            userPatterns.preferredTimes.push(currentHour);
        }
        
        userPatterns.lastActivity = now.toISOString();
        saveUserPatterns();
    }
    
    function saveUserPatterns() {
        try {
            localStorage.setItem('onepath_user_patterns', JSON.stringify(userPatterns));
        } catch (e) {
            console.error('Error saving user patterns:', e);
        }
    }
    
    function loadUserPatterns() {
        try {
            const stored = localStorage.getItem('onepath_user_patterns');
            if (stored) {
                userPatterns = { ...userPatterns, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Error loading user patterns:', e);
        }
    }
    
    // Geolocation-based notifications
    function checkGeolocationAlerts() {
        if (!notificationSettings.geolocationAlerts) return;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                
                // Simulate checking if driver is nearby (in real app, this would be server-side)
                if (Math.random() < 0.1) { // 10% chance for demo
                    const proximityNotification = {
                        type: 'info',
                        icon: '📍',
                        title: 'Conductor cerca',
                        message: 'Tu conductor está a 5 minutos del punto de recogida.',
                        time: 'Ahora',
                        meta: [
                            { icon: '🚗', text: 'Carlos M.' },
                            { icon: '📍', text: 'Llegada estimada: 5 min' }
                        ],
                        actions: [
                            { text: 'Ver ubicación', action: 'view_location' },
                            { text: 'Llamar', action: 'call_driver' }
                        ]
                    };
                    addNotification(proximityNotification);
                }
            });
        }
    }
    
    // Traffic prediction notifications
    function checkTrafficPredictions() {
        if (!notificationSettings.trafficPredictions) return;
        
        // Simulate traffic analysis (in real app, integrate with Google Maps API or similar)
        const trafficConditions = ['normal', 'light', 'heavy', 'severe'];
        const currentTraffic = trafficConditions[Math.floor(Math.random() * trafficConditions.length)];
        
        if (currentTraffic === 'heavy' || currentTraffic === 'severe') {
            const delayMinutes = currentTraffic === 'heavy' ? 15 : 30;
            const trafficNotification = {
                type: 'warning',
                icon: '🚦',
                title: 'Alerta de tráfico',
                message: `Tráfico ${currentTraffic === 'heavy' ? 'pesado' : 'severo'} en tu ruta. Retraso estimado: ${delayMinutes} min.`,
                time: 'Ahora',
                meta: [
                    { icon: '🕐', text: `+${delayMinutes} min` },
                    { icon: '🛣️', text: 'Ruta principal' }
                ],
                actions: [
                    { text: 'Ver rutas alternativas', action: 'alternative_routes' },
                    { text: 'Notificar pasajeros', action: 'notify_passengers' }
                ]
            };
            addNotification(trafficNotification);
        }
    }
    
    // Check if notification should be sent based on user schedule
    function shouldSendNotification(notification) {
        if (!notificationSettings.customSchedule.enabled) return true;
        
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const currentDay = now.getDay();
        const isWeekend = currentDay === 0 || currentDay === 6;
        
        // Check quiet hours
        const { start, end } = notificationSettings.customSchedule.quietHours;
        if (currentTime >= start || currentTime <= end) {
            // Only send critical notifications during quiet hours
            return notification.type === 'error' || notification.priority === 'high';
        }
        
        // Check weekend mode
        if (isWeekend && notificationSettings.customSchedule.weekendMode) {
            return notification.type === 'error' || notification.priority === 'high';
        }
        
        return true;
    }
    
    // Enhanced notification generation with intelligence
    function generateIntelligentNotification() {
        if (!notificationSettings.intelligentNotifications) {
            return generateRandomNotifications(1)[0];
        }
        
        analyzeUserPatterns();
        
        // Generate notifications based on user patterns and context
        const now = new Date();
        const currentHour = now.getHours();
        
        // Morning commute notifications (7-9 AM)
        if (currentHour >= 7 && currentHour <= 9) {
            return {
                type: 'info',
                icon: '🌅',
                title: 'Recordatorio matutino',
                message: 'No olvides revisar tu viaje de hoy. El tráfico suele ser pesado a esta hora.',
                time: 'Ahora',
                meta: [
                    { icon: '🕐', text: 'Salida recomendada: ' + (currentHour + 1) + ':00' },
                    { icon: '🚦', text: 'Tráfico moderado' }
                ],
                actions: [
                    { text: 'Ver viaje', action: 'view_trip' },
                    { text: 'Contactar conductor', action: 'contact_driver' }
                ]
            };
        }
        
        // Evening notifications (5-7 PM)
        if (currentHour >= 17 && currentHour <= 19) {
            return {
                type: 'info',
                icon: '🌆',
                title: 'Planifica tu regreso',
                message: 'Hora pico de regreso. Considera salir un poco más tarde para evitar tráfico.',
                time: 'Ahora',
                meta: [
                    { icon: '🕐', text: 'Mejor hora: ' + (currentHour + 1) + ':30' },
                    { icon: '📊', text: 'Basado en tus patrones' }
                ],
                actions: [
                    { text: 'Buscar viajes', action: 'search_trips' },
                    { text: 'Programar recordatorio', action: 'set_reminder' }
                ]
            };
        }
        
        // Default to random notification
        return generateRandomNotifications(1)[0];
    }
    
    // Start enhanced notification simulation
    function startNotificationSimulation() {
        // Load user patterns
        loadUserPatterns();
        
        // Check geolocation alerts every 2 minutes
        setInterval(checkGeolocationAlerts, 120000);
        
        // Check traffic predictions every 5 minutes
        setInterval(checkTrafficPredictions, 300000);
        
        // Generate intelligent notifications every 3-8 minutes
        setInterval(() => {
            if (Math.random() < 0.4) { // 40% chance
                const notification = generateIntelligentNotification();
                if (shouldSendNotification(notification)) {
                    addNotification(notification);
                }
            }
        }, 180000 + Math.random() * 300000); // 3-8 minutes
    }

    // Generate random notifications
    function generateRandomNotifications(count) {
        const templates = [
            {
                type: 'info',
                icon: '✏️',
                title: 'Cambio en tu viaje',
                message: 'El conductor ha modificado la hora de salida.',
                meta: [
                    { icon: '📅', text: 'Hoy' },
                    { icon: '🕐', text: 'Nueva hora: 8:00 AM' }
                ]
            },
            {
                type: 'warning',
                icon: '🕐',
                title: 'Recordatorio de viaje',
                message: 'Tu viaje comienza en 30 minutos.',
                meta: [
                    { icon: '📅', text: 'Hoy' },
                    { icon: '🕐', text: 'Salida: 8:30 AM' }
                ]
            },
            {
                type: 'success',
                icon: '✅',
                title: 'Viaje confirmado',
                message: 'Tu reserva ha sido confirmada.',
                meta: [
                    { icon: '📅', text: 'Mañana' },
                    { icon: '👤', text: 'María González' }
                ]
            },
            {
                type: 'info',
                icon: '💬',
                title: 'Nuevo mensaje',
                message: 'Tienes un nuevo mensaje de tu conductor.',
                meta: [
                    { icon: '👤', text: 'Carlos Mendoza' }
                ]
            }
        ];

        return Array.from({ length: count }, () => {
            const template = templates[Math.floor(Math.random() * templates.length)];
            return {
                ...template,
                time: 'Hace ' + Math.floor(Math.random() * 60) + ' min'
            };
        });
    }

    // Get default notifications
    function getDefaultNotifications() {
        return [
            {
                id: 1,
                type: 'info',
                icon: '✏️',
                title: 'Cambio en tu viaje',
                message: 'El conductor Carlos Mendoza ha modificado la hora de salida del viaje a Universidad Central.',
                meta: [
                    { icon: '📅', text: 'Lunes, 4 Nov 2024' },
                    { icon: '🕐', text: 'Nueva hora: 7:30 AM' }
                ],
                time: 'Hace 5 min',
                read: false,
                timestamp: new Date()
            },
            {
                id: 2,
                type: 'warning',
                icon: '🕐',
                title: 'Recordatorio de viaje',
                message: 'Tu viaje a Universidad Central comienza en 30 minutos. Prepárate para salir.',
                meta: [
                    { icon: '📅', text: 'Hoy, 4 Nov 2024' },
                    { icon: '🕐', text: 'Salida: 8:00 AM' }
                ],
                time: 'Hace 15 min',
                read: false,
                timestamp: new Date()
            },
            {
                id: 3,
                type: 'error',
                icon: '❌',
                title: 'Viaje cancelado',
                message: 'El conductor Ana López ha cancelado el viaje del martes por la mañana debido a problemas técnicos.',
                meta: [
                    { icon: '📅', text: 'Martes, 5 Nov 2024' },
                    { icon: '🕐', text: 'Era: 7:45 AM' }
                ],
                time: 'Hace 2 horas',
                read: false,
                timestamp: new Date()
            },
            {
                id: 4,
                type: 'success',
                icon: '✅',
                title: 'Viaje confirmado',
                message: 'Tu reserva para el viaje con María González ha sido confirmada para mañana.',
                meta: [
                    { icon: '📅', text: 'Miércoles, 6 Nov 2024' },
                    { icon: '🕐', text: 'Salida: 8:15 AM' }
                ],
                time: 'Ayer',
                read: false,
                timestamp: new Date()
            },
            {
                id: 5,
                type: 'info',
                icon: '💬',
                title: 'Nuevo mensaje',
                message: 'Tienes un nuevo mensaje de tu conductor para el viaje de mañana.',
                meta: [
                    { icon: '👤', text: 'Carlos Mendoza' }
                ],
                time: 'Hace 3 horas',
                read: true,
                timestamp: new Date()
            }
        ];
    }


    document.addEventListener("DOMContentLoaded", () => {

    const el = createNotificationElement(verif);
    notificationsList.prepend(el);

    const btnAbrir = document.getElementById("abrir-identificacion");
    const modal = document.getElementById("modal-identificacion");
    const btnCerrar = document.querySelector(".id-close");

    if (btnAbrir) {
        btnAbrir.addEventListener("click", () => {
            modal.classList.remove("hidden");
        });
    }

    if (btnCerrar) {
        btnCerrar.addEventListener("click", () => {
            modal.classList.add("hidden");
        });
    }

    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.add("hidden");
    });
});


    // Show toast notification
    function showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-blue);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotifications);
    } else {
        initNotifications();
    }

    // Export functions for external use
    window.OnepathNotifications = {
        addNotification,
        updateNotificationCount
    };

})();
