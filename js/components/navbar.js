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

  function buildNavbarHtml(base) {
    return (
      '\n<header class="header">\n' +
      '  <div class="container">\n' +
      '    <div class="header-content">\n' +
      '      <div class="logo">\n' +
      '        <div class="logo-icon">🚗</div>\n' +
      '        <span>OnePath</span>\n' +
      '      </div>\n' +
      '      <nav class="nav" aria-label="Principal">\n' +
      '        <a href="' + base + 'index.html">Inicio</a>\n' +
      '        <a href="' + base + 'pages/trips/search.html">Buscar Viaje</a>\n' +
      '        <a href="' + base + 'pages/trips/publish.html">Ofrecer Viaje</a>\n' +
      '        <a href="' + base + 'pages/user/profile.html">Mi Perfil</a>\n' +
      '        <a href="#">Configuración</a>\n' +
      '      </nav>\n' +
      '      <div class="auth-buttons">\n' +
      '        <a class="btn-login" href="' + base + 'pages/auth/login.html">Iniciar Sesión</a>\n' +
      '        <a class="btn-register" href="' + base + 'pages/auth/register.html">Registrarse</a>\n' +
      '      </div>\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</header>\n'
    );
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNavbar);
  } else {
    renderNavbar();
  }
})();


