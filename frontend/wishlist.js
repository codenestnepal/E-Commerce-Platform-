class WishlistManager {
  static async loadWishlist() {
    if (!AuthManager.isLoggedIn()) return (window.location.href = 'login.html');
    try {
      showLoadingSpinner(true);
      const res = await ApiService.getWishlist();
      this.display((Array.isArray(res) ? res : res.wishlist || []).filter((i) => i.product));
    } catch (e) {
      showNotification(e.message || 'Failed to load wishlist', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }

  static display(items) {
    const grid = document.getElementById('wishlistGrid');
    if (!grid) return;
    grid.innerHTML = items.map((i) => {
      const p = i.product;
      return `
      <div class="wishlist-card" data-id="${i._id}">
        <div class="card-img-container">
          <button class="remove-btn" data-id="${i._id}" title="Remove from wishlist"><i class="fa-solid fa-xmark"></i></button>
          <img src="${escapeHtml(p.image || 'https://via.placeholder.com/300?text=No+Image')}" alt="${escapeHtml(p.name)}">
        </div>
        <div class="card-content">
          <div class="card-cat">${escapeHtml(p.category || '')}</div>
          <h3 class="card-product-title">${escapeHtml(p.name)}</h3>
          <div class="card-price">${formatCurrency(p.price || 0)}</div>
          <button class="cart-btn move-to-cart" data-product-id="${p._id}" data-id="${i._id}">Add to Cart</button>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.remove-btn').forEach((b) => b.addEventListener('click', () => this.remove(b.dataset.id)));
    grid.querySelectorAll('.move-to-cart').forEach((b) => b.addEventListener('click', () => this.toCart(b.dataset.productId)));

    const counter = document.getElementById('itemCount');
    if (counter) counter.textContent = items.length;
    if (typeof updateCounter === 'function') updateCounter(); // toggles the page's empty state
    document.querySelectorAll('.wishlist-count').forEach((el) => (el.textContent = items.length));
  }

  static async toCart(productId) {
    try {
      showLoadingSpinner(true);
      await ApiService.addToCart(productId, 1);
      showNotification('Added to cart!', 'success');
      updateDisplayCounts();
    } catch (e) {
      showNotification(e.message || 'Failed to add to cart', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }

  static async remove(id) {
    try {
      showLoadingSpinner(true);
      await ApiService.removeFromWishlist(id);
      showNotification('Removed from wishlist', 'success');
      await this.loadWishlist();
    } catch (e) {
      showNotification(e.message || 'Failed to remove', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('wishlistGrid')) WishlistManager.loadWishlist();
});