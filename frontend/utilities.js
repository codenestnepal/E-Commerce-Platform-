// UTILITY FUNCTIONS

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const icon = document.createElement('span');
  icon.className = 'notification-icon';
  const iconMap = { 'success': '✓', 'error': '✕', 'warning': '⚠', 'info': 'ℹ' };
  icon.textContent = iconMap[type] || 'ℹ';
  notification.prepend(icon);

  if (!document.querySelector('.notification-container')) {
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  document.querySelector('.notification-container').appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showLoadingSpinner(show = true) {
  let spinner = document.querySelector('.loading-spinner');
  if (show) {
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      spinner.innerHTML = `<div class="spinner"><div></div><div></div><div></div><div></div></div>`;
      document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
  } else {
    if (spinner) spinner.style.display = 'none';
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

document.addEventListener('DOMContentLoaded', () => {
  const styles = `
    .notification-container { position: fixed; top: 20px; right: 20px; z-index: 9999; }
    .notification { background: #4CAF50; color: white; padding: 16px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; }
    .notification-error { background: #f44336; }
    .notification-warning { background: #ff9800; }
    .notification-info { background: #2196F3; }
    .notification-icon { margin-right: 10px; font-weight: bold; }
    .notification.fade-out { animation: fadeOut 0.3s forwards; }
    @keyframes fadeOut { to { opacity: 0; } }
    .loading-spinner { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000; }
    .spinner { width: 80px; height: 80px; display: inline-block; position: relative; }
    .spinner div { position: absolute; border: 4px solid #fff; opacity: 1; border-radius: 50%; animation: spin 1s infinite; }
    .spinner div:nth-child(1) { left: 8px; top: 8px; animation-delay: -0.24s; }
    .spinner div:nth-child(2) { left: 32px; top: 5px; animation-delay: -0.12s; }
    .spinner div:nth-child(3) { left: 56px; top: 8px; }
    .spinner div:nth-child(4) { left: 59px; top: 39px; animation-delay: 0.12s; }
    @keyframes spin { 0% { opacity: 1; } 100% { opacity: 0; } }`;
  const sheet = document.createElement('style');
  sheet.textContent = styles;
  document.head.appendChild(sheet);
});