(function(){
  'use strict';

  function pickUserByRole(role){
    try {
      const usersRaw = localStorage.getItem('users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const found = users.find(u => u.role === role);
        if (found) return found;
      }
      // Fallback to demo users if available
      const demoKey = role === 'driver' ? 'demoDriver' : 'demoPassenger';
      const demoRaw = localStorage.getItem(demoKey);
      if (demoRaw) return JSON.parse(demoRaw);
    } catch(e) {
      console.error('quick-user-switch: error picking user', e);
    }
    return null;
  }

  function setCurrentUser(user){
    if (!user) return;
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log(`✅ quick-user-switch: currentUser set to ${user.name} (${user.role})`);
    } catch(e) {
      console.error('quick-user-switch: error setting currentUser', e);
    }
  }

  function init(){
    try {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('user');
      if (!target) return; // nothing to do

      const role = target === 'driver' ? 'driver' : 'passenger';
      const user = pickUserByRole(role);
      setCurrentUser(user);
    } catch(e) {
      console.error('quick-user-switch: init error', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();