// Home behavior: if user is logged in, show private dashboard
(function() {
  'use strict';

  /**
   * Obtiene el usuario actual directamente de localStorage
   */
  function getCurrentUser() {
    try {
      var raw = localStorage.getItem('currentUser');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error getting user:', e);
    }
    return null;
  }

  /**
   * Verifica si hay sesión activa
   */
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  /**
   * Transforma el home público en dashboard privado
   */
  function transformToPrivateHome() {
    var user = getCurrentUser();
    if (!user) return;

    console.log('Transformando a dashboard privado para:', user.name);

    var firstName = user.name ? user.name.split(' ')[0] : 'Usuario';
    var university = user.university || 'tu universidad';
    var major = user.major || 'tu carrera';
    
    // Ocultar todas las secciones públicas
    var publicSections = [
      '.stats',
      '.why-onepath',
      '.how-it-works',
      '.universities',
      '.security',
      '.testimonials',
      '.cta'
    ];
    
    publicSections.forEach(function(selector) {
      var el = document.querySelector(selector);
      if (el) {
        el.style.display = 'none';
      }
    });

    // Transformar Hero Section
    var hero = document.querySelector('.hero');
    if (hero) {
      hero.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      hero.style.color = '#ffffff';
      hero.style.padding = '60px 0';
      
      var heroText = hero.querySelector('.hero-text');
      if (heroText) {
        var h1 = heroText.querySelector('h1');
        if (h1) {
          // Detectar género por nombre para el saludo
          var femaleNames = ['maría', 'ana', 'sofia', 'carla', 'lucia', 'elena', 'patricia', 'diana'];
          var isFemale = femaleNames.some(function(name) {
            return firstName.toLowerCase().includes(name);
          });
          var greeting = isFemale ? '¡Bienvenida, ' : '¡Bienvenido, ';
          h1.textContent = greeting + firstName + '!';
          h1.style.color = '#ffffff';
        }
        
        var p = heroText.querySelector('p');
        if (p) {
          var isDriver = user && user.role === 'driver';
          p.textContent = isDriver
            ? 'Gestiona y publica tus viajes universitarios'
            : 'Encuentra tu próximo viaje hacia la universidad';
          p.style.color = '#ffffff';
        }

        // Agregar info de universidad y carrera
        var universityInfo = document.createElement('div');
        universityInfo.style.marginTop = '16px';
        universityInfo.style.display = 'flex';
        universityInfo.style.gap = '16px';
        universityInfo.style.flexWrap = 'wrap';
        universityInfo.innerHTML = 
          '<div style="display:flex; align-items:center; gap:8px">' +
          '  <span class="material-icons" style="font-size: 20px;">school</span>' +
          '  <span>' + university + '</span>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:8px">' +
          '  <span class="material-icons" style="font-size: 20px;">menu_book</span>' +
          '  <span>' + major + '</span>' +
          '</div>';
        
        heroText.appendChild(universityInfo);

        // Reemplazar botones
        var buttons = heroText.querySelector('.hero-buttons');
        if (buttons) {
          buttons.innerHTML = '';
        }
      }

      // Ocultar imagen del hero
      var heroImage = hero.querySelector('.hero-image');
      if (heroImage) {
        heroImage.style.display = 'none';
      }
    }

    // Crear sección de Acciones Rápidas
    createQuickActionsSection();

    // Crear sección de búsqueda de viaje
    createTripSearchSection(university);

    // Crear sección de viajes disponibles
    createAvailableTripsSection();

    // Crear sección de próximas reservas
    createUpcomingReservationsSection();

    // Crear sección de actividad del usuario
    createUserActivitySection(user);

    // Crear sección de actividad reciente
    createRecentActivitySection();

    // Crear sección de consejos de seguridad
    createSecurityTipsSection();
  }

  /**
   * Crea la sección de Acciones Rápidas
   */
  function createQuickActionsSection() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    // Detectar rol del usuario
    var userRaw = localStorage.getItem('currentUser');
    var user = null;
    try { user = userRaw ? JSON.parse(userRaw) : null; } catch (e) { user = null; }
    var role = user && user.role ? user.role : 'passenger';

    var quickActions = document.createElement('section');
    quickActions.className = 'quick-actions';
    quickActions.style.padding = '48px 0';
    quickActions.style.backgroundColor = '#ffffff';

    var passengerCards = 
      '    <a class="feature-card" href="pages/trips/search.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">search</span></div>' +
      '      <h3 style="margin-bottom: 8px">Buscar Viaje</h3>' +
      '      <p>Encuentra viajes disponibles hacia tu universidad</p>' +
      '    </a>' +
      '    <a class="feature-card" href="pages/reservations/my-reservations.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">calendar_today</span></div>' +
      '      <h3 style="margin-bottom: 8px">Mis Reservas</h3>' +
      '      <p>Gestiona tus viajes programados</p>' +
      '    </a>' +
      '    <a class="feature-card" href="pages/trips/my-trips.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">schedule</span></div>' +
      '      <h3 style="margin-bottom: 8px">Historial</h3>' +
      '      <p>Revisa tus viajes anteriores</p>' +
      '    </a>' +
      '    <a class="feature-card" href="pages/user/rate.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">star</span></div>' +
      '      <h3 style="margin-bottom: 8px">Calificaciones</h3>' +
      '      <p>Ve y deja reseñas de conductores</p>' +
      '    </a>';

    var driverCards =
      '    <a class="feature-card" href="pages/trips/publish.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">edit</span></div>' +
      '      <h3 style="margin-bottom: 8px">Publicar Viaje</h3>' +
      '      <p>Crea un viaje para que estudiantes se unan</p>' +
      '    </a>' +
      '    <a class="feature-card" href="pages/trips/my-trips.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">explore</span></div>' +
      '      <h3 style="margin-bottom: 8px">Mis Viajes</h3>' +
      '      <p>Gestiona tus viajes publicados</p>' +
      '    </a>' +
      '    <a class="feature-card" href="pages/trips/search.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">map</span></div>' +
      '      <h3 style="margin-bottom: 8px">Explorar Solicitudes</h3>' +
      '      <p>Busca rutas y posibles pasajeros</p>' +
      '    </a>' +
      '    <a class="feature-card" href="pages/user/rate.html" style="text-decoration: none; display: block;">' +
      '      <div class="feature-icon" style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">star</span></div>' +
      '      <h3 style="margin-bottom: 8px">Calificaciones</h3>' +
      '      <p>Revisa y mejora tu reputación</p>' +
      '    </a>';

    quickActions.innerHTML = 
      '<div class="container">' +
      '  <h2 style="margin-bottom: 24px; font-size: 28px; color: #1f2937">Acciones Rápidas</h2>' +
      '  <div class="features-grid">' +
      (role === 'driver' ? driverCards : passengerCards) +
      '  </div>' +
      '</div>';

    hero.parentNode.insertBefore(quickActions, hero.nextSibling);
  }

  /**
   * Crea la sección de búsqueda de viaje
   */
  function createTripSearchSection(university) {
    var quickActions = document.querySelector('.quick-actions');
    if (!quickActions) return;

    var searchSection = document.createElement('section');
    searchSection.className = 'dashboard-search';
    searchSection.style.padding = '48px 0';
    searchSection.style.backgroundColor = '#f9fafb';
    
    // Detectar rol del usuario
    var userRaw = localStorage.getItem('currentUser');
    var user = null;
    try { user = userRaw ? JSON.parse(userRaw) : null; } catch (e) { user = null; }
    var role = user && user.role ? user.role : 'passenger';
    
    if (role === 'driver') {
      // Versión conductor: planificador rápido para publicar
      searchSection.innerHTML = 
        '<div class="container">' +
        '  <h2 style="text-align: center; margin-bottom: 8px; font-size: 28px; color: #1f2937">Planificar Próximo Viaje</h2>' +
        '  <p style="text-align: center; color: #6b7280; margin-bottom: 24px">Define origen, destino y horario para publicarlo</p>' +
        '  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; max-width: 1000px; margin: 0 auto">' +
        '    <div style="position: relative; flex: 1; min-width: 220px">' +
        '      <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 20px;">school</span>' +
        '      <input type="text" aria-label="Origen" placeholder="' + university + '" value="' + university + '" style="width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 16px" readonly>' +
        '    </div>' +
        '    <div style="position: relative; flex: 1; min-width: 220px">' +
        '      <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 20px;">location_on</span>' +
        '      <input type="text" aria-label="Destino" placeholder="Distrito o zona de destino" style="width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 16px">' +
        '    </div>' +
        '    <div style="position: relative; flex: 0 0 160px">' +
        '      <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 20px;">access_time</span>' +
        '      <input type="text" aria-label="Hora" placeholder="07:30" style="width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 16px">' +
        '    </div>' +
        '    <a class="btn-primary" href="pages/trips/publish.html" style="padding: 12px 24px; border-radius: 10px; text-decoration: none; white-space: nowrap; display: flex; align-items: center; gap: 8px">' +
        '      <span class="material-icons">edit</span> Publicar viaje' +
        '    </a>' +
        '  </div>' +
        '</div>';
    } else {
      // Versión pasajero
      searchSection.innerHTML = 
        '<div class="container">' +
        '  <h2 style="text-align: center; margin-bottom: 8px; font-size: 28px; color: #1f2937">Buscar tu Próximo Viaje</h2>' +
        '  <p style="text-align: center; color: #6b7280; margin-bottom: 24px">Encuentra el viaje perfecto que se adapte a tu horario</p>' +
        '  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; max-width: 900px; margin: 0 auto">' +
        '    <div style="position: relative; flex: 1; min-width: 200px">' +
        '      <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 20px;">location_on</span>' +
        '      <input type="text" aria-label="Desde" placeholder="Tu ubicación actual" style="width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 16px">' +
        '    </div>' +
      '    <div style="position: relative; flex: 1; min-width: 200px">' +
        '      <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 20px;">school</span>' +
        '      <input type="text" aria-label="Hacia" placeholder="Universidad de Lima" value="' + university + '" style="width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 16px" readonly>' +
        '    </div>' +
        '    <div style="position: relative; flex: 0 0 160px">' +
        '      <span class="material-icons" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 20px;">calendar_today</span>' +
        '      <input type="text" aria-label="Fecha" placeholder="mm/dd/yyyy" style="width: 100%; padding: 12px 14px 12px 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 16px">' +
        '    </div>' +
        '    <a class="btn-primary" href="pages/trips/search.html" style="padding: 12px 24px; border-radius: 10px; text-decoration: none; white-space: nowrap; display: flex; align-items: center; gap: 8px">' +
        '      <span class="material-icons">search</span> Buscar Viajes' +
        '    </a>' +
        '  </div>' +
        '</div>';
    }

    quickActions.parentNode.insertBefore(searchSection, quickActions.nextSibling);
  }

  /**
   * Crea la sección de viajes disponibles
   */
  function createAvailableTripsSection() {
    var searchSection = document.querySelector('.dashboard-search');
    if (!searchSection) return;

    var tripsSection = document.createElement('section');
    tripsSection.className = 'available-trips';
    tripsSection.style.padding = '48px 0';
    tripsSection.style.backgroundColor = '#ffffff';
    // Detectar rol del usuario
    var userRaw = localStorage.getItem('currentUser');
    var user = null;
    try { user = userRaw ? JSON.parse(userRaw) : null; } catch (e) { user = null; }
    var role = user && user.role ? user.role : 'passenger';

    if (role === 'driver') {
      // Versión conductor: solicitudes recientes / posibles pasajeros
      tripsSection.innerHTML = 
        '<div class="container">' +
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">' +
        '    <h2 style="font-size: 28px; color: #1f2937">Solicitudes Recientes</h2>' +
        '    <a href="pages/trips/my-trips.html" style="color: #3b82f6; text-decoration: none; font-weight: 500">Gestionar viajes</a>' +
        '  </div>' +
        '  <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px">' +
        '    <div class="feature-card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px">' +
        '      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">' +
        '        <div style="width: 48px; height: 48px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: bold">AG</div>' +
        '        <div style="flex: 1">' +
        '          <div style="font-weight: 600; color: #1f2937">Ana García</div>' +
          '          <div style="font-size: 14px; color: #6b7280"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">star</span> 5.0 (18 viajes)</div>' +
        '        </div>' +
        '        <div style="font-size: 12px; font-weight: 600; color: #10b981; background: #ecfdf5; padding: 4px 8px; border-radius: 999px">Nueva</div>' +
        '      </div>' +
        '      <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">location_on</span> San Miguel → Universidad de Lima</div>' +
        '        <div style="font-weight: 600; margin-bottom: 4px">7:30 AM</div>' +
        '        <div style="font-size: 14px; color: #6b7280">Asientos solicitados: 1</div>' +
        '      </div>' +
        '      <div style="display: flex; gap: 8px">' +
        '        <a href="pages/chat/messages.html" class="btn-secondary" style="flex: 1; text-align: center; text-decoration: none; padding: 10px; border-radius: 8px"><span class="material-icons" style="font-size: 18px; vertical-align: middle;">chat</span> Contactar</a>' +
        '        <a href="pages/trips/my-trips.html" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 10px; border-radius: 8px">Aceptar</a>' +
        '      </div>' +
        '    </div>' +
        '    <div class="feature-card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px">' +
        '      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">' +
        '        <div style="width: 48px; height: 48px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: bold">JM</div>' +
        '        <div style="flex: 1">' +
        '          <div style="font-weight: 600; color: #1f2937">José Mejía</div>' +
          '          <div style="font-size: 14px; color: #6b7280"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">star</span> 4.7 (12 viajes)</div>' +
        '        </div>' +
        '        <div style="font-size: 12px; font-weight: 600; color: #f59e0b; background: #fffbeb; padding: 4px 8px; border-radius: 999px">Pendiente</div>' +
        '      </div>' +
        '      <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">location_on</span> Pueblo Libre → Universidad de Lima</div>' +
        '        <div style="font-weight: 600; margin-bottom: 4px">7:45 AM</div>' +
        '        <div style="font-size: 14px; color: #6b7280">Asientos solicitados: 2</div>' +
        '      </div>' +
        '      <div style="display: flex; gap: 8px">' +
        '        <a href="pages/trips/my-trips.html" class="btn-secondary" style="flex: 1; text-align: center; text-decoration: none; padding: 10px; border-radius: 8px">Revisar</a>' +
        '        <a href="pages/trips/my-trips.html" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 10px; border-radius: 8px">Gestionar</a>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    } else {
      // Versión pasajero (original)
      tripsSection.innerHTML = 
        '<div class="container">' +
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">' +
        '    <h2 style="font-size: 28px; color: #1f2937">Viajes Disponibles Hoy</h2>' +
        '    <a href="pages/trips/search.html" style="color: #3b82f6; text-decoration: none; font-weight: 500">Ver todos</a>' +
        '  </div>' +
        '  <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px">' +
        '    <div class="feature-card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px">' +
        '      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">' +
        '        <div style="width: 48px; height: 48px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: bold">CM</div>' +
        '        <div style="flex: 1">' +
        '          <div style="font-weight: 600; color: #1f2937">Carlos Mendoza</div>' +
          '          <div style="font-size: 14px; color: #6b7280"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">star</span> 4.8 (23 viajes)</div>' +
        '        </div>' +
        '        <div style="font-size: 20px; font-weight: 700; color: #3b82f6">S/8</div>' +
        '      </div>' +
        '      <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">location_on</span> San Miguel - Av. Brasil</div>' +
        '        <div style="font-weight: 600; margin-bottom: 4px">7:30 AM</div>' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">school</span> Universidad de Lima</div>' +
        '        <div style="font-weight: 600">8:15 AM</div>' +
        '      </div>' +
        '      <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">people</span> 2/4 asientos · <span class="material-icons" style="font-size: 14px; vertical-align: middle;">directions_car</span> Toyota Corolla</div>' +
        '      <a href="pages/reservations/reserve.html" class="btn-primary" style="width: 100%; text-align: center; display: block; padding: 10px; text-decoration: none; border-radius: 8px">Reservar</a>' +
        '    </div>' +
        '    <div class="feature-card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px">' +
        '      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px">' +
        '        <div style="width: 48px; height: 48px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: bold">AR</div>' +
        '        <div style="flex: 1">' +
        '          <div style="font-weight: 600; color: #1f2937">Ana Rodríguez</div>' +
          '          <div style="font-size: 14px; color: #6b7280"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">star</span> 4.9 (41 viajes)</div>' +
        '        </div>' +
        '        <div style="font-size: 20px; font-weight: 700; color: #3b82f6">S/10</div>' +
        '      </div>' +
        '      <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">location_on</span> Miraflores - Av. Pardo</div>' +
        '        <div style="font-weight: 600; margin-bottom: 4px">7:45 AM</div>' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">school</span> Universidad de Lima</div>' +
        '        <div style="font-weight: 600">8:30 AM</div>' +
        '      </div>' +
        '      <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px"><span class="material-icons" style="font-size: 14px; vertical-align: middle;">people</span> 1/3 asientos · <span class="material-icons" style="font-size: 14px; vertical-align: middle;">directions_car</span> Honda Civic</div>' +
        '      <a href="pages/reservations/reserve.html" class="btn-primary" style="width: 100%; text-align: center; display: block; padding: 10px; text-decoration: none; border-radius: 8px">Reservar</a>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }

    searchSection.parentNode.insertBefore(tripsSection, searchSection.nextSibling);
  }

  /**
   * Crea la sección de próximas reservas
   */
  function createUpcomingReservationsSection() {
    var tripsSection = document.querySelector('.available-trips');
    if (!tripsSection) return;

    var reservationsSection = document.createElement('section');
    reservationsSection.className = 'upcoming-reservations';
    reservationsSection.style.padding = '48px 0';
    reservationsSection.style.backgroundColor = '#f9fafb';
    
    // Detectar rol del usuario
    var userRaw = localStorage.getItem('currentUser');
    var user = null;
    try { user = userRaw ? JSON.parse(userRaw) : null; } catch (e) { user = null; }
    var role = user && user.role ? user.role : 'passenger';

    if (role === 'driver') {
      // Versión conductor: próximos viajes publicados
      reservationsSection.innerHTML = 
        '<div class="container">' +
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">' +
        '    <h2 style="font-size: 28px; color: #1f2937">Próximos Viajes Publicados</h2>' +
        '    <a href="pages/trips/my-trips.html" style="color: #3b82f6; text-decoration: none; font-weight: 500">Ver todos</a>' +
        '  </div>' +
        '  <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff">' +
        '    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">' +
        '      <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981"></div>' +
        '      <span style="color: #10b981; font-weight: 600">Programado</span>' +
        '      <span style="margin-left: auto; font-weight: 600; color: #1f2937">Mañana - 7:30 AM</span>' +
        '    </div>' +
        '    <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap">' +
        '      <div style="flex: 1; min-width: 200px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px">Pasajeros</div>' +
        '        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">' +
        '          <div title="Ana" style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px">AG</div>' +
        '          <div title="José" style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px">JM</div>' +
        '          <div style="font-size: 12px; color: #6b7280">2/4 asientos</div>' +
        '        </div>' +
        '      </div>' +
        '      <div style="flex: 1; min-width: 200px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px">Ruta</div>' +
        '        <div style="font-weight: 600; color: #1f2937">Universidad de Lima → San Miguel</div>' +
        '        <div style="font-size: 12px; color: #6b7280">45 minutos aprox.</div>' +
        '      </div>' +
        '      <div style="flex: 0 0 auto">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px">Tarifa</div>' +
        '        <div style="font-size: 20px; font-weight: 700; color: #3b82f6">S/8</div>' +
        '      </div>' +
        '    </div>' +
        '    <div style="display: flex; gap: 12px; flex-wrap: wrap">' +
        '      <a href="pages/chat/messages.html" class="btn-secondary" style="padding: 8px 16px; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px"><span class="material-icons">chat</span> Escribir</a>' +
        '      <a href="pages/trips/search-map.html" class="btn-secondary" style="padding: 8px 16px; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px"><span class="material-icons">map</span> Ver ruta</a>' +
        '      <a href="pages/trips/my-trips.html" class="btn-primary" style="padding: 8px 16px; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px"><span class="material-icons">settings</span> Gestionar</a>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    } else {
      // Versión pasajero (original)
      reservationsSection.innerHTML = 
        '<div class="container">' +
        '  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px">' +
        '    <h2 style="font-size: 28px; color: #1f2937">Mis Próximas Reservas</h2>' +
        '    <a href="pages/reservations/my-reservations.html" style="color: #3b82f6; text-decoration: none; font-weight: 500">Ver historial completo</a>' +
        '  </div>' +
        '  <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff">' +
        '    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px">' +
        '      <div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6"></div>' +
        '      <span style="color: #3b82f6; font-weight: 600">Confirmado</span>' +
        '      <span style="margin-left: auto; font-weight: 600; color: #1f2937">Mañana - 7:30 AM</span>' +
        '    </div>' +
        '    <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap">' +
        '      <div style="flex: 1; min-width: 200px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px">Conductor</div>' +
        '        <div style="display: flex; align-items: center; gap: 12px">' +
        '          <div style="width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px">CM</div>' +
        '          <div>' +
        '            <div style="font-weight: 600; color: #1f2937">Carlos Mendoza</div>' +
        '            <div style="font-size: 12px; color: #6b7280">Toyota Corolla Blanco</div>' +
        '          </div>' +
        '        </div>' +
        '      </div>' +
        '      <div style="flex: 1; min-width: 200px">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px">Ruta</div>' +
        '        <div style="font-weight: 600; color: #1f2937">San Miguel → Universidad de Lima</div>' +
        '        <div style="font-size: 12px; color: #6b7280">45 minutos aprox.</div>' +
        '      </div>' +
        '      <div style="flex: 0 0 auto">' +
        '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px">Precio</div>' +
        '        <div style="font-size: 20px; font-weight: 700; color: #3b82f6">S/8</div>' +
        '      </div>' +
        '    </div>' +
        '    <div style="display: flex; gap: 12px; flex-wrap: wrap">' +
      '      <a href="pages/chat/messages.html" class="btn-secondary" style="padding: 8px 16px; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px"><span class="material-icons">chat</span> Contactar</a>' +
      '      <a href="pages/trips/search-map.html" class="btn-secondary" style="padding: 8px 16px; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px"><span class="material-icons">map</span> Ver ruta</a>' +
        '      <button style="padding: 8px 16px; border: 1px solid #ef4444; color: #ef4444; background: transparent; border-radius: 8px; cursor: pointer">Cancelar reserva</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    }

    tripsSection.parentNode.insertBefore(reservationsSection, tripsSection.nextSibling);
  }

  /**
   * Crea la sección de actividad del usuario
   */
  function createUserActivitySection(user) {
    var reservationsSection = document.querySelector('.upcoming-reservations');
    if (!reservationsSection) return;

    var activitySection = document.createElement('section');
    activitySection.className = 'user-activity';
    activitySection.style.padding = '48px 0';
    activitySection.style.backgroundColor = '#ffffff';
    
    activitySection.innerHTML = 
      '<div class="container">' +
      '  <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 24px">Tu Actividad</h2>' +
      '  <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px">' +
      '    <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center">' +
      '      <div style="font-size: 48px; margin-bottom: 12px"><span class="material-icons" style="font-size: 48px;">directions_car</span></div>' +
      '      <div style="font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 4px">24</div>' +
      '      <div style="font-size: 14px; color: #6b7280">Viajes realizados</div>' +
      '    </div>' +
      '    <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center">' +
      '      <div style="font-size: 48px; margin-bottom: 12px"><span class="material-icons" style="font-size: 48px;">payments</span></div>' +
      '      <div style="font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 4px">S/ 192</div>' +
      '      <div style="font-size: 14px; color: #6b7280">Ahorrado en transporte</div>' +
      '    </div>' +
      '    <a href="pages/user/rate.html" class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center; text-decoration: none; display: block; transition: all 0.2s ease">' +
      '      <div style="font-size: 48px; margin-bottom: 12px"><span class="material-icons" style="font-size: 48px;">star</span></div>' +
      '      <div style="font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 4px">' + (user.rating || '4.9') + '</div>' +
      '      <div style="font-size: 14px; color: #6b7280">Calificación promedio</div>' +
      '    </a>' +
      '    <a href="pages/user/rate-trip.html" class="feature-card" style="padding: 24px; border: 1px solid #3b82f6; border-radius: 12px; text-align: center; text-decoration: none; display: block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; transition: all 0.2s ease">' +
      '      <div style="font-size: 48px; margin-bottom: 12px"><span class="material-icons" style="font-size: 48px;">edit</span></div>' +
      '      <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px">Calificar</div>' +
      '      <div style="font-size: 14px; opacity: 0.9">Califica tu último viaje</div>' +
      '    </a>' +
      '    <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center">' +
      '      <div style="font-size: 48px; margin-bottom: 12px"><span class="material-icons" style="font-size: 48px;">eco</span></div>' +
      '      <div style="font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 4px">48kg</div>' +
      '      <div style="font-size: 14px; color: #6b7280">CO₂ reducido</div>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    reservationsSection.parentNode.insertBefore(activitySection, reservationsSection.nextSibling);
  }

  /**
   * Crea la sección de actividad reciente
   */
  function createRecentActivitySection() {
    var activitySection = document.querySelector('.user-activity');
    if (!activitySection) return;

    var recentSection = document.createElement('section');
    recentSection.className = 'recent-activity';
    recentSection.style.padding = '48px 0';
    recentSection.style.backgroundColor = '#f9fafb';
    
    recentSection.innerHTML = 
      '<div class="container">' +
      '  <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 24px">Actividad Reciente</h2>' +
      '  <div style="display: flex; flex-direction: column; gap: 16px">' +
      '    <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px">' +
      '      <div style="width: 40px; height: 40px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px"><span class="material-icons" style="font-size: 20px;">check</span></div>' +
      '      <div style="flex: 1">' +
      '        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px">Viaje completado</div>' +
      '        <div style="font-size: 14px; color: #6b7280">Con Ana Rodríguez - Universidad de Lima</div>' +
      '      </div>' +
      '      <div style="text-align: right">' +
      '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px">Hace 2 días</div>' +
      '        <div style="font-weight: 600; color: #3b82f6">S/10</div>' +
      '      </div>' +
      '    </div>' +
      '    <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px">' +
      '      <div style="width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px"><span class="material-icons" style="font-size: 20px;">calendar_today</span></div>' +
      '      <div style="flex: 1">' +
      '        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px">Nueva reserva confirmada</div>' +
      '        <div style="font-size: 14px; color: #6b7280">Con Carlos Mendoza - Mañana 7:30 AM</div>' +
      '      </div>' +
      '      <div style="text-align: right">' +
      '        <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px">Hace 3 horas</div>' +
      '        <div style="font-weight: 600; color: #3b82f6">S/8</div>' +
      '      </div>' +
      '    </div>' +
      '    <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px">' +
      '      <div style="width: 40px; height: 40px; border-radius: 50%; background: #f59e0b; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 20px"><span class="material-icons" style="font-size: 20px;">star</span></div>' +
      '      <div style="flex: 1">' +
      '        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px">Calificación recibida</div>' +
      '        <div style="font-size: 14px; color: #6b7280">Ana te calificó con 5 estrellas</div>' +
      '      </div>' +
      '      <div style="text-align: right">' +
      '        <div style="font-size: 14px; color: #6b7280">Hace 2 días</div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    activitySection.parentNode.insertBefore(recentSection, activitySection.nextSibling);
  }

  /**
   * Crea la sección de consejos de seguridad
   */
  function createSecurityTipsSection() {
    var recentSection = document.querySelector('.recent-activity');
    if (!recentSection) return;

    var securitySection = document.createElement('section');
    securitySection.className = 'security-tips';
    securitySection.style.padding = '48px 0';
    securitySection.style.backgroundColor = '#ffffff';
    
    securitySection.innerHTML = 
      '<div class="container">' +
      '  <h2 style="font-size: 28px; color: #1f2937; margin-bottom: 24px">Consejos de Seguridad</h2>' +
      '  <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px">' +
      '    <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px">' +
      '      <div style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">security</span></div>' +
      '      <h3 style="margin-bottom: 8px; color: #1f2937">Verifica la Identidad</h3>' +
      '      <p style="color: #6b7280; line-height: 1.6">Siempre confirma que el conductor y el vehículo coincidan con la información del perfil antes de subir.</p>' +
      '    </div>' +
      '    <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px">' +
      '      <div style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">share</span></div>' +
      '      <h3 style="margin-bottom: 8px; color: #1f2937">Comparte tu Viaje</h3>' +
      '      <p style="color: #6b7280; line-height: 1.6">Informa a un familiar o amigo sobre los detalles de tu viaje, incluyendo conductor y horario.</p>' +
      '    </div>' +
      '    <div class="feature-card" style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px">' +
      '      <div style="font-size: 48px; margin-bottom: 16px"><span class="material-icons" style="font-size: 48px;">chat</span></div>' +
      '      <h3 style="margin-bottom: 8px; color: #1f2937">Mantén Comunicación</h3>' +
      '      <p style="color: #6b7280; line-height: 1.6">Usa el chat de la app para comunicarte con el conductor y reporta cualquier inconveniente.</p>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    recentSection.parentNode.insertBefore(securitySection, recentSection.nextSibling);
  }

  /**
   * Inicializa el comportamiento del home
   */
  function init() {
    if (isLoggedIn()) {
      console.log('Usuario logueado, mostrando dashboard privado');
      transformToPrivateHome();
    } else {
      console.log('No hay sesión activa, mostrando landing público');
    }
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
