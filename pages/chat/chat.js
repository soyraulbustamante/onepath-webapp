// Chat functionality - OnePath
(function() {
    'use strict';

    // DOM elements
    let chatMessages, messageInput, sendButton, typingIndicator, messageError;
    let voiceRecordBtn, locationShareBtn, messageTemplatesBtn, translateBtn;
    let groupChatBtn, tripInfoHeader, quickActionsPanel;

    // State
    const MESSAGE_MAX_LENGTH = 280;
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let currentTripData = null;
    let messageTemplates = [
        { id: 'arrived', text: 'Ya llegué', icon: '📍' },
        { id: 'delay5', text: '5 minutos de retraso', icon: '⏰' },
        { id: 'delay10', text: '10 minutos de retraso', icon: '⏰' },
        { id: 'onway', text: 'Ya voy en camino', icon: '🚗' },
        { id: 'waiting', text: 'Te estoy esperando', icon: '⏳' },
        { id: 'thanks', text: '¡Gracias por el viaje!', icon: '🙏' }
    ];
    let isGroupChat = false;
    let groupMembers = [];
    let messageStates = new Map(); // Para estados de mensaje
    let translationEnabled = false;

    // Initialize chat functionality
    function initChat() {
        // Get DOM elements
        chatMessages = document.getElementById('chat-messages');
        messageInput = document.getElementById('messageInput');
        sendButton = document.getElementById('sendButton');
        typingIndicator = document.getElementById('typing-indicator');
        messageError = document.getElementById('messageError');
        voiceRecordBtn = document.getElementById('voiceRecordBtn');
        locationShareBtn = document.getElementById('locationShareBtn');
        messageTemplatesBtn = document.getElementById('messageTemplatesBtn');
        translateBtn = document.getElementById('translateBtn');
        groupChatBtn = document.getElementById('groupChatBtn');
        tripInfoHeader = document.getElementById('tripInfoHeader');
        quickActionsPanel = document.getElementById('quickActionsPanel');

        if (!chatMessages || !messageInput || !sendButton) {
            console.error('Required chat elements not found');
            return;
        }

        // Load trip data
        loadTripData();

        // Initialize advanced features
        initVoiceRecording();
        initLocationSharing();
        initMessageTemplates();
        initGroupChat();
        initTranslation();
        initTripIntegration();

        // Bind events
        bindEvents();

        // Validación inicial del input
        validateMessageInput();

        // Auto-scroll to bottom
        scrollToBottom();

        // Sidebar chat selection
        initChatList();
    }

    // Bind event listeners
    function bindEvents() {
        // Send message on button click
        sendButton.addEventListener('click', handleSendMessage);

        // Validate on input
        messageInput.addEventListener('input', validateMessageInput);

        // Send message on Enter key
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // Quick action buttons
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(button => {
            button.addEventListener('click', handleQuickAction);
        });

        // Other action buttons
        bindActionButtons();
        
        // Advanced feature buttons
        if (voiceRecordBtn) {
            voiceRecordBtn.addEventListener('click', toggleVoiceRecording);
        }
        
        if (locationShareBtn) {
            locationShareBtn.addEventListener('click', shareLocation);
        }
        
        if (messageTemplatesBtn) {
            messageTemplatesBtn.addEventListener('click', showMessageTemplates);
        }
        
        if (translateBtn) {
            translateBtn.addEventListener('click', toggleTranslation);
        }
        
        if (groupChatBtn) {
            groupChatBtn.addEventListener('click', toggleGroupChat);
        }
    }

    function initChatList() {
        const list = document.getElementById('chatList');
        if (!list) return;
        const items = list.querySelectorAll('.chat-list-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const name = item.dataset.name || '';
                const avatar = item.dataset.avatar || '';
                const nameEl = document.querySelector('.participant-name');
                const avatarEl = document.querySelector('.participant-avatar');
                if (nameEl) nameEl.textContent = name;
                if (avatarEl && avatar) avatarEl.src = avatar;
            });
        });
    }

    // Handle sending a message
    function handleSendMessage() {
        const message = messageInput.value.trim();
        if (!message) {
            setMessageError('El mensaje no puede estar vacío.');
            return;
        }

        if (message.length > MESSAGE_MAX_LENGTH) {
            setMessageError('El mensaje es demasiado largo.');
            return;
        }

        clearMessageError();

        // Create message element
        const messageElement = createMessageElement(message, true);
        
        // Insert before typing indicator
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }

        // Clear input
        messageInput.value = '';
        validateMessageInput();

        // Scroll to bottom
        scrollToBottom();

        // Simulate response (in a real app, this would be handled by WebSocket or API)
        setTimeout(simulateResponse, 1000 + Math.random() * 2000);
    }

    // Create a message element
    function createMessageElement(text, isOwn = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;

        const currentTime = new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const avatarSrc = isOwn 
            ? 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
            : 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg';

        const avatarAlt = isOwn ? 'María' : 'Carlos';

        if (isOwn) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${escapeHtml(text)}</p>
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
                <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar">
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar">
                <div class="message-content">
                    <div class="message-bubble">
                        <p>${escapeHtml(text)}</p>
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        }

        return messageDiv;
    }

    // Handle quick actions
    function handleQuickAction(e) {
        const action = e.target.dataset.action;
        let message = '';

        switch (action) {
            case 'location':
                message = 'Te comparto mi ubicación actual';
                break;
            case 'photo':
                message = 'Te envío una foto para que me puedas ubicar';
                break;
            case 'report':
                message = 'Tengo un problema con el punto de encuentro';
                break;
        }

        if (message) {
            messageInput.value = message;
            messageInput.focus();
            validateMessageInput();
        }
    }

    // Simulate response from other user
    function simulateResponse() {
        const responses = [
            '¡Perfecto! Ya te veo.',
            'Estoy llegando en 2 minutos.',
            'Gracias por la información.',
            '¡Excelente! Nos vemos pronto.',
            'Entendido, gracias.'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const messageElement = createMessageElement(randomResponse, false);

        // Remove typing indicator temporarily
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        // Add message
        chatMessages.appendChild(messageElement);

        // Show typing indicator again after a delay
        setTimeout(() => {
            if (typingIndicator) {
                typingIndicator.style.display = 'flex';
            }
        }, 3000);

        scrollToBottom();
    }

    // Bind other action buttons
    function bindActionButtons() {
        // Call button
        const callButton = document.querySelector('.btn-call');
        if (callButton) {
            callButton.addEventListener('click', function() {
                alert('Función de llamada no implementada en la demo');
            });
        }

        // Map button
        const mapButton = document.querySelector('.btn-map');
        if (mapButton) {
            mapButton.addEventListener('click', function() {
                alert('Función de mapa no implementada en la demo');
            });
        }

        // Start trip button
        const startButton = document.querySelector('.btn-start');
        if (startButton) {
            startButton.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres iniciar el viaje?')) {
                    alert('Viaje iniciado');
                }
            });
        }

        // Cancel trip button
        const cancelButton = document.querySelector('.btn-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres cancelar el viaje?')) {
                    alert('Viaje cancelado');
                }
            });
        }

        // Emergency button
        const emergencyButton = document.querySelector('.btn-emergency');
        if (emergencyButton) {
            emergencyButton.addEventListener('click', function() {
                if (confirm('¿Necesitas contactar con emergencias?')) {
                    alert('Contactando con equipo de emergencias...');
                }
            });
        }
    }

    // Scroll chat to bottom
    function scrollToBottom() {
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function validateMessageInput() {
        if (!messageInput || !sendButton) return;
        const value = messageInput.value;
        const trimmed = value.trim();

        if (!trimmed) {
            setMessageError('Escribe un mensaje para poder enviarlo.');
            sendButton.disabled = true;
            return;
        }

        if (trimmed.length > MESSAGE_MAX_LENGTH) {
            setMessageError('El mensaje no puede superar los ' + MESSAGE_MAX_LENGTH + ' caracteres.');
            sendButton.disabled = true;
            return;
        }

        clearMessageError();
        sendButton.disabled = false;
    }

    function setMessageError(message) {
        if (!messageError) return;
        messageError.textContent = message;
        messageError.style.display = 'block';
    }

    function clearMessageError() {
        if (!messageError) return;
        messageError.textContent = '';
        messageError.style.display = 'none';
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Advanced Chat Features Implementation
    
    // Load trip data for context
    function loadTripData() {
        // Simulate loading trip data (in real app, fetch from API)
        currentTripData = {
            id: 'trip_001',
            origin: 'Universidad Nacional Mayor de San Marcos',
            destination: 'Miraflores',
            date: '2024-12-02',
            time: '08:00',
            driver: 'Carlos Mendoza',
            passengers: ['María González', 'Luis Pérez'],
            status: 'confirmed',
            price: 15.00
        };
        
        updateTripInfoHeader();
    }
    
    // Update trip info in chat header
    function updateTripInfoHeader() {
        if (!tripInfoHeader || !currentTripData) return;
        
        tripInfoHeader.innerHTML = `
            <div class="trip-info-content">
                <div class="trip-route">
                    <span class="material-icons">trip_origin</span>
                    <span class="route-text">${currentTripData.origin} → ${currentTripData.destination}</span>
                </div>
                <div class="trip-details">
                    <span class="trip-date">${formatTripDate(currentTripData.date)}</span>
                    <span class="trip-time">${currentTripData.time}</span>
                    <span class="trip-status status-${currentTripData.status}">${getTripStatusText(currentTripData.status)}</span>
                </div>
            </div>
        `;
    }
    
    // Voice recording functionality
    function initVoiceRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('Voice recording not supported in this browser');
            if (voiceRecordBtn) voiceRecordBtn.style.display = 'none';
            return;
        }
    }
    
    function toggleVoiceRecording() {
        if (isRecording) {
            stopVoiceRecording();
        } else {
            startVoiceRecording();
        }
    }
    
    function startVoiceRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    sendVoiceMessage(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorder.start();
                isRecording = true;
                
                if (voiceRecordBtn) {
                    voiceRecordBtn.classList.add('recording');
                    voiceRecordBtn.innerHTML = '<span class="material-icons">stop</span>';
                }
                
                showToast('Grabando mensaje de voz...');
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
                showToast('Error: No se pudo acceder al micrófono');
            });
    }
    
    function stopVoiceRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            
            if (voiceRecordBtn) {
                voiceRecordBtn.classList.remove('recording');
                voiceRecordBtn.innerHTML = '<span class="material-icons">mic</span>';
            }
        }
    }
    
    function sendVoiceMessage(audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const messageElement = createVoiceMessageElement(audioUrl, true);
        
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }
        
        scrollToBottom();
        showToast('Mensaje de voz enviado');
        
        // Simulate response
        setTimeout(() => {
            simulateVoiceResponse();
        }, 2000);
    }
    
    function createVoiceMessageElement(audioUrl, isOwn = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
        
        const currentTime = new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const avatarSrc = isOwn 
            ? 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
            : 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg';
        
        const avatarAlt = isOwn ? 'María' : 'Carlos';
        
        const voiceContent = `
            <div class="voice-message">
                <button class="voice-play-btn" onclick="toggleVoicePlayback(this, '${audioUrl}')">
                    <span class="material-icons">play_arrow</span>
                </button>
                <div class="voice-waveform">
                    <div class="waveform-bars">
                        <div class="bar"></div><div class="bar"></div><div class="bar"></div>
                        <div class="bar"></div><div class="bar"></div><div class="bar"></div>
                    </div>
                    <span class="voice-duration">0:03</span>
                </div>
            </div>
        `;
        
        if (isOwn) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble voice-bubble">
                        ${voiceContent}
                    </div>
                    <div class="message-time">${currentTime}</div>
                    <div class="message-status">
                        <span class="material-icons">done_all</span>
                    </div>
                </div>
                <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar">
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar">
                <div class="message-content">
                    <div class="message-bubble voice-bubble">
                        ${voiceContent}
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        }
        
        return messageDiv;
    }
    
    // Location sharing functionality
    function initLocationSharing() {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported in this browser');
            if (locationShareBtn) locationShareBtn.style.display = 'none';
        }
    }
    
    function shareLocation() {
        if (!navigator.geolocation) {
            showToast('Geolocalización no disponible');
            return;
        }
        
        showToast('Obteniendo ubicación...');
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                sendLocationMessage(latitude, longitude);
            },
            error => {
                console.error('Error getting location:', error);
                showToast('Error: No se pudo obtener la ubicación');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }
    
    function sendLocationMessage(lat, lng) {
        const locationData = {
            latitude: lat,
            longitude: lng,
            address: 'Ubicación compartida' // In real app, reverse geocode
        };
        
        const messageElement = createLocationMessageElement(locationData, true);
        
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }
        
        scrollToBottom();
        showToast('Ubicación compartida');
    }
    
    function createLocationMessageElement(locationData, isOwn = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
        
        const currentTime = new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const avatarSrc = isOwn 
            ? 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg'
            : 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg';
        
        const avatarAlt = isOwn ? 'María' : 'Carlos';
        
        const locationContent = `
            <div class="location-message">
                <div class="location-icon">
                    <span class="material-icons">location_on</span>
                </div>
                <div class="location-info">
                    <div class="locatifalse">Ubicación compartida</div>
                    <div class="location-address">${locationData.address}</div>
                    <div class="location-coords">Lat: ${locationData.latitude.toFixed(6)}, Lng: ${locationData.longitude.toFixed(6)}</div>
                </div>
                <button class="location-view-btn" onclick="openLocationInMap(${locationData.latitude}, ${locationData.longitude})">
                    <span class="material-icons">map</span>
                </button>
            </div>
        `;
        
        if (isOwn) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble location-bubble">
                        ${locationContent}
                    </div>
                    <div class="message-time">${currentTime}</div>
                    <div class="message-status">
                        <span class="material-icons">done_all</span>
                    </div>
                </div>
                <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar">
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="${avatarSrc}" alt="${avatarAlt}" class="message-avatar">
                <div class="message-content">
                    <div class="message-bubble location-bubble">
                        ${locationContent}
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
        }
        
        return messageDiv;
    }
    
    // Message templates functionality
    function initMessageTemplates() {
        // Templates are already defined in state
    }
    
    function showMessageTemplates() {
        const templatesModal = createTemplatesModal();
        document.body.appendChild(templatesModal);
        
        // Add event listeners for template buttons
        const templateBtns = templatesModal.querySelectorAll('.template-btn');
        templateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const templateId = btn.dataset.templateId;
                const template = messageTemplates.find(t => t.id === templateId);
                if (template) {
                    sendTemplateMessage(template);
                }
                document.body.removeChild(templatesModal);
            });
        });
        
        // Close modal on backdrop click
        templatesModal.addEventListener('click', (e) => {
            if (e.target === templatesModal) {
                document.body.removeChild(templatesModal);
            }
        });
    }
    
    function createTemplatesModal() {
        const modal = document.createElement('div');
        modal.className = 'templates-modal';
        
        const templatesHtml = messageTemplates.map(template => `
            <button class="template-btn" data-template-id="${template.id}">
                <span class="template-icon">${template.icon}</span>
                <span class="template-text">${template.text}</span>
            </button>
        `).join('');
        
        modal.innerHTML = `
            <div class="templates-modal-content">
                <div class="templates-header">
                    <h3>Mensajes rápidos</h3>
                    <button class="templates-close" onclick="this.closest('.templates-modal').remove()">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="templates-grid">
                    ${templatesHtml}
                </div>
            </div>
        `;
        
        return modal;
    }
    
    function sendTemplateMessage(template) {
        const messageElement = createMessageElement(template.text, true);
        
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }
        
        scrollToBottom();
        
        // Simulate response
        setTimeout(simulateResponse, 1000 + Math.random() * 2000);
    }
    
    // Group chat functionality
    function initGroupChat() {
        if (isGroupChat) {
            updateGroupChatUI();
        }
    }
    
    function toggleGroupChat() {
        isGroupChat = !isGroupChat;
        
        if (isGroupChat) {
            groupMembers = ['Carlos Mendoza', 'Luis Pérez']; // Simulate group members
            showToast('Chat grupal activado');
        } else {
            groupMembers = [];
            showToast('Chat individual activado');
        }
        
        updateGroupChatUI();
    }
    
    function updateGroupChatUI() {
        const chatHeader = document.querySelector('.chat-header');
        if (!chatHeader) return;
        
        if (isGroupChat) {
            chatHeader.classList.add('group-chat');
            const participantInfo = chatHeader.querySelector('.participant-info');
            if (participantInfo) {
                participantInfo.innerHTML = `
                    <div class="group-info">
                        <div class="group-name">Grupo: Viaje UNMSM - Miraflores</div>
                        <div class="group-members">${groupMembers.length + 1} participantes</div>
                    </div>
                `;
            }
        } else {
            chatHeader.classList.remove('group-chat');
            // Restore individual chat UI
        }
    }
    
    // Translation functionality
    function initTranslation() {
        // Initialize translation service (simulate)
    }
    
    function toggleTranslation() {
        translationEnabled = !translationEnabled;
        
        if (translateBtn) {
            if (translationEnabled) {
                translateBtn.classList.add('active');
                showToast('Traducción automática activada');
            } else {
                translateBtn.classList.remove('active');
                showToast('Traducción automática desactivada');
            }
        }
    }
    
    // Trip integration functionality
    function initTripIntegration() {
        if (quickActionsPanel && currentTripData) {
            updateQuickActionsPanel();
        }
    }
    
    function updateQuickActionsPanel() {
        if (!quickActionsPanel) return;
        
        quickActionsPanel.innerHTML = `
            <div class="quick-actions-header">
                <span class="material-icons">flash_on</span>
                <span>Acciones rápidas</span>
            </div>
            <div class="quick-actions-buttons">
                <button class="quick-action-btn" onclick="confirmTrip()">
                    <span class="material-icons">check_circle</span>
                    <span>Confirmar viaje</span>
                </button>
                <button class="quick-action-btn" onclick="modifyTrip()">
                    <span class="material-icons">edit</span>
                    <span>Modificar</span>
                </button>
                <button class="quick-action-btn danger" onclick="cancelTrip()">
                    <span class="material-icons">cancel</span>
                    <span>Cancelar</span>
                </button>
            </div>
        `;
    }
    
    // Helper functions
    function formatTripDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    function getTripStatusText(status) {
        const statusMap = {
            'confirmed': 'Confirmado',
            'pending': 'Pendiente',
            'cancelled': 'Cancelado',
            'completed': 'Completado'
        };
        return statusMap[status] || status;
    }
    
    function simulateVoiceResponse() {
        const responses = [
            'Perfecto, nos vemos ahí',
            'Entendido, gracias por avisar',
            'Ok, te espero'
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        const messageElement = createMessageElement(response, false);
        
        if (typingIndicator) {
            chatMessages.insertBefore(messageElement, typingIndicator);
        } else {
            chatMessages.appendChild(messageElement);
        }
        
        scrollToBottom();
    }
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Global functions for onclick handlers
    window.toggleVoicePlayback = function(button, audioUrl) {
        const audio = new Audio(audioUrl);
        const icon = button.querySelector('.material-icons');
        
        if (icon.textContent === 'play_arrow') {
            audio.play();
            icon.textContent = 'pause';
            
            audio.onended = () => {
                icon.textContent = 'play_arrow';
            };
        } else {
            audio.pause();
            icon.textContent = 'play_arrow';
        }
    };
    
    window.openLocationInMap = function(lat, lng) {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    };
    
    window.confirmTrip = function() {
        showToast('Viaje confirmado');
        sendTemplateMessage({ text: 'Viaje confirmado ✅', icon: '✅' });
    };
    
    window.modifyTrip = function() {
        showToast('Redirigiendo a modificar viaje...');
    };
    
    window.cancelTrip = function() {
        if (confirm('¿Estás seguro de que quieres cancelar el viaje?')) {
            showToast('Viaje cancelado');
            sendTemplateMessage({ text: 'He cancelado el viaje ❌', icon: '❌' });
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChat);
    } else {
        initChat();
    }

})();
