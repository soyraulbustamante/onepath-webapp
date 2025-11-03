# OnePath WebApp

Aplicación web para OnePath, una plataforma de viajes compartidos entre estudiantes universitarios. El proyecto está construido con **HTML5**, **CSS3** y **JavaScript Vanilla (ES6+)**, siguiendo una arquitectura modular sin frameworks externos.

## 🎯 Descripción

OnePath conecta estudiantes universitarios para compartir viajes hacia sus universidades, permitiendo ahorrar dinero, reducir la huella de carbono y crear nuevas conexiones. La plataforma incluye funcionalidades completas de gestión de viajes, reservas, sistema de mensajería, gamificación y un sistema de calificaciones y reputación.

## ✨ Características Principales

### 🚗 Gestión de Viajes
- **Búsqueda de viajes**: Busca viajes disponibles con filtros avanzados (fecha, origen, destino, precio)
- **Publicación de viajes**: Publica tus propios viajes como conductor
- **Edición y eliminación**: Gestiona tus viajes publicados
- **Búsqueda con mapa**: Visualiza viajes disponibles en un mapa interactivo
- **Historial de viajes**: Revisa tus viajes anteriores

### 📅 Sistema de Reservas
- **Crear reservas**: Reserva asientos en viajes disponibles
- **Mis reservas**: Gestiona todas tus reservas activas y pasadas
- **Cancelación**: Cancela reservas según las políticas de la plataforma

### 💬 Mensajería
- **Chat en tiempo real**: Comunicación directa entre pasajeros y conductores
- **Historial de conversaciones**: Acceso a conversaciones previas

### ⭐ Calificaciones y Reputación
- **Sistema de calificaciones**: Califica y sé calificado después de cada viaje
- **Reputación**: Sistema de reputación basado en calificaciones recibidas
- **Calificación de viajes**: Califica experiencias específicas de viaje

### 🏆 Gamificación
- **Sistema de insignias**: Obtén insignias por logros y actividades
- **Progreso visual**: Visualiza tus logros y progreso

### 🔔 Notificaciones
- **Notificaciones en tiempo real**: Recibe alertas sobre reservas, mensajes y actualizaciones
- **Centro de notificaciones**: Gestiona todas tus notificaciones en un solo lugar

### 👤 Perfil de Usuario
- **Gestión de perfil**: Actualiza tu información personal y universitaria
- **Historial completo**: Revisa tu actividad en la plataforma

### 🔐 Autenticación y Seguridad
- **Registro e inicio de sesión**: Sistema completo de autenticación
- **Recuperación de contraseña**: Recupera tu cuenta de forma segura
- **Gestión de sesiones**: Control de sesiones de usuario

## 🚀 Stack Tecnológico

- **HTML5** semántico
- **CSS3** puro (sin frameworks CSS)
- **JavaScript Vanilla** (ES6+)
- Sin dependencias externas ni frameworks

## 📁 Estructura de Carpetas

