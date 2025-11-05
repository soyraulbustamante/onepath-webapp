(function() {
  'use strict';

  // Silent demo seeding for UI previews. Does NOT show alerts or add buttons.
  function seedIfEmpty() {
    try {
      const hasTrips = !!localStorage.getItem('trips');
      const hasReservations = !!localStorage.getItem('reservations');
      const hasUser = !!localStorage.getItem('currentUser');

      if (hasTrips && hasReservations && hasUser) return; // already have data

      const now = new Date();
      const plusDays = (d) => {
        const n = new Date(now); n.setDate(n.getDate() + d); return n; };
      const minusDays = (d) => {
        const n = new Date(now); n.setDate(n.getDate() - d); return n; };

      // Users for both roles
      const passenger = { id: 'passenger-001', name: 'María Gómez', role: 'passenger', university: 'UNMSM', major: 'Economía' };
      const driver = { id: 'driver-001', name: 'Carlos Mendoza', role: 'driver', university: 'UNMSM', major: 'Ing. Sistemas' };

      if (!hasUser) localStorage.setItem('currentUser', JSON.stringify(passenger));

      if (!hasTrips) {
        const trips = [
          {
            id: 'trip-001', driverId: 'driver-001', creatorId: 'driver-001',
            origin: 'Metro San Isidro', originAddress: 'Av. Javier Prado Este 4200',
            destination: 'Puerta Principal UNMSM', destinationAddress: 'Av. Venezuela s/n, Lima',
            date: plusDays(2).toISOString().split('T')[0], time: '07:30',
            driverName: 'Carlos M.', driverMajor: 'Ing. Sistemas', driverRating: 4.9,
            seats: 4, price: 8.00, passengers: ['passenger-001'], vehicle: 'Volkswagen Golf Gris',
            createdAt: new Date().toISOString()
          },
          {
            id: 'trip-002', driverId: 'driver-001', creatorId: 'driver-001',
            origin: 'Jockey Plaza', originAddress: 'Av. Javier Prado Este 4200',
            destination: 'Facultad de Medicina', destinationAddress: 'Ciudad Universitaria',
            date: plusDays(3).toISOString().split('T')[0], time: '08:00',
            driverName: 'Carlos M.', driverMajor: 'Ing. Sistemas', driverRating: 4.9,
            seats: 3, price: 10.00, passengers: [], vehicle: 'Toyota Corolla Blanco',
            createdAt: new Date().toISOString()
          },
          {
            id: 'trip-003', driverId: 'driver-001', creatorId: 'driver-001',
            origin: 'Miraflores Centro', destination: 'Biblioteca Central',
            date: minusDays(5).toISOString().split('T')[0], time: '06:45',
            seats: 2, price: 6.00, passengers: ['passenger-002', 'passenger-003'], vehicle: 'Honda Civic Azul',
            createdAt: minusDays(6).toISOString()
          }
        ];
        localStorage.setItem('trips', JSON.stringify(trips));
      }

      if (!hasReservations) {
        const reservations = [
          { id: 'res-001', tripId: 'trip-001', passengerId: 'passenger-001', status: 'confirmed', price: 8.00, createdAt: new Date().toISOString() },
          { id: 'res-002', tripId: 'trip-002', passengerId: 'passenger-001', status: 'pending', price: 10.00, createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('reservations', JSON.stringify(reservations));
      }

      // Keep both demo users available for quick switching in dev
      localStorage.setItem('demoPassenger', JSON.stringify(passenger));
      localStorage.setItem('demoDriver', JSON.stringify(driver));
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


