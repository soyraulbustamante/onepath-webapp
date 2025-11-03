// Navbar component - vanilla JS
// Renders a consistent header into an element with id="navbar" if present,
// otherwise prepends it to the <body>.

(function () {
  function getBasePrefix() {
    // Prefer explicit prefix from script tag if provided
    var script = document.getElementById('navbar-script');
    if (script && script.dataset && typeof script.dataset.basePrefix === 'string') {
      return script.dataset.basePrefix;
    }
    // Fallback heuristic: if path includes /pages/ assume two levels up
    var path = window.location.pathname || '';
    return path.indexOf('/pages/') !== -1 ? '../../' : '';
  }

  function getCurrentUser() {
    try {
      var userData = localStorage.getItem('currentUser');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
    return null;
  }

  function buildNavbarHtml(base) {
    var user = getCurrentUser();
    var isLoggedIn = user !== null;
    var userName = user && user.name ? user.name.split(' ')[0] : 'Usuario';
    var role = user && user.role ? user.role : null; // 'driver' | 'passenger'
    
    var authSection = isLoggedIn
      ? '<div class="user-info">\n' +
        '  <span class="user-name">' + userName + '</span>\n' +
        '  <button type="button" class="btn-logout" aria-label="Cerrar sesión">Salir</button>\n' +
        '</div>'
      : '<div class="auth-buttons">\n' +
        '        <a class="btn-login" href="' + base + 'pages/auth/login.html">Iniciar Sesión</a>\n' +
        '        <a class="btn-register" href="' + base + 'pages/auth/register.html">Registrarse</a>\n' +
        '      </div>';

    // Links del menú según rol
    var navLinks = '';
    if (!isLoggedIn) {
      // Público: mostrar opciones generales
      navLinks =
        '        <a href="' + base + 'index.html">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/search.html">Buscar Viaje</a>\n' +
        '        <a href="' + base + 'pages/trips/publish.html">Ofrecer Viaje</a>\n' +
        '        <a href="' + base + 'pages/user/profile.html">Mi Perfil</a>\n' +
        '        <a href="#">Configuración</a>\n';
    } else if (role === 'driver') {
      // Conductor
      navLinks =
        '        <a href="' + base + 'index.html">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/publish.html">Publicar Viaje</a>\n' +
        '        <a href="' + base + 'pages/trips/my-trips.html">Mis Viajes</a>\n' +
        '        <a href="' + base + 'pages/chat/messages.html">Chat</a>\n' +
        '        <a href="' + base + 'pages/user/profile.html">Mi Perfil</a>\n' +
        '        <a href="#">Configuración</a>\n';
    } else {
      // Pasajero/Estudiante (role === 'passenger' u otros)
      navLinks =
        '        <a href="' + base + 'index.html">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/search.html">Buscar Viaje</a>\n' +
        '        <a href="' + base + 'pages/reservations/my-reservations.html">Mis Reservas</a>\n' +
        '        <a href="' + base + 'pages/chat/messages.html">Chat</a>\n' +
        '        <a href="' + base + 'pages/user/profile.html">Mi Perfil</a>\n' +
        '        <a href="#">Configuración</a>\n';
    }

    return (
      '\n<header class="header">\n' +
      '  <div class="container">\n' +
      '    <div class="header-content">\n' +
      '      <div class="logo">\n' +
      '        <div class="logo-icon">🚗</div>\n' +
      '        <span>OnePath</span>\n' +
      '      </div>\n' +
      '      <nav class="nav" aria-label="Principal">\n' +
      navLinks +
      '      </nav>\n' +
      authSection +
      '    </div>\n' +
      '  </div>\n' +
      '</header>\n'
    );
  }

  function markActiveLink() {
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(function(link) {
      var linkPath = link.getAttribute('href');
      if (linkPath && currentPath.indexOf(linkPath) !== -1) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function renderNavbar() {
    var base = getBasePrefix();
    var html = buildNavbarHtml(base);
    var mount = document.getElementById('navbar');
    if (mount) {
      mount.innerHTML = html;
    } else {
      var temp = document.createElement('div');
      temp.innerHTML = html;
      document.body.insertBefore(temp.firstChild, document.body.firstChild);
    }
    
    // Mark active link after rendering
    setTimeout(markActiveLink, 0);

    // Wire logout if present
    var logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        try {
          if (window.Session && typeof window.Session.logout === 'function') {
            window.Session.logout();
          } else {
            // Fallback directo
            localStorage.removeItem('currentUser');
            var currentPath = window.location.pathname;
            var basePath = currentPath.indexOf('/pages/') !== -1 ? '../../' : '';
            window.location.href = basePath + 'index.html';
          }
        } catch (e) {
          console.error('Logout error:', e);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNavbar);
  } else {
    renderNavbar();
  }
})();