```
onepath-webapp/
│
├── assets/                    # Recursos estáticos
│   ├── data/                  # Datos mock y JSON
│   │   └── mock-data.json     # Datos de prueba para desarrollo
│   ├── fonts/                 # Fuentes tipográficas
│   └── images/                # Imágenes del proyecto
│       ├── avatars/           # Avatares de usuarios
│       ├── badges/            # Insignias de gamificación
│       ├── icons/             # Iconos de la aplicación
│       └── universities/      # Logos de universidades
│
├── css/                       # Estilos CSS organizados por tipo
│   ├── components/            # Estilos de componentes reutilizables
│   │   ├── buttons.css        # Estilos para botones
│   │   ├── cards.css          # Estilos para tarjetas
│   │   ├── filters.css        # Estilos para filtros
│   │   ├── footer.css         # Estilos del footer
│   │   ├── forms.css          # Estilos para formularios
│   │   ├── modals.css         # Estilos para modales
│   │   ├── navbar.css         # Estilos de navegación
│   │   ├── notifications.css  # Estilos para notificaciones
│   │   └── rating.css         # Estilos para sistema de calificaciones
│   │
│   ├── pages/                 # Estilos específicos por página
│   │   ├── auth.css           # Páginas de autenticación
│   │   ├── chat.css           # Página de chat/mensajes
│   │   ├── gamification.css   # Página de gamificación
│   │   ├── profile.css        # Página de perfil
│   │   └── trips.css          # Páginas relacionadas con viajes
│   │
│   ├── global.css             # Estilos globales y layout principal
│   ├── reset.css              # Reset CSS para normalizar estilos
│   ├── responsive.css         # Media queries y diseño responsive
│   └── variables.css          # Variables CSS (colores, espaciados, etc.)
│
├── js/                        # Lógica JavaScript organizada por funcionalidad
│   ├── auth/                  # Módulo de autenticación
│   │   ├── login.js           # Lógica de inicio de sesión
│   │   ├── recover.js         # Recuperación de contraseña
│   │   ├── register.js        # Registro de usuarios
│   │   └── session.js         # Manejo de sesiones
│   │
│   ├── chat/                  # Módulo de chat
│   │   └── chat.js            # Funcionalidad de mensajería
│   │
│   ├── components/            # Componentes JavaScript reutilizables
│   │   ├── modal.js           # Sistema de modales
│   │   ├── navbar.js          # Componente de navegación dinámica
│   │   ├── notification-ui.js # Interfaz de notificaciones
│   │   └── pagination.js      # Componente de paginación
│   │
│   ├── gamification/         # Módulo de gamificación
│   │   └── badges.js          # Sistema de insignias
│   │
│   ├── rating/                # Módulo de calificaciones
│   │   ├── rate.js            # Sistema de calificación
│   │   └── reputation.js      # Sistema de reputación
│   │
│   ├── reservations/          # Módulo de reservas
│   │   ├── cancel.js          # Cancelación de reservas
│   │   ├── my-reservations.js # Gestión de mis reservas
│   │   └── reserve.js         # Creación de reservas
│   │
│   ├── trips/                 # Módulo de viajes
│   │   ├── delete.js          # Eliminación de viajes
│   │   ├── edit.js            # Edición de viajes
│   │   ├── edit-modal.js      # Modal para edición de viajes
│   │   ├── filter.js          # Filtrado de viajes
│   │   ├── history.js         # Historial de viajes
│   │   ├── map.js             # Integración de mapas
│   │   ├── my-trips.js        # Gestión de mis viajes
│   │   ├── publish.js         # Publicación de viajes
│   │   └── search.js          # Búsqueda de viajes
│   │
│   ├── utils/                 # Utilidades y helpers
│   │   ├── api.js             # Funciones para llamadas API
│   │   ├── demo-seed.js       # Datos de demostración para desarrollo
│   │   ├── helpers.js         # Funciones auxiliares
│   │   ├── notification.js    # Sistema de notificaciones
│   │   ├── setup-test-data.js # Configuración de datos de prueba
│   │   ├── storage.js         # Manejo de localStorage/sessionStorage
│   │   └── validation.js      # Validación de formularios
│   │
│   ├── config.js              # Configuración global de la aplicación
│   └── main.js                # Punto de entrada principal
│
├── pages/                     # Páginas HTML de la aplicación
│   ├── auth/                  # Páginas de autenticación
│   │   ├── login.html         # Inicio de sesión
│   │   ├── recover-password.html  # Recuperación de contraseña
│   │   └── register.html      # Registro
│   │
│   ├── chat/                  # Páginas de chat
│   │   ├── messages.html      # Mensajería
│   │   ├── chat.css           # Estilos del chat
│   │   └── chat.js            # Lógica del chat
│   │
│   ├── partnerships/          # Páginas de asociaciones
│   │   └── universities.html  # Universidades asociadas
│   │
│   ├── reservations/          # Páginas de reservas
│   │   ├── my-reservations.html  # Mis reservas
│   │   └── reserve.html       # Crear reserva
│   │
│   ├── trips/                 # Páginas de viajes
│   │   ├── edit.html          # Editar viaje
│   │   ├── my-trips.html      # Mis viajes
│   │   ├── publish.html       # Publicar viaje
│   │   ├── search-map.html    # Búsqueda con mapa
│   │   └── search.html        # Búsqueda de viajes
│   │
│   └── user/                  # Páginas de usuario
│       ├── gamification.html  # Gamificación e insignias
│       ├── notifications.html # Centro de notificaciones
│       ├── notifications.css  # Estilos para notificaciones
│       ├── notifications.js   # Lógica de notificaciones
│       ├── profile.html       # Perfil de usuario
│       ├── rate.html          # Calificar usuarios
│       ├── rate.css           # Estilos para calificaciones
│       ├── rate.js            # Lógica de calificaciones
│       ├── rate-trip.html     # Calificar viaje específico
│       ├── rate-trip.css      # Estilos para calificación de viaje
│       └── rate-trip.js       # Lógica de calificación de viaje
│
├── docs/                      # Documentación del proyecto
│   ├── api-endpoints.md       # Documentación de endpoints API
│   └── README.md              # (Vacío)
│
├── index.html                 # Página principal (landing page)
├── styles.css                 # Estilos adicionales (si aplica)
└── README.md                  # Este archivo
```

