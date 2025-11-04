// Utilidades para verificación de sesión
(function() {
  'use strict';

  /**
   * Verifica si hay un usuario logueado
   * @returns {boolean} true si hay usuario logueado, false en caso contrario
   */
  function isLoggedIn() {
    return window.Storage && window.Storage.getCurrentUser() !== null;
  }

  /**
   * Obtiene el usuario actual
   * @returns {Object|null} Usuario actual o null
   */
  function getCurrentUser() {
    if (!window.Storage) {
      return null;
    }
    return window.Storage.getCurrentUser();
  }

  /**
   * Requiere que el usuario esté logueado, redirige a login si no lo está
   * @param {string} redirectUrl - URL a la que redirigir después del login
   */
  function requireAuth(redirectUrl = null) {
    if (!isLoggedIn()) {
      const currentUrl = window.location.pathname;
      const loginUrl = redirectUrl || `pages/auth/login.html?redirect=${encodeURIComponent(currentUrl)}`;
      
      // Determinar la ruta base
      const base = currentUrl.includes('/pages/') ? '../../' : '';
      window.location.href = base + loginUrl;
      return false;
    }
    return true;
  }

  /**
   * Cierra la sesión del usuario
   */
  function logout() {
    if (window.Storage) {
      window.Storage.clearCurrentUser();
      // Redirigir a la página de inicio
      const currentUrl = window.location.pathname;
      const base = currentUrl.includes('/pages/') ? '../../' : '';
      window.location.href = base + 'index.html';
    }
  }

  // Exportar funciones al scope global
  window.Session = {
    isLoggedIn,
    getCurrentUser,
    requireAuth,
    logout
  };

})();

