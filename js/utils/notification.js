const showNotification = (message, type = 'info') => {
  const container = document.getElementById('notification-container');
  if (!container) {
    console.error('Notification container not found!');
    return;
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      container.removeChild(notification);
    }, 500);
  }, 5000);
};