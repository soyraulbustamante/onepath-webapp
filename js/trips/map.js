// Mapa de salidas para la búsqueda de viajes
(function() {
  'use strict';

  function init() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    // Coordenadas aproximadas de puntos de salida usados en los ejemplos
    const departures = [
      {
        id: 'trip-map-1',
        location: 'Metro San Isidro',
        lat: -12.0978,
        lng: -77.0365,
        time: '07:30',
        driver: 'Carlos M.',
        price: 8.00
      },
      {
        id: 'trip-map-2',
        location: 'Jockey Plaza',
        lat: -12.0932,
        lng: -76.9726,
        time: '08:00',
        driver: 'Ana L.',
        price: 10.00
      },
      {
        id: 'trip-map-3',
        location: 'Miraflores Centro',
        lat: -12.1211,
        lng: -77.0306,
        time: '06:45',
        driver: 'Miguel R.',
        price: 9.50
      }
    ];

    // Inicializar mapa centrado en Lima
    const map = L.map('map');
    const bounds = L.latLngBounds([]);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Agregar marcadores de salidas
    departures.forEach(dep => {
      const marker = L.marker([dep.lat, dep.lng]).addTo(map);
      const priceStr = typeof dep.price === 'number' ? dep.price.toFixed(2) : (dep.price || '0');
      const reserveUrl = `../reservations/reserve.html${dep.id ? `?tripId=${encodeURIComponent(dep.id)}` : ''}`;
      const popupHtml = `
        <div class="map-popup" style="min-width:200px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <strong>${dep.location}</strong><br/>
              <div style="color:#6b7280; font-size:12px;">Salida ${dep.time} </div>
              <div style="color:#6b7280; font-size:12px;">Conductor: ${dep.driver}</div>
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
      marker.bindPopup(popupHtml);
      bounds.extend([dep.lat, dep.lng]);
    });

    // Ajustar vista para abarcar todos los marcadores con padding y límite de zoom
    if (departures.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    } else {
      map.setView([-12.06, -77.04], 12);
    }

    // Exponer instancia para otras vistas (tabs)
    window.onepathMap = map;
    window.invalidateOnepathMap = function() {
      if (window.onepathMap) {
        window.onepathMap.invalidateSize();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();