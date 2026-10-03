class ApiService {
  static BASE = 'http://localhost:5000';

  static async request(path, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(`${this.BASE}${path}`, { ...options, headers });
    } catch (e) {
      throw new Error('Cannot reach the server. Please try again.');
    }

    let data = null;
    try { data = await response.json(); } catch (_) { /* empty body */ }

    if (response.status === 401 && token) {
      // token expired / invalid -> force re-login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    if (!response.ok) {
      const detail = data && (data.message || (data.errors && data.errors.join(', ')));
      throw new Error(detail || `Request failed (${response.status})`);
    }
    return data;
  }

  // ---- Auth (backend: /auth) ----
  static login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }
  static register(name, email, password) {
    const parts = name.trim().split(/\s+/);
    const fName = parts.shift();
    const lName = parts.join(' ');
    return this.request('/auth/signup', { method: 'POST', body: JSON.stringify({ fName, lName, email, password }) });
  }

  // ---- Products (backend: /products, /api/search) ----
  static getAllProducts()            { return this.request('/products'); }
  static getProductsByCategory(c)    { return this.request(`/api/search?q=${encodeURIComponent(c)}`); } // search matches category too
  static searchProducts(q)           { return this.request(`/api/search?q=${encodeURIComponent(q)}`); }
  static getCategories()             { return this.request('/api/v1/categories'); }

  // ---- Cart (backend: /api/v1/cart) ----
  static addToCart(productId, quantity = 1) {
    return this.request('/api/v1/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
  }
  static getCart()                   { return this.request('/api/v1/cart'); }
  static removeFromCart(cartItemId)  { return this.request(`/api/v1/cart/${cartItemId}`, { method: 'DELETE' }); }

  // ---- Wishlist (backend: /api/v1/wishlist) ----
  static addToWishlist(productId) {
    return this.request('/api/v1/wishlist', { method: 'POST', body: JSON.stringify({ productId }) });
  }
  static getWishlist()               { return this.request('/api/v1/wishlist'); }
  static removeFromWishlist(id)      { return this.request(`/api/v1/wishlist/${id}`, { method: 'DELETE' }); }

  // ---- Contact / Newsletter ----
  static sendContactMessage(fullName, email, subject, message) {
    return this.request('/contact', { method: 'POST', body: JSON.stringify({ fullName, email, subject, message }) });
  }
  static subscribeNewsletter(email) {
    return this.request('/api/v1/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
  }
}