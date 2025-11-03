// Funcionalidad de login
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si ya hay un usuario logueado
  if (window.Storage && window.Storage.getCurrentUser()) {
    const user = window.Storage.getCurrentUser();
    showLoggedInNotice(user && user.name ? user.name : 'Usuario');
    // No redirigir automáticamente; permitir cambiar de cuenta desde esta página
  }

  // Toggle para mostrar/ocultar contraseña
  const toggle = document.getElementById('toggle-password');
  const input = document.getElementById('password');
  if (toggle && input) {
    toggle.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(isHidden));
    });
  }

  // Manejar el formulario de login
  const loginForm = document.querySelector('form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

/**
 * Maneja el envío del formulario de login
 * @param {Event} e - Evento del formulario
 */
function handleLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.querySelector('input[name="remember"]');

  if (!emailInput || !passwordInput) {
    showError('Error: No se encontraron los campos del formulario');
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const remember = rememberCheckbox ? rememberCheckbox.checked : false;

  // Validar campos
  if (!email || !password) {
    showError('Por favor, completa todos los campos');
    return;
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    showError('Por favor, ingresa un correo universitario válido');
    return;
  }

  // Intentar hacer login
  if (!window.Storage) {
    showError('Error: No se pudo acceder al almacenamiento. Recarga la página.');
    return;
  }

  // Buscar usuario por email
  const user = window.Storage.getUserByEmail(email);

  if (!user) {
    showError('Correo o contraseña incorrectos');
    return;
  }

  // Verificar contraseña (en producción esto estaría hasheado)
  if (user.password !== password) {
    showError('Correo o contraseña incorrectos');
    return;
  }

  // Preparar datos del usuario para guardar (sin la contraseña)
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    university: user.university,
    major: user.major,
    rating: user.rating
  };

  // Guardar usuario en localStorage
  const saved = window.Storage.setCurrentUser(userData);
  if (!saved) {
    showError('Error al guardar la sesión. Intenta nuevamente.');
    return;
  }

  // Mostrar mensaje de éxito
  showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');

  // Redirigir después de un breve delay
  setTimeout(() => {
    redirectAfterLogin();
  }, 500);
}

/**
 * Redirige al usuario después del login
 */
function redirectAfterLogin() {
  // Verificar si hay una URL de redirección en los parámetros
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect');

  if (redirectUrl) {
    // Determinar la ruta base según la ubicación actual
    const currentPath = window.location.pathname;
    const base = currentPath.includes('/pages/') ? '../../' : '';
    
    // Si la URL de redirección ya tiene la ruta completa, usarla
    if (redirectUrl.startsWith('/') || redirectUrl.startsWith('http')) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = base + redirectUrl;
    }
  } else {
    // Redirigir a la página principal
    const currentPath = window.location.pathname;
    const base = currentPath.includes('/pages/') ? '../../' : '';
    window.location.href = base + 'index.html';
  }
}

/**
 * Valida formato de email universitario
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje a mostrar
 */
function showError(message) {
  // Remover mensajes anteriores
  removeMessages();

  const form = document.querySelector('form');
  if (!form) return;

  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-message form-message--error';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = message;

  // Insertar antes del botón de submit
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    form.insertBefore(errorDiv, submitButton);
  } else {
    form.appendChild(errorDiv);
  }

  // Hacer scroll al mensaje
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
function showSuccess(message) {
  // Remover mensajes anteriores
  removeMessages();

  const form = document.querySelector('form');
  if (!form) return;

  const successDiv = document.createElement('div');
  successDiv.className = 'form-message form-message--success';
  successDiv.setAttribute('role', 'status');
  successDiv.textContent = message;

  // Insertar antes del botón de submit
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    form.insertBefore(successDiv, submitButton);
  } else {
    form.appendChild(successDiv);
  }

  // Hacer scroll al mensaje
  successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Elimina todos los mensajes del formulario
 */
function removeMessages() {
  const messages = document.querySelectorAll('.form-message');
  messages.forEach(msg => msg.remove());
}

/**
 * Muestra aviso si ya hay una sesión iniciada y permite cambiar de cuenta
 * @param {string} name - Nombre del usuario actual
 */
function showLoggedInNotice(name) {
  const form = document.querySelector('form');
  if (!form) return;

  // Mensaje informativo
  const info = document.createElement('div');
  info.className = 'form-message form-message--success';
  info.setAttribute('role', 'status');
  info.innerHTML = 'Ya has iniciado sesión como <strong>' + name + '</strong>. ' +
    '<button type="button" id="switch-account" style="margin-left:8px; padding:6px 10px; border-radius:6px; border:1px solid #d1d5db; background:#fff; cursor:pointer;">Cambiar de cuenta</button>';

  form.insertBefore(info, form.firstChild);

  const switchBtn = document.getElementById('switch-account');
  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      if (window.Storage) {
        window.Storage.clearCurrentUser();
      }
      // Mantenerse en la página para permitir iniciar con otra cuenta
      window.location.reload();
    });
  }
}

