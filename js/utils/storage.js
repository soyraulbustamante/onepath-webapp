// Utilidades para manejo de almacenamiento local
(function() {
  'use strict';

  const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser',
    USERS: 'users',
    TRIPS: 'trips',
    RESERVATIONS: 'reservations'
  };

  /**
   * Obtiene el usuario actual desde localStorage
   * @returns {Object|null} Usuario actual o null si no está logueado
   */
  function getCurrentUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
    return null;
  }

  /**
   * Guarda el usuario actual en localStorage
   * @param {Object} user - Objeto con datos del usuario
   */
  function setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return true;
    } catch (e) {
      console.error('Error saving user data:', e);
      return false;
    }
  }

  /**
   * Elimina el usuario actual de localStorage (logout)
   */
  function clearCurrentUser() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return true;
    } catch (e) {
      console.error('Error clearing user data:', e);
      return false;
    }
  }

  /**
   * Obtiene todos los usuarios registrados
   * @returns {Array} Array de usuarios
   */
  function getUsers() {
    try {
      const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
      if (usersData) {
        return JSON.parse(usersData);
      }
    } catch (e) {
      console.error('Error reading users data:', e);
    }
    return [];
  }

  /**
   * Guarda un array de usuarios en localStorage
   * @param {Array} users - Array de usuarios
   */
  function setUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Error saving users data:', e);
      return false;
    }
  }

  /**
   * Agrega un nuevo usuario a la lista
   * @param {Object} user - Datos del usuario a agregar
   */
  function addUser(user) {
    const users = getUsers();
    // Verificar si el usuario ya existe por email
    const exists = users.some(u => u.email === user.email);
    if (exists) {
      return false;
    }
    users.push(user);
    return setUsers(users);
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Object|null} Usuario encontrado o null
   */
  function getUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email === email) || null;
  }

  /**
   * Inicializa usuarios de prueba si no existen
   */
  function initializeTestUsers() {
    const existingUsers = getUsers();
    if (existingUsers.length > 0) {
      return; // Ya hay usuarios
    }

    const testUsers = [
      {
        id: 'user-001',
        name: 'María González',
        email: 'maria@unmsm.edu.pe',
        password: 'password123',
        role: 'passenger',
        university: 'UNMSM',
        major: 'Ing. Sistemas',
        rating: 4.9
      },
      {
        id: 'user-002',
        name: 'Carlos Mendoza',
        email: 'carlos@unmsm.edu.pe',
        password: 'password123',
        role: 'driver',
        university: 'UNMSM',
        major: 'Ing. Civil',
        rating: 4.7
      },
      {
        id: 'user-003',
        name: 'Ana López',
        email: 'ana@pucp.edu.pe',
        password: 'password123',
        role: 'passenger',
        university: 'PUCP',
        major: 'Medicina',
        rating: 5.0
      },
      {
        id: 'user-004',
        name: 'Juan Pérez',
        email: 'juan@uni.edu.pe',
        password: 'password123',
        role: 'driver',
        university: 'UNI',
        major: 'Ing. Industrial',
        rating: 4.8
      }
    ];

    setUsers(testUsers);
    console.log('✅ Usuarios de prueba inicializados');
  }

  // Exportar funciones al scope global
  window.Storage = {
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    getUsers,
    setUsers,
    addUser,
    getUserByEmail,
    initializeTestUsers,
    STORAGE_KEYS
  };

  // Inicializar usuarios de prueba automáticamente
  if (typeof window !== 'undefined') {
    initializeTestUsers();
  }

})();

