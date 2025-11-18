(function() {
  'use strict';

  // Silent demo seeding for UI previews. Ensures up to 10 diverse trips.
  function seedIfEmpty() {
    try {
      const hasTrips = !!localStorage.getItem('trips');
      const hasReservations = !!localStorage.getItem('reservations');
      const hasUser = !!localStorage.getItem('currentUser');
      const hasUsersList = !!localStorage.getItem('users');

      const now = new Date();
      const plusDays = (d) => { const n = new Date(now); n.setDate(n.getDate() + d); return n; };
      const minusDays = (d) => { const n = new Date(now); n.setDate(n.getDate() - d); return n; };
      const formatDate = (d) => d.toISOString().split('T')[0];

      // Seed a default current user
      const passenger = { id: 'passenger-001', name: 'María Gómez', role: 'passenger', university: 'UNMSM', major: 'Economía' };
      if (!hasUser) localStorage.setItem('currentUser', JSON.stringify(passenger));

      // Seed users with diverse driver ratings (only if missing)
      if (!hasUsersList) {
        const users = [
          { id: 'driver-001', name: 'Carlos Mendoza', role: 'driver', university: 'UNMSM', major: 'Ing. Sistemas', rating: 4.9 },
          { id: 'driver-002', name: 'Ana López', role: 'driver', university: 'PUCP', major: 'Medicina', rating: 4.7 },
          { id: 'driver-003', name: 'Juan Pérez', role: 'driver', university: 'UNI', major: 'Ing. Industrial', rating: 3.8 },
          { id: 'driver-004', name: 'Lucía Ramos', role: 'driver', university: 'UPC', major: 'Arquitectura', rating: 5.0 },
          { id: 'driver-005', name: 'Miguel Rojas', role: 'driver', university: 'UDEP', major: 'Derecho', rating: 2.9 },
          { id: 'driver-006', name: 'Sofía Castro', role: 'driver', university: 'USIL', major: 'Administración', rating: 4.2 },
          { id: 'driver-007', name: 'Pedro Silva', role: 'driver', university: 'UTP', major: 'Telecomunicaciones', rating: 3.1 },
          { id: 'driver-008', name: 'Valeria Díaz', role: 'driver', university: 'PUCP', major: 'Psicología', rating: 4.5 }
        ];
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Seed trips; if existing, top-up to 10 with diverse entries
      let trips = [];
      if (hasTrips) {
        try { trips = JSON.parse(localStorage.getItem('trips') || '[]') || []; } catch { trips = []; }
      }

      const baseTrips = [
        {
          id: 'trip-001', driverId: 'driver-001', creatorId: 'driver-001',
          origin: 'Metro San Isidro', originAddress: 'Av. Javier Prado Este 4200',
          originLat: -12.0978, originLng: -77.0365,
          destination: 'Puerta Principal UNMSM', destinationAddress: 'Av. Venezuela s/n, Lima',
          date: formatDate(plusDays(2)), time: '07:30',
          driverRating: 4.9, seats: 4, price: 8.00, passengers: ['passenger-001'], vehicle: 'Volkswagen Golf Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-002', driverId: 'driver-002', creatorId: 'driver-002',
          origin: 'Jockey Plaza', originAddress: 'Av. Javier Prado Este 4200',
          originLat: -12.0932, originLng: -76.9726,
          destination: 'Facultad de Medicina', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(3)), time: '08:00',
          driverRating: 4.7, seats: 3, price: 10.00, passengers: [], vehicle: 'Toyota Corolla Blanco',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-003', driverId: 'driver-003', creatorId: 'driver-003',
          origin: 'Miraflores Centro', originAddress: 'Av. Larco',
          originLat: -12.1211, originLng: -77.0306,
          destination: 'Biblioteca Central', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(minusDays(5)), time: '06:45',
          driverRating: 3.8, seats: 2, price: 6.00, passengers: ['passenger-002', 'passenger-003'], vehicle: 'Honda Civic Azul',
          createdAt: minusDays(6).toISOString()
        },
        {
          id: 'trip-004', driverId: 'driver-004', creatorId: 'driver-004',
          origin: 'San Borja', originAddress: 'Av. San Borja Sur 500',
          originLat: -12.1079, originLng: -77.0010,
          destination: 'UNMSM - Puerta Principal', destinationAddress: 'Av. Venezuela s/n, Lima',
          date: formatDate(plusDays(1)), time: '07:15',
          driverRating: 5.0, seats: 4, price: 0.00, passengers: [], vehicle: 'Minivan Familiar Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-005', driverId: 'driver-005', creatorId: 'driver-005',
          origin: 'La Molina', originAddress: 'Av. La Molina 1200',
          originLat: -12.0891, originLng: -76.9397,
          destination: 'UNI - Puerta 3', destinationAddress: 'Av. Túpac Amaru s/n',
          date: formatDate(plusDays(4)), time: '09:00',
          driverRating: 2.9, seats: 4, price: 22.00, passengers: [], vehicle: 'Ford Explorer SUV Negro',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-006', driverId: 'driver-006', creatorId: 'driver-006',
          origin: 'Barranco', originAddress: 'Parque Municipal',
          originLat: -12.1456, originLng: -77.0219,
          destination: 'UNMSM - Biblioteca Central', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(5)), time: '06:30',
          driverRating: 4.2, seats: 3, price: 15.00, passengers: [], vehicle: 'Kia Rio Negro',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-007', driverId: 'driver-007', creatorId: 'driver-007',
          origin: 'Jesús María', originAddress: 'Av. Salaverry 1500',
          originLat: -12.0725, originLng: -77.0435,
          destination: 'UNI - Biblioteca Central', destinationAddress: 'Av. Túpac Amaru s/n',
          date: formatDate(minusDays(2)), time: '07:45',
          driverRating: 3.1, seats: 2, price: 4.50, passengers: [], vehicle: 'Nissan Sentra Gris',
          createdAt: minusDays(3).toISOString()
        },
        {
          id: 'trip-008', driverId: 'driver-008', creatorId: 'driver-008',
          origin: 'Surco', originAddress: 'Av. Caminos del Inca',
          originLat: -12.1550, originLng: -76.9910,
          destination: 'PUCP - Puerta Principal', destinationAddress: 'Av. Universitaria',
          date: formatDate(plusDays(2)), time: '08:20',
          driverRating: 4.5, seats: 3, price: 2.50, passengers: [], vehicle: 'Volkswagen Golf Blanco',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-009', driverId: 'driver-002', creatorId: 'driver-002',
          origin: 'Chorrillos', originAddress: 'Av. Defensores del Morro',
          originLat: -12.1749, originLng: -77.0260,
          destination: 'UNMSM - Facultad de Ingeniería', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(6)), time: '07:10',
          driverRating: 4.7, seats: 4, price: 30.00, passengers: [], vehicle: 'Toyota Highlander SUV Azul',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-010', driverId: 'driver-003', creatorId: 'driver-003',
          origin: 'Magdalena', originAddress: 'Av. Brasil',
          originLat: -12.0869, originLng: -77.0731,
          destination: 'UNMSM - Facultad de Derecho', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(3)), time: '07:50',
          driverRating: 3.8, seats: 2, price: 11.00, passengers: [], vehicle: 'Toyota Familiar Verso',
          createdAt: now.toISOString()
        }
      ];

      if (!hasTrips) {
        trips = baseTrips;
      } else {
        // Top up to 10, avoiding ID collisions
        const existingIds = new Set(trips.map(t => String(t.id)));
        baseTrips.forEach(t => { if (!existingIds.has(String(t.id))) trips.push(t); });
        if (trips.length > 10) trips = trips.slice(0, 10);
      }

      localStorage.setItem('trips', JSON.stringify(trips));

      // Seed minimal reservations if missing
      if (!hasReservations) {
        const reservations = [
          { id: 'res-001', tripId: 'trip-001', passengerId: 'passenger-001', status: 'confirmed', price: 8.00, createdAt: now.toISOString() },
          { id: 'res-002', tripId: 'trip-002', passengerId: 'passenger-001', status: 'pending', price: 10.00, createdAt: now.toISOString() }
        ];
        localStorage.setItem('reservations', JSON.stringify(reservations));
      }

      // Store demo quick-switch users
      localStorage.setItem('demoPassenger', JSON.stringify(passenger));
      localStorage.setItem('demoDriver', JSON.stringify({ id: 'driver-001', name: 'Carlos Mendoza', role: 'driver' }));
    } catch (e) {
      console.error('Demo seed error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', seedIfEmpty);
  } else {
    seedIfEmpty();
  }
})();


