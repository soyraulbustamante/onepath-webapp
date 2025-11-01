# OnePath WebApp

Aplicación web para OnePath, una plataforma de viajes compartidos entre estudiantes universitarios. El proyecto está construido con **HTML5**, **CSS3** y **JavaScript Vanilla (ES6+)**, siguiendo una arquitectura modular sin frameworks externos.

## 🚀 Stack Tecnológico

- **HTML5** semántico
- **CSS3** puro (sin frameworks CSS como Tailwind)
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
│   │   └── reserve.js         # Creación de reservas
│   │
│   ├── trips/                 # Módulo de viajes
│   │   ├── delete.js          # Eliminación de viajes
│   │   ├── edit.js            # Edición de viajes
│   │   ├── filter.js          # Filtrado de viajes
│   │   ├── history.js         # Historial de viajes
│   │   ├── map.js             # Integración de mapas
│   │   ├── publish.js         # Publicación de viajes
│   │   └── search.js          # Búsqueda de viajes
│   │
│   ├── utils/                 # Utilidades y helpers
│   │   ├── api.js             # Funciones para llamadas API
│   │   ├── helpers.js         # Funciones auxiliares
│   │   ├── notification.js   # Sistema de notificaciones
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
│   │   └── messages.html      # Mensajería
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
│       ├── profile.html       # Perfil de usuario
│       └── rate.html          # Calificar usuarios
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

### JavaScript
- **Por funcionalidad**: Cada módulo agrupa la lógica relacionada (auth, trips, chat, etc.)
- **Componentes**: Funcionalidades UI reutilizables (modales, navbar, etc.)
- **Utilidades**: Funciones auxiliares compartidas (API, validación, storage)

### HTML
- **Por módulo**: Cada carpeta agrupa las páginas relacionadas
- **Semántico**: Uso de etiquetas HTML5 semánticas

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

- **HTML**: Usar etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`, etc.)
- **CSS**: Metodología BEM para nombres de clases cuando sea apropiado
- **JavaScript**: ES6+ (const/let, arrow functions, template literals, async/await)
- **Nombres**: Usar nombres descriptivos en español o inglés según el contexto

## 🔗 Documentación Adicional

- Consultar `docs/api-endpoints.md` para documentación de la API
- Revisar comentarios en el código para detalles específicos de implementación

## 👥 Para Desarrolladores

Al trabajar en este proyecto:

1. **Nuevas funcionalidades**: Crear archivos en el módulo correspondiente (`js/[módulo]/`)
2. **Nuevos componentes**: Agregar CSS en `css/components/` y JS en `js/components/`
3. **Nuevas páginas**: Crear HTML en `pages/[módulo]/` y estilos en `css/pages/`
4. **Recursos**: Agregar imágenes en `assets/images/[categoría]/`

---

**Nota**: Este proyecto no requiere instalación de dependencias ni procesos de build. Es una aplicación web estática que funciona directamente con HTML, CSS y JavaScript vanilla.
