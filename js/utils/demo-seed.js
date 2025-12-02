(function () {
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

      // Seed trips; always refresh to ensure latest data structure and volume
      const baseTrips = [
        {
          id: 'trip-001', driverId: 'driver-001', driverName: 'Carlos Mendoza', creatorId: 'driver-001',
          origin: 'Metro San Isidro', originAddress: 'Av. Javier Prado Este 4200',
          originLat: -12.0978, originLng: -77.0365,
          destination: 'Puerta Principal UNMSM', destinationAddress: 'Av. Venezuela s/n, Lima',
          date: formatDate(plusDays(2)), time: '07:30',
          driverRating: 4.9, seats: 4, price: 8.00, passengers: ['passenger-001'], vehicle: 'Volkswagen Golf Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-002', driverId: 'driver-002', driverName: 'Ana López', creatorId: 'driver-002',
          origin: 'Jockey Plaza', originAddress: 'Av. Javier Prado Este 4200',
          originLat: -12.0932, originLng: -76.9726,
          destination: 'Facultad de Medicina', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(3)), time: '08:00',
          driverRating: 4.7, seats: 3, price: 10.00, passengers: [], vehicle: 'Toyota Corolla Blanco',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-003', driverId: 'driver-003', driverName: 'Juan Pérez', creatorId: 'driver-003',
          origin: 'Miraflores Centro', originAddress: 'Av. Larco',
          originLat: -12.1211, originLng: -77.0306,
          destination: 'Biblioteca Central', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(minusDays(5)), time: '06:45',
          driverRating: 3.8, seats: 2, price: 6.00, passengers: ['passenger-002', 'passenger-003'], vehicle: 'Honda Civic Azul',
          createdAt: minusDays(6).toISOString()
        },
        {
          id: 'trip-004', driverId: 'driver-004', driverName: 'Lucía Ramos', creatorId: 'driver-004',
          origin: 'San Borja', originAddress: 'Av. San Borja Sur 500',
          originLat: -12.1079, originLng: -77.0010,
          destination: 'UNMSM - Puerta Principal', destinationAddress: 'Av. Venezuela s/n, Lima',
          date: formatDate(plusDays(1)), time: '07:15',
          driverRating: 5.0, seats: 4, price: 0.00, passengers: [], vehicle: 'Minivan Familiar Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-005', driverId: 'driver-005', driverName: 'Miguel Rojas', creatorId: 'driver-005',
          origin: 'La Molina', originAddress: 'Av. La Molina 1200',
          originLat: -12.0891, originLng: -76.9397,
          destination: 'UNI - Puerta 3', destinationAddress: 'Av. Túpac Amaru s/n',
          date: formatDate(plusDays(4)), time: '09:00',
          driverRating: 2.9, seats: 4, price: 22.00, passengers: [], vehicle: 'Ford Explorer SUV Negro',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-006', driverId: 'driver-006', driverName: 'Sofía Castro', creatorId: 'driver-006',
          origin: 'Barranco', originAddress: 'Parque Municipal',
          originLat: -12.1456, originLng: -77.0219,
          destination: 'UNMSM - Biblioteca Central', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(5)), time: '06:30',
          driverRating: 4.2, seats: 3, price: 15.00, passengers: [], vehicle: 'Kia Rio Negro',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-007', driverId: 'driver-007', driverName: 'Pedro Silva', creatorId: 'driver-007',
          origin: 'Jesús María', originAddress: 'Av. Salaverry 1500',
          originLat: -12.0725, originLng: -77.0435,
          destination: 'UNI - Biblioteca Central', destinationAddress: 'Av. Túpac Amaru s/n',
          date: formatDate(minusDays(2)), time: '07:45',
          driverRating: 3.1, seats: 2, price: 4.50, passengers: [], vehicle: 'Nissan Sentra Gris',
          createdAt: minusDays(3).toISOString()
        },
        {
          id: 'trip-008', driverId: 'driver-008', driverName: 'Valeria Díaz', creatorId: 'driver-008',
          origin: 'Surco', originAddress: 'Av. Caminos del Inca',
          originLat: -12.1550, originLng: -76.9910,
          destination: 'PUCP - Puerta Principal', destinationAddress: 'Av. Universitaria',
          date: formatDate(plusDays(2)), time: '08:20',
          driverRating: 4.5, seats: 3, price: 2.50, passengers: [], vehicle: 'Volkswagen Golf Blanco',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-009', driverId: 'driver-002', driverName: 'Ana López', creatorId: 'driver-002',
          origin: 'Chorrillos', originAddress: 'Av. Defensores del Morro',
          originLat: -12.1749, originLng: -77.0260,
          destination: 'UNMSM - Facultad de Ingeniería', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(6)), time: '07:10',
          driverRating: 4.7, seats: 4, price: 30.00, passengers: [], vehicle: 'Toyota Highlander SUV Azul',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-010', driverId: 'driver-003', driverName: 'Juan Pérez', creatorId: 'driver-003',
          origin: 'Magdalena', originAddress: 'Av. Brasil',
          originLat: -12.0869, originLng: -77.0731,
          destination: 'UNMSM - Facultad de Derecho', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(3)), time: '07:50',
          driverRating: 3.8, seats: 2, price: 11.00, passengers: [], vehicle: 'Toyota Familiar Verso',
          createdAt: now.toISOString()
        },
        // Nuevos viajes para aumentar volumen
        {
          id: 'trip-011', driverId: 'driver-001', driverName: 'Carlos Mendoza', creatorId: 'driver-001',
          origin: 'San Miguel', originAddress: 'Av. La Marina 2000',
          originLat: -12.0768, originLng: -77.0936,
          destination: 'UPC - Campus San Miguel', destinationAddress: 'Av. La Marina 2810',
          date: formatDate(plusDays(1)), time: '08:15',
          driverRating: 4.9, seats: 3, price: 5.00, passengers: [], vehicle: 'Volkswagen Golf Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-012', driverId: 'driver-004', driverName: 'Lucía Ramos', creatorId: 'driver-004',
          origin: 'Lince', originAddress: 'Av. Arequipa 2000',
          originLat: -12.0863, originLng: -77.0351,
          destination: 'UPC - Campus San Isidro', destinationAddress: 'Av. Salaverry 2255',
          date: formatDate(plusDays(2)), time: '09:30',
          driverRating: 5.0, seats: 4, price: 7.50, passengers: [], vehicle: 'Minivan Familiar Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-013', driverId: 'driver-006', driverName: 'Sofía Castro', creatorId: 'driver-006',
          origin: 'Pueblo Libre', originAddress: 'Av. Sucre 500',
          originLat: -12.0762, originLng: -77.0643,
          destination: 'PUCP - Puerta Principal', destinationAddress: 'Av. Universitaria',
          date: formatDate(plusDays(1)), time: '07:40',
          driverRating: 4.2, seats: 2, price: 6.00, passengers: [], vehicle: 'Kia Rio Negro',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-014', driverId: 'driver-008', driverName: 'Valeria Díaz', creatorId: 'driver-008',
          origin: 'Surquillo', originAddress: 'Av. Angamos 1500',
          originLat: -12.1132, originLng: -77.0117,
          destination: 'ULima', destinationAddress: 'Av. Javier Prado Este',
          date: formatDate(plusDays(3)), time: '08:45',
          driverRating: 4.5, seats: 3, price: 9.00, passengers: [], vehicle: 'Volkswagen Golf Blanco',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-015', driverId: 'driver-005', driverName: 'Miguel Rojas', creatorId: 'driver-005',
          origin: 'Ate', originAddress: 'Av. La Molina',
          originLat: -12.0553, originLng: -76.9423,
          destination: 'USIL - Campus 1', destinationAddress: 'Av. La Fontana',
          date: formatDate(plusDays(2)), time: '07:00',
          driverRating: 2.9, seats: 4, price: 4.00, passengers: [], vehicle: 'Ford Explorer SUV Negro',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-016', driverId: 'driver-007', driverName: 'Pedro Silva', creatorId: 'driver-007',
          origin: 'Breña', originAddress: 'Av. Venezuela 800',
          originLat: -12.0564, originLng: -77.0526,
          destination: 'UNMSM', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(1)), time: '07:20',
          driverRating: 3.1, seats: 2, price: 3.00, passengers: [], vehicle: 'Nissan Sentra Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-017', driverId: 'driver-001', driverName: 'Carlos Mendoza', creatorId: 'driver-001',
          origin: 'San Isidro', originAddress: 'Av. Camino Real',
          originLat: -12.0978, originLng: -77.0365,
          destination: 'UPC - Monterrico', destinationAddress: 'Av. Primavera',
          date: formatDate(plusDays(4)), time: '18:00',
          driverRating: 4.9, seats: 3, price: 12.00, passengers: [], vehicle: 'Volkswagen Golf Gris',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-018', driverId: 'driver-003', driverName: 'Juan Pérez', creatorId: 'driver-003',
          origin: 'Miraflores', originAddress: 'Parque Kennedy',
          originLat: -12.1211, originLng: -77.0306,
          destination: 'UTEC', destinationAddress: 'Jr. Medrano Silva',
          date: formatDate(plusDays(2)), time: '08:10',
          driverRating: 3.8, seats: 2, price: 5.50, passengers: [], vehicle: 'Honda Civic Azul',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-019', driverId: 'driver-002', driverName: 'Ana López', creatorId: 'driver-002',
          origin: 'La Victoria', originAddress: 'Av. Canadá',
          originLat: -12.0838, originLng: -77.0135,
          destination: 'UNMSM', destinationAddress: 'Ciudad Universitaria',
          date: formatDate(plusDays(1)), time: '07:55',
          driverRating: 4.7, seats: 4, price: 6.50, passengers: [], vehicle: 'Toyota Corolla Blanco',
          createdAt: now.toISOString()
        },
        {
          id: 'trip-020', driverId: 'driver-004', driverName: 'Lucía Ramos', creatorId: 'driver-004',
          origin: 'San Borja', originAddress: 'Av. Aviación',
          originLat: -12.1079, originLng: -77.0010,
          destination: 'ULima', destinationAddress: 'Av. Javier Prado',
          date: formatDate(plusDays(5)), time: '10:00',
          driverRating: 5.0, seats: 3, price: 8.00, passengers: [], vehicle: 'Minivan Familiar Gris',
          createdAt: now.toISOString()
        }
      ];

      // Always overwrite trips to ensure data quality for demo
      localStorage.setItem('trips', JSON.stringify(baseTrips));

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


