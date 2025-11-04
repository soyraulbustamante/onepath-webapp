// Archivo de inicialización de usuario para desarrollo o demo
(function() {
  // Si ya hay un usuario en localStorage, no hacer nada
  if (localStorage.getItem('currentUser')) return;

  // Simulación de login por defecto (modo conductor)
  const defaultDriver = {
    id: 'driver-001',
    name: 'Carlos Pérez',
    role: 'driver',
    university: 'PUCP',
    major: 'Ingeniería'
  };

  // Guarda el usuario en localStorage
  localStorage.setItem('currentUser', JSON.stringify(defaultDriver));

  console.log('👤 Usuario de prueba cargado:', defaultDriver);
})();
