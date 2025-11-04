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
    // Fallback local para el avatar del header (se reemplaza por uno aleatorio con JS)
    var fallbackAvatar = base + 'assets/images/avatars/default.svg';
    // Encabezado del drawer con avatar y nombre (solo mobile y logueado)
    var mobileProfileHeader = isLoggedIn
      ? '        <div class="nav-profile">\n' +
        '          <div class="nav-profile-avatar"><img class="js-random-avatar" data-size="48" data-variant="avataaars" src="' + fallbackAvatar + '" alt="Avatar de ' + userName + '"></div>\n' +
        '          <div class="nav-profile-info">\n' +
        '            <div class="nav-profile-name">' + userName + '</div>\n' +
        '          </div>\n' +
        '        </div>\n'
      : '';
    
    var authSection = isLoggedIn
      ? '<div class="user-info">\n' +
        '  <div class="notification-bell">\n' +
        '    <a href="' + base + 'pages/user/notifications.html" class="notification-link" aria-label="Notificaciones">\n' +
        '      <span class="bell-icon material-icons">notifications</span>\n' +
        '      <span class="notification-badge" style="display: none;">0</span>\n' +
        '    </a>\n' +
        '  </div>\n' +
        '  <button type="button" class="user-avatar" aria-haspopup="menu" aria-expanded="false" aria-label="Abrir menú de usuario"><img class="js-random-avatar" data-size="32" data-variant="avataaars" src="' + fallbackAvatar + '" alt="Avatar de ' + userName + '"></button>\n' +
        '  <div class="user-menu" hidden role="menu" aria-label="Opciones de usuario">\n' +
        '    <a href="' + base + 'pages/user/rate.html" class="menu-item" role="menuitem">Mis Reseñas</a>\n' +
        '    <button type="button" class="menu-item logout" role="menuitem">Cerrar sesión</button>\n' +
        '  </div>\n' +
        '</div>'
      : '<div class="auth-buttons">\n' +
        '        <a class="btn-login" href="' + base + 'pages/auth/login.html">Iniciar Sesión</a>\n' +
        '        <a class="btn-register" href="' + base + 'pages/auth/register.html">Registrarse</a>\n' +
        '      </div>';

    // Links del menú según rol
    var navLinks = '';
    var mobileUserLinks = '';
    if (isLoggedIn) {
      if (role === 'driver') {
        // Mantener minimal para conductor
        mobileUserLinks =
          '        <a href="' + base + 'pages/user/rate.html" class="nav-user-link" role="menuitem">Mis Reseñas</a>\n' +
          '        <button type="button" class="nav-user-link btn-logout" role="menuitem">Cerrar sesión</button>\n';
      } else {
        // Pasajero/Estudiante: orden solicitado en drawer
        mobileUserLinks =
          '        <a href="' + base + 'pages/user/profile.html" class="nav-user-link" role="menuitem">Mi Perfil</a>\n' +
          '        <a href="' + base + 'pages/reservations/my-reservations.html" class="nav-user-link" role="menuitem">Mis Reservas</a>\n' +
          '        <a href="' + base + 'pages/user/rate.html" class="nav-user-link" role="menuitem">Mis Reseñas</a>\n' +
          '        <a href="' + base + 'pages/chat/messages.html" class="nav-user-link" role="menuitem">Chat</a>\n' +
          '        <div class="nav-divider" role="separator" aria-hidden="true"></div>\n' +
          '        <a href="' + base + 'index.html" class="nav-user-link" role="menuitem">Inicio</a>\n' +
          '        <a href="' + base + 'pages/trips/search.html" class="nav-user-link" role="menuitem">Buscar Viaje</a>\n' +
          '        <div class="nav-divider" role="separator" aria-hidden="true"></div>\n' +
          '        <button type="button" class="nav-user-link btn-logout" role="menuitem">Cerrar sesión</button>\n';
      }
    }
    if (!isLoggedIn) {
      // Público: solo opciones principales
      navLinks =
        '        <a href="' + base + 'index.html">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/search.html">Buscar Viaje</a>\n';
      // En mobile mostrar estos como nav-user-link para que aparezcan en el drawer
      mobileUserLinks =
        '        <a href="' + base + 'index.html" class="nav-user-link" role="menuitem">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/search.html" class="nav-user-link" role="menuitem">Buscar Viaje</a>\n' +
        '        <div class="nav-divider" role="separator" aria-hidden="true"></div>\n' +
        '        <a href="' + base + 'pages/auth/login.html" class="nav-user-link btn-login" role="menuitem">Iniciar Sesión</a>\n' +
        '        <a href="' + base + 'pages/auth/register.html" class="nav-user-link btn-register" role="menuitem">Registrarse</a>\n';
    } else if (role === 'driver') {
      // Conductor
      navLinks =
        '        <a href="' + base + 'index.html">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/publish.html">Publicar Viaje</a>\n' +
        '        <a href="' + base + 'pages/trips/my-trips.html">Mis Viajes</a>\n' +
        '        <a href="' + base + 'pages/chat/messages.html">Chat</a>\n' +
        '        <a href="' + base + 'pages/user/profile.html">Mi Perfil</a>\n';
    } else {
      // Pasajero/Estudiante (role === 'passenger' u otros)
      navLinks =
        '        <a href="' + base + 'index.html">Inicio</a>\n' +
        '        <a href="' + base + 'pages/trips/search.html">Buscar Viaje</a>\n' +
        '        <a href="' + base + 'pages/reservations/my-reservations.html">Mis Reservas</a>\n' +
        '        <a href="' + base + 'pages/chat/messages.html">Chat</a>\n' +
        '        <a href="' + base + 'pages/user/profile.html">Mi Perfil</a>\n';
    }

    return (
      '\n<header class="header">\n' +
      '  <div class="container">\n' +
      '    <div class="header-content">\n' +
      '      <div class="brand-row">\n' +
      '        <a href="' + base + 'index.html" class="logo" aria-label="Inicio">\n' +
      '          <div class="logo-icon"><span class="material-icons">directions_car</span></div>\n' +
      '          <span>OnePath</span>\n' +
      '        </a>\n' +
      (isLoggedIn
        ? '        <div class="brand-notification">\n' +
          '          <a href="' + base + 'pages/user/notifications.html" class="notification-link" aria-label="Notificaciones">\n' +
          '            <span class="bell-icon material-icons">notifications</span>\n' +
          '            <span class="notification-badge" style="display: none;">0</span>\n' +
          '          </a>\n' +
          '        </div>\n'
        : '') +
      '        <button type="button" class="hamburger" aria-label="Menú" aria-expanded="false" aria-controls="primary-nav">\n' +
      '          <span class="hamburger-icon material-icons">menu</span>\n' +
      '        </button>\n' +
      '      </div>\n' +
      '      <nav class="nav" id="primary-nav" aria-label="Principal">\n' +
      mobileProfileHeader +
      mobileUserLinks +
      navLinks +
      '      </nav>\n' +
      authSection +
      '    </div>\n' +
      '    <div class="nav-overlay" hidden></div>\n' +
      '  </div>\n' +
      '</header>\n'
    );
  }

  // --- Utilidades de avatar aleatorio (DiceBear v8) ---
  function randomAvatarUrl(size, variant) {
    var seed = Math.random().toString(36).slice(2, 10);
    var sprite = (typeof variant === 'string' && variant.length) ? variant : 'avataaars';
    var s = parseInt(size || '64', 10);
    return 'https://api.dicebear.com/8.x/' + sprite + '/png?seed=' + seed + '&size=' + s;
  }

  function setRandomAvatars() {
    var imgs = document.querySelectorAll('img.js-random-avatar');
    imgs.forEach(function(img) {
      var fallback = img.getAttribute('src');
      var size = img.dataset.size || '64';
      var variant = img.dataset.variant || 'avataaars';
      var url = randomAvatarUrl(size, variant);
      img.onerror = function() { img.src = fallback; };
      img.src = url;
    });
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

  function initNotificationCount() {
    try {
      var notifications = JSON.parse(localStorage.getItem('onepath_notifications') || '[]');
      var unreadCount = notifications.filter(function(n) { return !n.read; }).length;
      // Actualizar todas las insignias de notificaciones (header y brand)
      var badges = document.querySelectorAll('.notification-badge');
      badges.forEach(function(badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      });
    } catch (e) {
      console.error('Error initializing notification count:', e);
    }
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

    // Initialize notification count
    setTimeout(initNotificationCount, 100);

    // Inicializa avatar aleatorio del header si corresponde
    setTimeout(setRandomAvatars, 0);

    // Menú de usuario: abrir/cerrar y logout
    var userInfoEl = document.querySelector('.user-info');
    var avatarBtn = userInfoEl ? userInfoEl.querySelector('.user-avatar') : null;
    var userMenuEl = userInfoEl ? userInfoEl.querySelector('.user-menu') : null;
    var logoutItem = userInfoEl ? userInfoEl.querySelector('.menu-item.logout') : null;
    var logoutNavBtn = document.querySelector('.nav .btn-logout');

    function closeUserMenu() {
      if (userMenuEl && !userMenuEl.hidden) {
        userMenuEl.hidden = true;
        if (avatarBtn) avatarBtn.setAttribute('aria-expanded', 'false');
      }
    }

    function toggleUserMenu(e) {
      e && e.preventDefault();
      if (!userMenuEl || !avatarBtn) return;
      var isOpen = !userMenuEl.hidden;
      userMenuEl.hidden = isOpen; // si estaba abierto, lo ocultamos
      if (!isOpen) {
        // abrir
        userMenuEl.hidden = false;
        avatarBtn.setAttribute('aria-expanded', 'true');
      } else {
        avatarBtn.setAttribute('aria-expanded', 'false');
      }
    }

    if (avatarBtn && userMenuEl) {
      avatarBtn.addEventListener('click', toggleUserMenu);
      // Cerrar al hacer click fuera
      document.addEventListener('click', function(ev) {
        if (!userInfoEl) return;
        var target = ev.target;
        if (!userInfoEl.contains(target)) {
          closeUserMenu();
        }
      });
      // Cerrar con Escape
      document.addEventListener('keydown', function(ev) {
        if (ev.key === 'Escape') closeUserMenu();
      });
    }

    function doLogout(e) {
      if (e) e.preventDefault();
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
      } catch (err) {
        console.error('Logout error:', err);
      }
    }

    if (logoutItem) {
      logoutItem.addEventListener('click', doLogout);
    }
    if (logoutNavBtn) {
      logoutNavBtn.addEventListener('click', doLogout);
    }

    // Menú móvil (hamburguesa)
    var headerEl = document.querySelector('.header');
    var navEl = document.getElementById('primary-nav');
    var overlayEl = document.querySelector('.nav-overlay');
    var hamburgerBtn = document.querySelector('.hamburger');

    if (hamburgerBtn && headerEl && navEl) {
      function closeMenu() {
        headerEl.classList.remove('menu-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        if (overlayEl) overlayEl.hidden = true;
      }

      function openMenu() {
        headerEl.classList.add('menu-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        if (overlayEl) overlayEl.hidden = false;
      }

      function toggleMenu() {
        if (headerEl.classList.contains('menu-open')) {
          closeMenu();
        } else {
          openMenu();
        }
      }

      hamburgerBtn.addEventListener('click', toggleMenu);
      if (overlayEl) {
        overlayEl.addEventListener('click', closeMenu);
      }

      // Cerrar al navegar por un enlace del menú
      navEl.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      // Cerrar automáticamente al pasar a escritorio
      window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
          closeMenu();
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