## 🎯 Principios de Organización

### CSS
- **Componentes**: Estilos reutilizables agrupados por componente
- **Páginas**: Estilos específicos para cada página o sección
- **Globales**: Variables, reset y estilos base compartidos
- **Responsive**: Media queries centralizadas en `responsive.css`
- **Variables CSS**: Colores, espaciados y tipografía centralizados en `variables.css`

### JavaScript
- **Por funcionalidad**: Cada módulo agrupa la lógica relacionada (auth, trips, chat, etc.)
- **Componentes**: Funcionalidades UI reutilizables (modales, navbar, etc.)
- **Utilidades**: Funciones auxiliares compartidas (API, validación, storage)
- **Modular**: Cada archivo tiene una responsabilidad específica

### HTML
- **Por módulo**: Cada carpeta agrupa las páginas relacionadas
- **Semántico**: Uso de etiquetas HTML5 semánticas
- **Accesible**: Incluye atributos ARIA cuando sea necesario

## 📦 Módulos y Utilidades

### Módulos Principales

#### 🔐 Autenticación (`js/auth/`)
- **login.js**: Manejo del inicio de sesión
- **register.js**: Registro de nuevos usuarios
- **recover.js**: Recuperación de contraseña
- **session.js**: Gestión de sesiones de usuario

#### 🚗 Viajes (`js/trips/`)
- **publish.js**: Publicación de nuevos viajes
- **search.js**: Búsqueda de viajes disponibles
- **filter.js**: Sistema de filtrado avanzado
- **edit.js**: Edición de viajes existentes
- **edit-modal.js**: Modal para edición rápida
- **delete.js**: Eliminación de viajes
- **my-trips.js**: Gestión de viajes del usuario
- **history.js**: Historial de viajes
- **map.js**: Integración con mapas para visualización

#### 📅 Reservas (`js/reservations/`)
- **reserve.js**: Creación de nuevas reservas
- **my-reservations.js**: Gestión de reservas del usuario
- **cancel.js**: Cancelación de reservas

#### 💬 Chat (`js/chat/`)
- **chat.js**: Sistema de mensajería en tiempo real

#### ⭐ Calificaciones (`js/rating/`)
- **rate.js**: Sistema de calificación de usuarios
- **reputation.js**: Cálculo y gestión de reputación

#### 🏆 Gamificación (`js/gamification/`)
- **badges.js**: Sistema de insignias y logros

### Componentes Reutilizables (`js/components/`)
- **modal.js**: Sistema de modales reutilizable
- **navbar.js**: Barra de navegación dinámica
- **notification-ui.js**: Interfaz de notificaciones
- **pagination.js**: Componente de paginación

### Utilidades (`js/utils/`)
- **api.js**: Funciones para comunicación con la API
- **storage.js**: Manejo de localStorage y sessionStorage
- **validation.js**: Validación de formularios
- **helpers.js**: Funciones auxiliares generales
- **notification.js**: Sistema de notificaciones
- **demo-seed.js**: Datos de demostración para desarrollo
- **setup-test-data.js**: Configuración de datos de prueba

