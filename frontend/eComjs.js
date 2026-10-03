//Logic for Login/Signup page

function searchbar() {
  const searchInput = document.getElementById("SearchQuery");
  const query = searchInput ? searchInput.value.trim() : '';
  
  if(query) {
    SearchManager.performSearch(query);
  } else {
    showNotification("Please enter a search term.", 'warning');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (AuthManager.isLoggedIn()) {
    updateDisplayCounts();
  } else {
    const cartCount = Number(localStorage.getItem("nileCartCount") || 0);
    const wishlistCount = Number(localStorage.getItem("nileWishlistCount") || 0);
    document.querySelectorAll(".cart-count").forEach((item) => item.textContent = cartCount);
    document.querySelectorAll(".wishlist-count").forEach((item) => item.textContent = wishlistCount);
  }

  const catalogImages = {
    Smartphone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=85",
    Laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=85",
    Headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=85",
    "Smart Watch": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=85",
    Jacket: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=600&q=85",
    "T-Shirt": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=85",
    Jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=85",
    Sneakers: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85",
    Sofa: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=85",
    Chair: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=85",
    Table: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=85",
    Lamp: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=85",
    "Beauty Kit": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=85",
    Perfume: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=85",
    "Face Wash": "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=600&q=85",
    Moisturizer: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=85",
    Football: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=600&q=85",
    Basketball: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=85",
    "Gym Bag": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=85",
    "Yoga Mat": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=85"
  };

  document.querySelectorAll(".shop-card").forEach((card) => {
    const title = card.querySelector("h4")?.textContent.trim();
    const image = card.querySelector("img");
    if (catalogImages[title] && image) {
      image.src = catalogImages[title];
      image.alt = title;
    }
  });

  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    const button = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-link");
    const isOpen = links.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen);
  });

  document.addEventListener("click", async (e) => {
    const cartBtn = e.target.closest(".cart-btn.add-to-cart-btn, .shop-card .cart-btn");
    if (cartBtn && !cartBtn.classList.contains("move-to-cart")) {
      if (!AuthManager.isLoggedIn()) {
        showNotification("Please login to add items to cart", "warning");
        setTimeout(() => (window.location.href = "login.html"), 1200);
        return;
      }
      const productId = cartBtn.dataset.productId;
      const original = cartBtn.innerHTML;
      if (productId) {
        try {
          cartBtn.disabled = true;
          await ApiService.addToCart(productId, 1);
          showNotification("Added to cart!", "success");
          updateDisplayCounts();
        } catch (err) {
          showNotification(err.message || "Failed to add to cart", "error");
          cartBtn.disabled = false;
          return;
        }
      }
      cartBtn.innerHTML = 'Added <i class="fa-solid fa-check"></i>';
      setTimeout(() => { cartBtn.innerHTML = original; cartBtn.disabled = false; }, 1300);
      return;
    }

    const wishBtn = e.target.closest(".product-wishlist");
    if (wishBtn) {
      if (!AuthManager.isLoggedIn()) {
        showNotification("Please login to save items", "warning");
        return;
      }
      const productId = wishBtn.dataset.productId;
      const willSave = !wishBtn.classList.contains("is-saved");
      wishBtn.classList.toggle("is-saved", willSave);
      wishBtn.querySelector("i").className = willSave ? "fa-solid fa-heart" : "fa-regular fa-heart";
      if (!productId) return;
      try {
        if (willSave) {
          await ApiService.addToWishlist(productId);
        } else {
          const list = await ApiService.getWishlist();
          const entry = (Array.isArray(list) ? list : []).find((w) => w.product && w.product._id === productId);
          if (entry) await ApiService.removeFromWishlist(entry._id);
        }
        updateDisplayCounts();
      } catch (err) {
        showNotification(err.message || "Failed to update wishlist", "error");
        wishBtn.classList.toggle("is-saved", !willSave); 
        wishBtn.querySelector("i").className = !willSave ? "fa-solid fa-heart" : "fa-regular fa-heart";
      }
    }
  });

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail")?.value.trim();
      if (!email || !validateEmail(email)) return showNotification("Please enter a valid email", "error");
      const btn = newsletterForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      try {
        btn.disabled = true;
        btn.textContent = "Subscribing...";
        await ApiService.subscribeNewsletter(email);
        showNotification("Successfully subscribed!", "success");
        newsletterForm.reset();
      } catch (err) {
        showNotification(err.message || "Failed to subscribe", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }
});

async function updateDisplayCounts() {
  if (!AuthManager.isLoggedIn()) return;
  try {
    const [cart, wish] = await Promise.all([ApiService.getCart(), ApiService.getWishlist()]);
    const cartCount = Array.isArray(cart) ? cart.length : 0;
    const wishCount = Array.isArray(wish) ? wish.length : 0;
    document.querySelectorAll(".cart-count").forEach((el) => (el.textContent = cartCount));
    document.querySelectorAll(".wishlist-count").forEach((el) => (el.textContent = wishCount));
  } catch (error) {
    console.error("Failed to update counts:", error);
  }
}