class ProductManager {
  static toArray(res) {
    if (Array.isArray(res)) return res;
    return (res && (res.products || res.data)) || [];
  }

  static async loadAllProducts() {
    try {
      showLoadingSpinner(true);
      this.displayProducts(this.toArray(await ApiService.getAllProducts()));
    } catch (error) {
      console.error('Failed to load products:', error);
      showNotification(error.message || 'Failed to load products', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }

  static async loadProductsByCategory(category) {
    try {
      showLoadingSpinner(true);
      this.displayProducts(this.toArray(await ApiService.getProductsByCategory(category)));
    } catch (error) {
      console.error('Failed to load products:', error);
      showNotification(error.message || 'Failed to load products', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }

  static displayProducts(products) {
    const container =
      document.querySelector('.products-container') ||
      document.querySelector('.shop-card-group') ||
      document.querySelector('.category-grid') ||
      document.querySelector('.products-grid');
    if (!container) return;

    if (!products || products.length === 0) {
      if (!container.children.length) container.innerHTML = '<p>No products found.</p>';
      return;
    }

    const fallback = 'https://via.placeholder.com/300x300?text=No+Image';
    container.innerHTML = '';
    products.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.dataset.productId = p._id || '';
      const name = escapeHtml(p.name);
      card.innerHTML = `
        <div class="shop-card-img" style="position:relative;width:100%">
          <button class="product-wishlist" type="button" aria-label="Save ${name}" data-product-id="${p._id || ''}"><i class="fa-regular fa-heart"></i></button>
          <img src="${escapeHtml(p.image || fallback)}" alt="${name}" onerror="this.src='${fallback}'">
        </div>
        <h4>${name}</h4>
        <p>${escapeHtml(p.description || p.category || '')}</p>
        <p class="product-price">${formatCurrency(p.price || 0)}</p>
        <div class="product-actions">
          <button class="cart-btn add-to-cart-btn" data-product-id="${p._id || ''}">Add to Cart <i class="fa-solid fa-plus"></i></button>
        </div>`;
      container.appendChild(card);
    });
  }

  static async updateCartCount() { return updateDisplayCounts(); }
  static async updateWishlistCount() { return updateDisplayCounts(); }
}

document.addEventListener('DOMContentLoaded', () => {
  const hasGrid = document.querySelector('.products-container, .shop-card-group, .category-grid');
  const params = new URLSearchParams(window.location.search);
  if (!hasGrid || params.get('search')) return; 
  const category = params.get('category');
  category ? ProductManager.loadProductsByCategory(category) : ProductManager.loadAllProducts();
});