### Configuración
- **config.js**: Configuración global de la aplicación (URLs de API, constantes, etc.)
- **main.js**: Punto de entrada principal, inicialización de la aplicación

## 🏁 Inicio Rápido

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd onepath-webapp
```

2. Abrir el proyecto:
   - Abrir `index.html` en un navegador para la landing page
   - O usar un servidor local (recomendado):
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server -p 8000

# Con PHP
php -S localhost:8000
```

3. Acceder a la aplicación:
   - Abrir `http://localhost:8000` en el navegador

## 📝 Convenciones de Código

### HTML
- Usar etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, etc.)
- Mantener una estructura limpia y accesible
- Incluir atributos `aria-*` cuando sea necesario para accesibilidad
- Usar IDs de manera única y clases reutilizables

### CSS
- Metodología BEM para nombres de clases cuando sea apropiado
- Organizar el CSS de manera lógica: reset/base → layout → components → utilities
- Preferir Flexbox y CSS Grid para layouts
- Usar variables CSS (custom properties) para colores, espaciados y tipografía
- Implementar diseño responsive con mobile-first
- Evitar `!important` a menos que sea absolutamente necesario

### JavaScript
- Usar `const` y `let`, nunca `var`
- Preferir funciones flecha para callbacks
- Usar template literals para strings complejos
- Implementar `async/await` para operaciones asíncronas
- Modularizar el código en funciones pequeñas y reutilizables
- Usar `addEventListener` en lugar de atributos `onclick` en HTML
- Implementar manejo de errores con `try-catch`
- Comentar lógica compleja

## 🔗 Documentación Adicional

- Consultar `docs/api-endpoints.md` para documentación de la API
- Revisar comentarios en el código para detalles específicos de implementación

## 👥 Para Desarrolladores

### Agregar Nuevas Funcionalidades

1. **Nuevas funcionalidades**: Crear archivos en el módulo correspondiente (`js/[módulo]/`)
2. **Nuevos componentes**: Agregar CSS en `css/components/` y JS en `js/components/`
3. **Nuevas páginas**: Crear HTML en `pages/[módulo]/` y estilos en `css/pages/`
4. **Recursos**: Agregar imágenes en `assets/images/[categoría]/`

### Estructura de Archivos

- **HTML**: Cada página debe incluir el navbar y footer dinámicos
- **CSS**: Importar variables y reset antes que otros estilos
- **JavaScript**: Usar `defer` o cargar antes del cierre de `</body>`
- **Componentes**: Los componentes reutilizables deben estar en `js/components/`

### Flujo de Trabajo

1. **Configuración**: Revisar `js/config.js` para URLs de API y constantes
2. **API**: Usar funciones de `js/utils/api.js` para llamadas HTTP
3. **Storage**: Usar `js/utils/storage.js` para persistencia local
4. **Validación**: Usar `js/utils/validation.js` para validar formularios
5. **Notificaciones**: Usar `js/utils/notification.js` para mostrar mensajes

### Testing y Desarrollo

- El proyecto incluye datos mock en `assets/data/mock-data.json`
- Usar `js/utils/demo-seed.js` y `js/utils/setup-test-data.js` para desarrollo
- Verificar que todas las rutas funcionen correctamente
- Probar en múltiples navegadores (Chrome, Firefox, Safari, Edge)

### Mejores Prácticas

- **Performance**: Optimizar imágenes y usar lazy loading cuando sea apropiado
- **Accesibilidad**: Asegurar navegación por teclado y contraste adecuado
- **Responsive**: Probar en diferentes tamaños de pantalla
- **Código limpio**: Mantener funciones pequeñas y con un solo propósito
- **Comentarios**: Documentar funciones complejas y decisiones importantes

---

**Nota**: Este proyecto no requiere instalación de dependencias ni procesos de build. Es una aplicación web estática que funciona directamente con HTML, CSS y JavaScript vanilla.
