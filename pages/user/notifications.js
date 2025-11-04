// Notifications functionality - OnePath
(function() {
    'use strict';

    // Notification system state
    let notifications = [];
    let notificationSettings = {
        tripChanges: true,
        tripReminders: true,
        emailNotifications: false,
        pushNotifications: true
    };

    // DOM elements
    let notificationsList, loadMoreBtn, markAllReadBtn, clearAllBtn;

    // Initialize notifications system
    function initNotifications() {
        // Get DOM elements
        notificationsList = document.getElementById('notificationsList');
        loadMoreBtn = document.getElementById('loadMoreBtn');
        markAllReadBtn = document.getElementById('markAllReadBtn');
        clearAllBtn = document.getElementById('clearAllBtn');

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
    }

    // Clear all notifications
    function clearAllNotifications() {
        if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
            notifications = [];
            saveNotifications();
            notificationsList.innerHTML = '<div class="no-notifications"><p>No tienes notificaciones</p></div>';
            updateNotificationCount();
            showToast('Todas las notificaciones eliminadas');
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
    }

    // Create notification element
    function createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification-item notification-${notification.type} ${notification.read ? 'read' : ''}`;
        div.dataset.id = notification.id;
        
        div.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-icon-wrapper notification-icon-${notification.type}">
                        <span class="notification-type-icon">${notification.icon}</span>
                    </div>
                    <div class="notification-details">
                        <h3 class="notification-title">${notification.title}</h3>
                        <p class="notification-message">${notification.message}</p>
                        <div class="notification-meta">
                            ${notification.meta.map(meta => `
                                <span class="meta-item">
                                    <span class="meta-icon">${meta.icon}</span>
                                    ${meta.text}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="notification-actions">
                    <span class="notification-time">${notification.time}</span>
                    <button class="notification-action-btn ${notification.read ? 'read' : ''}" 
                            data-action="${notification.read ? 'mark-unread' : 'mark-read'}">
                        ${notification.read ? '↻' : '✓'}
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }

    // Add new notification
    function addNotification(notification) {
        notification.id = Date.now();
        notification.timestamp = new Date();
        notification.read = false;
        
        notifications.unshift(notification);
        saveNotifications();
        
        // Add to UI at the beginning
        const element = createNotificationElement(notification);
        element.classList.add('new');
        notificationsList.insertBefore(element, notificationsList.firstChild);
        
        updateNotificationCount();
        
        // Show browser notification if enabled
        if (notificationSettings.pushNotifications && 'Notification' in window) {
            showBrowserNotification(notification);
        }
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

    // Start notification simulation
    function startNotificationSimulation() {
        // Simulate new notifications every 2-5 minutes
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                const randomNotification = generateRandomNotifications(1)[0];
                addNotification(randomNotification);
            }
        }, 120000 + Math.random() * 180000); // 2-5 minutes
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
