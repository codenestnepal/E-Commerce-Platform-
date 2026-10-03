class CartManager {
  static items = [];

  static async loadCart() {
    if (!AuthManager.isLoggedIn()) return (window.location.href = 'login.html');
    try {
      showLoadingSpinner(true);
      const res = await ApiService.getCart();
      this.items = (Array.isArray(res) ? res : res.cart?.items || []).filter((i) => i.product);
      this.render();
    } catch (e) {
      showNotification(e.message || 'Failed to load cart', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }

  static render() {
    const box = document.getElementById('cartItems');
    if (!box) return;
    if (!this.items.length) {
      box.innerHTML = '<p class="cart-empty">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
    } else {
      box.innerHTML = this.items.map((i) => {
        const p = i.product;
        return `
        <div class="cart-item" data-id="${i._id}">
          <div class="item-image"><img src="${escapeHtml(p.image || 'https://via.placeholder.com/120?text=No+Image')}" alt="${escapeHtml(p.name)}"></div>
          <div class="item-details"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category || '')}</p><span>${formatCurrency(p.price)}</span></div>
          <div class="item-quantity"><span>Qty: ${i.quantity}</span></div>
          <div class="item-total"><h4>${formatCurrency(p.price * i.quantity)}</h4></div>
          <button class="remove-btn" data-id="${i._id}" aria-label="Remove ${escapeHtml(p.name)}"><i class="fa-solid fa-trash"></i></button>
        </div>`;
      }).join('');
      box.querySelectorAll('.remove-btn').forEach((b) => b.addEventListener('click', () => this.remove(b.dataset.id)));
    }
    this.renderSummary();
  }

  static renderSummary() {
    const subtotal = this.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const shipping = this.items.length ? 15 : 0;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = formatCurrency(v); };
    set('summarySubtotal', subtotal);
    set('summaryShipping', shipping);
    set('summaryTotal', subtotal + shipping);
    document.querySelectorAll('.cart-count').forEach((el) => (el.textContent = this.items.length));
  }

  static async remove(id) {
    if (!confirm('Remove this item?')) return;
    try {
      showLoadingSpinner(true);
      await ApiService.removeFromCart(id);
      showNotification('Item removed', 'success');
      await this.loadCart();
    } catch (e) {
      showNotification(e.message || 'Failed to remove item', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cartItems')) CartManager.loadCart();
});