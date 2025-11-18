// Mapa de salidas para la búsqueda de viajes
(function() {
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

  function buildPopup(trip) {
    const priceStr = typeof trip.price === 'number' ? trip.price.toFixed(2) : (trip.price || '0');
    const driverName = trip.driverName || 'Conductor';
    const reserveUrl = `../reservations/reserve.html${trip.id ? `?tripId=${encodeURIComponent(trip.id)}` : ''}`;
    const origin = String(trip.origin || '');
    const time = String(trip.time || '');
    return `
      <div class="map-popup" style="min-width:220px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div>
            <strong>${origin}</strong><br/>
            <div style="color:#6b7280; font-size:12px;">Salida ${time}</div>
            <div style="color:#6b7280; font-size:12px;">Conductor: ${driverName}</div>
          </div>
          <div style="text-align:right;">
            <div style="color:#3498db; font-weight:700;">S/${priceStr}</div>
            <div style="color:#6b7280; font-size:11px;">por persona</div>
          </div>
        </div>
        <div style="margin-top:10px; text-align:right;">
          <a href="${reserveUrl}" class="btn btn-primary btn-small" style="text-decoration:none;">Reservar</a>
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

    window.invalidateOnepathMap = function() {
      if (window.onepathMap) {
        window.onepathMap.invalidateSize();
      }
    };

    // API para actualizar marcadores desde resultados de búsqueda
    window.updateTripsOnMap = function(trips) {
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