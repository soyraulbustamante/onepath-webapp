// Mapa de salidas para la búsqueda de viajes
(function () {
  'use strict';

  // Mapeo heurístico de ubicaciones de origen a coordenadas (aprox Lima)
  const ORIGIN_COORDS = {
    'metro san isidro': [-12.0978, -77.0365],
    'jockey plaza': [-12.0932, -76.9726],
    'miraflores': [-12.1211, -77.0306],
    'san borja': [-12.1079, -77.0010],
    'la molina': [-12.0891, -76.9397],
    'barranco': [-12.1456, -77.0219],
    'jesús maría': [-12.0725, -77.0435],
    'surco': [-12.1550, -76.9910],
    'chorrillos': [-12.1749, -77.0260],
    'magdalena': [-12.0869, -77.0731]
  };

  function normalize(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function originToLatLng(origin) {
    const key = normalize(origin);
    if (ORIGIN_COORDS[key]) return ORIGIN_COORDS[key];
    return null; // sin aleatoriedad: requerimos coordenadas explícitas o mapeadas
  }

  function getDriverRating(driverId) {
    try {
      const users = (window.Storage && typeof window.Storage.getUsers === 'function')
        ? window.Storage.getUsers()
        : JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === driverId);
      return Number(user?.rating || 0);
    } catch {
      return 0;
    }
  }

  function getDriverName(driverId) {
    try {
      const users = (window.Storage && typeof window.Storage.getUsers === 'function')
        ? window.Storage.getUsers()
        : JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === driverId);
      return user?.name || null;
    } catch {
      return null;
    }
  }

  function getDriverMajor(driverId) {
    try {
      const users = (window.Storage && typeof window.Storage.getUsers === 'function')
        ? window.Storage.getUsers()
        : JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === driverId);
      return user?.major || '';
    } catch {
      return '';
    }
  }

  function getAvatarUrl(seedName) {
    const seed = seedName ? seedName.replace(/\s+/g, '') : 'default';
    return `https://api.dicebear.com/8.x/avataaars/png?seed=${encodeURIComponent(seed)}&size=64`;
  }

  function buildPopup(trip) {
    const priceStr = typeof trip.price === 'number' ? trip.price.toFixed(2) : (trip.price || '0');
    const driverName = getDriverName(trip.driverId) || trip.driverName || 'Conductor';
    const driverMajor = getDriverMajor(trip.driverId);
    const reserveUrl = `../reservations/reserve.html${trip.id ? `?tripId=${encodeURIComponent(trip.id)}` : ''}`;
    const origin = String(trip.origin || '');
    const time = String(trip.time || '');

    const rating = getDriverRating(trip.driverId) || Number(trip.driverRating || 0) || 0;
    const avatarUrl = getAvatarUrl(driverName);

    const capacity = parseInt(trip.seats || 0, 10);
    const taken = Array.isArray(trip.passengers) ? trip.passengers.length : 0;
    const available = Math.max(0, capacity - taken);

    return `
      <div class="map-popup" style="min-width:240px; font-family: 'Inter', sans-serif;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; border-bottom:1px solid #e5e7eb; padding-bottom:12px;">
          <img src="${avatarUrl}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; background:#f3f4f6;" alt="${driverName}">
          <div>
            <div style="font-weight:600; font-size:14px; color:#111827;">${driverName}</div>
            ${driverMajor ? `<div style="font-size:11px; color:#6b7280; margin-bottom:2px;">${driverMajor}</div>` : ''}
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="color:#f59e0b; font-size:12px;">★</span>
              <span style="color:#4b5563; font-size:12px; font-weight:500;">${rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <div style="font-weight:600; font-size:13px; color:#374151; margin-bottom:2px;">${origin}</div>
            <div style="color:#6b7280; font-size:12px;">Salida ${time}</div>
            <div style="color:#6b7280; font-size:12px; margin-top:4px; display:flex; align-items:center; gap:4px;">
              <span style="font-size:14px;">💺</span> ${available} asientos
            </div>
          </div>
          <div style="text-align:right;">
            <div style="color:#2563eb; font-weight:700; font-size:14px;">S/ ${priceStr}</div>
            <div style="color:#9ca3af; font-size:11px;">por persona</div>
          </div>
        </div>

        <div style="margin-top:12px; text-align:right;">
          <a href="${reserveUrl}" class="btn btn-primary btn-small" style="
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 6px 16px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            transition: background-color 0.2s;
          ">Reservar</a>
        </div>
      </div>
    `;
  }

  function init() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    // Inicializar mapa centrado en Lima
    const map = L.map('map');
    window.onepathMap = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Capa para marcadores de viajes
    const markersLayer = L.layerGroup().addTo(map);
    window.tripMarkersLayer = markersLayer;

    window.invalidateOnepathMap = function () {
      if (window.onepathMap) {
        window.onepathMap.invalidateSize();
      }
    };

    // API para actualizar marcadores desde resultados de búsqueda
    window.updateTripsOnMap = function (trips) {
      if (!Array.isArray(trips)) return;
      markersLayer.clearLayers();
      const bounds = L.latLngBounds([]);

      trips.forEach(trip => {
        let lat = Number(trip.originLat);
        let lng = Number(trip.originLng);
        let coords = null;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          coords = [lat, lng];
        } else {
          const mapped = originToLatLng(trip.origin);
          if (mapped) coords = mapped;
        }
        if (!coords) return; // omitir viajes sin coordenadas
        const marker = L.marker(coords);
        marker.bindPopup(buildPopup(trip));
        markersLayer.addLayer(marker);
        bounds.extend(coords);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      } else {
        map.setView([-12.06, -77.04], 12);
      }
    };

    // Escuchar eventos de actualización de resultados
    window.addEventListener('tripsResultsUpdated', (e) => {
      const trips = e?.detail?.trips || [];
      window.updateTripsOnMap(trips);
    });

    // Inicial con todos los viajes guardados si no hay evento aún
    try {
      const raw = localStorage.getItem('trips');
      const allTrips = raw ? JSON.parse(raw) : [];
      window.updateTripsOnMap(allTrips);
    } catch (err) {
      map.setView([-12.06, -77.04], 12);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();