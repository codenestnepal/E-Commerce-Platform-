class AuthManager {
  static async login(email, password) {
    const res = await ApiService.login(email, password);
    localStorage.setItem('authToken', res.jwtToken);
    localStorage.setItem('userData', JSON.stringify(res.user || { email: res.email, role: res.role }));
    return res;
  }

  static async register(name, email, password) {
    return ApiService.register(name, email, password);
  }

  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
  }

  static isLoggedIn() {
    const t = localStorage.getItem('authToken');
    return !!t && t !== 'undefined' && t !== 'null';
  }

  static getUser() {
    try { return JSON.parse(localStorage.getItem('userData')); } catch (_) { return null; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (!AuthManager.isLoggedIn() && /(cart|wishlist|checkout)\.html$/.test(path)) {
    window.location.href = 'login.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      if (!email || !password) return showNotification('Please fill all fields', 'error');
      if (!validateEmail(email)) return showNotification('Invalid email', 'error');

      const btn = loginForm.querySelector('button[type="submit"]');
      try {
        btn.disabled = true;
        showLoadingSpinner(true);
        await AuthManager.login(email, password);
        showNotification('Login successful!', 'success');
        setTimeout(() => (window.location.href = 'index.html'), 800);
      } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
      } finally {
        btn.disabled = false;
        showLoadingSpinner(false);
      }
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const parts = name.split(/\s+/);

      if (!name || !email || !password || !confirmPassword) return showNotification('Please fill all fields', 'error');
      if (parts.length < 2 || parts[0].length < 3 || parts.slice(1).join(' ').length < 3)
        return showNotification('Enter first and last name (each at least 3 characters)', 'error');
      if (!validateEmail(email)) return showNotification('Invalid email', 'error');
      if (!validatePassword(password)) return showNotification('Password must be at least 6 characters', 'error');
      if (password !== confirmPassword) return showNotification('Passwords do not match', 'error');

      const btn = signupForm.querySelector('button[type="submit"]');
      try {
        btn.disabled = true;
        showLoadingSpinner(true);
        await AuthManager.register(name, email, password);
        showNotification('Account created! Please log in.', 'success');
        setTimeout(() => (window.location.href = 'login.html'), 1000);
      } catch (error) {
        showNotification(error.message || 'Signup failed', 'error');
      } finally {
        btn.disabled = false;
        showLoadingSpinner(false);
      }
    });
  }
});