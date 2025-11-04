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
        id: 'passenger-001',
        name: 'María González',
        email: 'maria@unmsm.edu.pe',
        password: 'password123',
        role: 'passenger',
        university: 'UNMSM',
        major: 'Ing. Sistemas',
        rating: 4.9
      },
      {
        id: 'driver-001',
        name: 'Carlos Mendoza',
        email: 'carlos@unmsm.edu.pe',
        password: 'password123',
        role: 'driver',
        university: 'UNMSM',
        major: 'Ing. Civil',
        rating: 4.7
      },
      {
        id: 'passenger-002',
        name: 'Ana López',
        email: 'ana@pucp.edu.pe',
        password: 'password123',
        role: 'passenger',
        university: 'PUCP',
        major: 'Medicina',
        rating: 5.0
      },
      {
        id: 'driver-002',
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

    // Crear viajes y reservas de prueba si aún no existen
    try {
      const hasTrips = !!localStorage.getItem(STORAGE_KEYS.TRIPS);
      const hasReservations = !!localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      const now = new Date();
      const formatDate = (d) => d.toISOString().split('T')[0];
      const plusDays = (d) => { const n = new Date(now); n.setDate(n.getDate() + d); return n; };
      const minusDays = (d) => { const n = new Date(now); n.setDate(n.getDate() - d); return n; };

      // IDs de usuarios de prueba
      const PASSENGER_1 = 'passenger-001'; // María
      const PASSENGER_2 = 'passenger-002'; // Ana
      const DRIVER_1 = 'driver-001';    // Carlos
      const DRIVER_2 = 'driver-002';    // Juan

      if (!hasTrips) {
        const trips = [
          {
            id: 'trip-101', driverId: DRIVER_1, creatorId: DRIVER_1,
            origin: 'Miraflores', originAddress: 'Av. Larco 999',
            destination: 'UNMSM - Puerta Principal', destinationAddress: 'Av. Venezuela s/n, Lima',
            date: formatDate(plusDays(1)), time: '07:30',
            seats: 4, price: 8.00, passengers: [PASSENGER_1], vehicle: 'Toyota Corolla Blanco',
            createdAt: now.toISOString()
          },
          {
            id: 'trip-102', driverId: DRIVER_1, creatorId: DRIVER_1,
            origin: 'San Borja', originAddress: 'Av. San Borja Sur 500',
            destination: 'Facultad de Medicina', destinationAddress: 'Ciudad Universitaria',
            date: formatDate(plusDays(2)), time: '08:00',
            seats: 3, price: 10.00, passengers: [], vehicle: 'Volkswagen Golf Gris',
            createdAt: now.toISOString()
          },
          {
            id: 'trip-103', driverId: DRIVER_1, creatorId: DRIVER_1,
            origin: 'Barranco', originAddress: 'Parque Municipal',
            destination: 'Biblioteca Central', destinationAddress: 'Ciudad Universitaria',
            date: formatDate(minusDays(3)), time: '06:45',
            seats: 2, price: 6.00, passengers: [PASSENGER_1, PASSENGER_2], vehicle: 'Honda Civic Azul',
            createdAt: minusDays(4).toISOString()
          },
          {
            id: 'trip-104', driverId: DRIVER_2, creatorId: DRIVER_2,
            origin: 'La Molina', originAddress: 'Av. La Molina 1200',
            destination: 'UNI - Puerta 3', destinationAddress: 'Av. Túpac Amaru s/n',
            date: formatDate(plusDays(3)), time: '07:15',
            seats: 4, price: 9.00, passengers: [PASSENGER_2], vehicle: 'Kia Rio Negro',
            createdAt: now.toISOString()
          },
          {
            id: 'trip-105', driverId: DRIVER_2, creatorId: DRIVER_2,
            origin: 'Jesús María', originAddress: 'Av. Salaverry 1500',
            destination: 'UNI - Biblioteca Central', destinationAddress: 'Av. Túpac Amaru s/n',
            date: formatDate(minusDays(7)), time: '06:30',
            seats: 3, price: 7.50, passengers: [PASSENGER_2], vehicle: 'Nissan Sentra Gris',
            createdAt: minusDays(8).toISOString()
          },
          {
            id: 'trip-106', driverId: DRIVER_2, creatorId: DRIVER_2,
            origin: 'Surco', originAddress: 'Av. Benavides 3000',
            destination: 'PUCP - Ingreso Principal', destinationAddress: 'Av. Universitaria 1801',
            date: formatDate(plusDays(4)), time: '07:50',
            seats: 4, price: 8.50, passengers: [], vehicle: 'Hyundai Accent Azul',
            createdAt: now.toISOString()
          }
        ];
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
      }

      if (!hasReservations) {
        const reservations = [
          // Reservas para María (user-001)
          { id: 'res-101', tripId: 'trip-101', passengerId: PASSENGER_1, status: 'confirmed', price: 8.00, createdAt: now.toISOString() },
          { id: 'res-102', tripId: 'trip-102', passengerId: PASSENGER_1, status: 'pending',   price: 10.00, createdAt: now.toISOString() },
          { id: 'res-103', tripId: 'trip-103', passengerId: PASSENGER_1, status: 'confirmed', price: 6.00, createdAt: minusDays(3).toISOString() },
          { id: 'res-104', tripId: 'trip-104', passengerId: PASSENGER_1, status: 'pending',   price: 9.00, createdAt: plusDays(1).toISOString() },
          { id: 'res-105', tripId: 'trip-105', passengerId: PASSENGER_1, status: 'confirmed', price: 7.50, createdAt: minusDays(7).toISOString() },
          // Reservas para Ana (user-003)
          { id: 'res-106', tripId: 'trip-103', passengerId: PASSENGER_2, status: 'confirmed', price: 6.00, createdAt: minusDays(3).toISOString() },
          { id: 'res-107', tripId: 'trip-104', passengerId: PASSENGER_2, status: 'confirmed', price: 9.00, createdAt: now.toISOString() },
          { id: 'res-108', tripId: 'trip-105', passengerId: PASSENGER_2, status: 'confirmed', price: 7.50, createdAt: minusDays(7).toISOString() },
          { id: 'res-109', tripId: 'trip-106', passengerId: PASSENGER_2, status: 'pending',   price: 8.50, createdAt: plusDays(2).toISOString() },
          { id: 'res-110', tripId: 'trip-102', passengerId: PASSENGER_2, status: 'pending',   price: 10.00, createdAt: now.toISOString() }
        ];
        localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
      }

      console.log('✅ Usuarios, viajes y reservas de prueba inicializados');
    } catch (e) {
      console.error('Error inicializando datos de prueba:', e);
    }
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

