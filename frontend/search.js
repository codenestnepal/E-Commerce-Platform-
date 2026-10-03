class SearchManager {
  static performSearch(query) {
    if (!query || !query.trim()) return showNotification('Please enter a search term', 'error');
    window.location.href = `shop.html?search=${encodeURIComponent(query.trim())}`;
  }

  static async loadSearchResults() {
    const q = new URLSearchParams(window.location.search).get('search');
    if (!q) return;
    const title = document.querySelector('.page-title') || document.querySelector('h1');
    if (title) title.textContent = `Search Results for: "${q}"`;
    try {
      showLoadingSpinner(true);
      const res = await ApiService.searchProducts(q);
      const list = ProductManager.toArray(res);
      if (list.length) return ProductManager.displayProducts(list);
      const c = document.querySelector('.shop-card-group') || document.querySelector('.products-container');
      if (c) c.innerHTML = '<p>No products found.</p>';
    } catch (e) {
      showNotification(e.message || 'Search failed', 'error');
    } finally {
      showLoadingSpinner(false);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  SearchManager.loadSearchResults();
  document.getElementById('SearchQuery')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); SearchManager.performSearch(e.target.value); }
  });
});