// Mapa de salidas para la búsqueda de viajes
(function() {
  'use strict';

  function init() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    // Coordenadas aproximadas de puntos de salida usados en los ejemplos
    const departures = [
      {
        location: 'Metro San Isidro',
        lat: -12.0978,
        lng: -77.0365,
        time: '07:30',
        driver: 'Carlos M.'
      },
      {
        location: 'Jockey Plaza',
        lat: -12.0932,
        lng: -76.9726,
        time: '08:00',
        driver: 'Ana L.'
      },
      {
        location: 'Miraflores Centro',
        lat: -12.1211,
        lng: -77.0306,
        time: '06:45',
        driver: 'Miguel R.'
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
      marker.bindPopup(
        `<strong>${dep.location}</strong><br/>Salida ${dep.time}<br/>Conductor: ${dep.driver}`
      );
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