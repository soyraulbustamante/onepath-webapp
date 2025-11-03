// Chat functionality - OnePath
(function() {
    'use strict';

    // DOM elements
    let chatMessages, messageInput, sendButton, typingIndicator;

    // Initialize chat functionality
    function initChat() {
        // Get DOM elements
        chatMessages = document.getElementById('chat-messages');
        messageInput = document.getElementById('messageInput');
        sendButton = document.getElementById('sendButton');
        typingIndicator = document.getElementById('typing-indicator');

        if (!chatMessages || !messageInput || !sendButton) {
            console.error('Required chat elements not found');
            return;
        }

        // Bind events
        bindEvents();

        // Auto-scroll to bottom
        scrollToBottom();
    }

    // Bind event listeners
    function bindEvents() {
        // Send message on button click
        sendButton.addEventListener('click', handleSendMessage);

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
    }

    // Handle sending a message
    function handleSendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

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
                message = 'Te comparto mi ubicación actual 📍';
                break;
            case 'photo':
                message = 'Te envío una foto para que me puedas ubicar 📷';
                break;
            case 'report':
                message = 'Tengo un problema con el punto de encuentro ⚠️';
                break;
        }

        if (message) {
            messageInput.value = message;
            messageInput.focus();
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

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChat);
    } else {
        initChat();
    }

})();
