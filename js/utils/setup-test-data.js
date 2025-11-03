// Script para crear datos de prueba para la página de Mis Viajes
(function() {
  'use strict';

  function setupTestData() {
    // Crear usuario de prueba (pasajero)
    const testUser = {
      id: 'passenger-001',
      name: 'María',
      email: 'maria@unmsm.edu.pe',
      role: 'passenger'
    };

    localStorage.setItem('currentUser', JSON.stringify(testUser));
    
    // Crear usuario conductor de prueba
    const driverUser = {
      id: 'driver-001',
      name: 'Carlos',
      email: 'carlos@unmsm.edu.pe',
      role: 'driver'
    };

    // Crear viajes de prueba
    const now = new Date();
    
    // Viaje próximo 1: Mañana a las 7:30
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 7); // 7 días para que sea próximo
    tomorrow.setHours(7, 30, 0, 0);

    // Viaje próximo 2: Pasado mañana a las 8:00
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 8); // 8 días
    dayAfterTomorrow.setHours(8, 0, 0, 0);

    // Viaje pasado: Hace una semana
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(9, 0, 0, 0);

    const trips = [
      {
        id: 'trip-001',
        driverId: 'driver-001',
        creatorId: 'driver-001',
        origin: 'Metro San Isidro',
        originAddress: 'Av. Javier Prado Este 4200',
        destination: 'Puerta Principal UNMSM',
        destinationAddress: 'Av. Venezuela s/n, Lima',
        date: tomorrow.toISOString().split('T')[0],
        time: '07:30',
        driverName: 'Carlos M.',
        driverMajor: 'Ing. Sistemas',
        driverRating: 4.9,
        seats: 4,
        price: 8.00,
        notes: 'Punto de encuentro en la estación del metro',
        passengers: ['passenger-001'],
        vehicle: 'Volkswagen Golf Gris',
        createdAt: new Date().toISOString()
      },
      {
        id: 'trip-002',
        driverId: 'driver-001',
        creatorId: 'driver-001',
        origin: 'Jockey Plaza',
        originAddress: 'Av. Javier Prado Este 4200',
        destination: 'Facultad de Medicina',
        destinationAddress: 'Ciudad Universitaria',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        time: '08:00',
        driverName: 'Ana L.',
        driverMajor: 'Medicina',
        driverRating: 4.2,
        seats: 3,
        price: 10.00,
        notes: null,
        passengers: [],
        vehicle: 'Toyota Corolla Blanco',
        createdAt: new Date().toISOString()
      },
      {
        id: 'trip-003',
        driverId: 'driver-001',
        creatorId: 'driver-001',
        origin: 'Miraflores Centro',
        destination: 'Biblioteca Central',
        date: lastWeek.toISOString().split('T')[0],
        time: '06:45',
        seats: 2,
        price: 6.00,
        notes: 'Viaje completado',
        passengers: ['passenger-002', 'passenger-003'],
        vehicle: 'Honda Civic Azul',
        createdAt: new Date(lastWeek.getTime() - 86400000).toISOString()
      }
    ];

    localStorage.setItem('trips', JSON.stringify(trips));
    
    // Crear reservas de prueba
    const reservations = [
      {
        id: 'res-001',
        tripId: 'trip-001',
        passengerId: 'passenger-001',
        status: 'confirmed',
        price: 8.00,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // Hace 2 horas
      },
      {
        id: 'res-002',
        tripId: 'trip-002',
        passengerId: 'passenger-001',
        status: 'pending',
        price: 10.00,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // Hace 2 horas
      }
    ];
    
    localStorage.setItem('reservations', JSON.stringify(reservations));

    console.log('✅ Datos de prueba creados exitosamente!');
    console.log('- Usuario:', testUser.name);
    console.log('- Viajes creados:', trips.length);
    console.log('- Reservas creadas:', reservations.length);
    
    alert('✅ Datos de prueba creados!\n\nSe han creado:\n- Usuario pasajero: ' + testUser.name + '\n- 3 viajes de ejemplo\n- 2 reservas de prueba\n\nRecarga la página para verlos.');
  }
  
  function setupTestDataForReservations() {
    // Setup específico para página de reservas
    setupTestData();
    alert('✅ Datos de prueba para reservas creados!\n\nRecarga la página para ver tus reservas.');
  }

  // Ejecutar si se llama directamente desde la consola o si hay un botón
  if (typeof window !== 'undefined') {
    // Crear un botón en la página de desarrollo para facilitar la carga de datos
    if (window.location.pathname.includes('my-trips.html') || window.location.pathname.includes('my-reservations.html')) {
      const setupBtn = document.createElement('button');
      setupBtn.textContent = '🔄 Cargar Datos de Prueba';
      setupBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        padding: 12px 24px;
        background-color: var(--primary-blue, #3498db);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      setupBtn.addEventListener('click', () => {
        setupTestData();
        location.reload();
      });
      
      // Agregar después de que el body esté listo
      if (document.body) {
        document.body.appendChild(setupBtn);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(setupBtn);
        });
      }
    }

    // También disponible globalmente
    window.setupTestData = setupTestData;
    window.setupTestDataForReservations = setupTestDataForReservations;
    
    // Auto-setup para página de reservas
    if (window.location.pathname.includes('my-reservations.html')) {
      // Verificar si ya hay datos, si no, crear datos de prueba
      const existingUser = localStorage.getItem('currentUser');
      const existingReservations = localStorage.getItem('reservations');
      if (!existingUser || !existingReservations) {
        console.log('🔄 Configurando datos de prueba automáticamente...');
        setupTestData();
      }
    }
  }

})();

