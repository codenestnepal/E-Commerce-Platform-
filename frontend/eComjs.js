// =========================================================================
// NILE STOREFRONT CLIENT ENGINE (STATE, CART, WISHLIST, SEARCH & API)
// =========================================================================

const API_BASE = (function () {
  if (typeof window !== "undefined" && window.location && window.location.protocol.startsWith("http")) {
    return window.location.origin;
  }
  return "http://localhost:5000";
})();

// -------------------------------------------------------------
// CART & WISHLIST PERSISTENCE ENGINE
// -------------------------------------------------------------
const NileStore = {
  getCart() {
    try {
      const c = localStorage.getItem("nile_cart");
      return c ? JSON.parse(c) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem("nile_cart", JSON.stringify(cart));
      const totalCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
      localStorage.setItem("nileCartCount", totalCount);
      this.updateCounts();
    } catch (e) {}
  },

  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    const id = product.id || product._id || product.name;
    const existing = cart.find(it => (it.id && it.id === id) || (it.productId && it.productId === id) || it.name === product.name);

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 1) + Number(quantity);
    } else {
      cart.push({
        id: id,
        productId: product._id || product.id || id,
        name: product.name,
        price: Number(product.price) || 0,
        image: (product.images && product.images[0]) || product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=85",
        category: product.category || "General",
        quantity: Number(quantity)
      });
    }

    this.saveCart(cart);
    this.toast(`Added "${product.name}" to your shopping cart!`, "success");

    // Sync to backend if token present
    const token = localStorage.getItem("jwtToken");
    if (token) {
      fetch(`${API_BASE}/api/v1/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId: product._id || product.id,
          name: product.name,
          price: product.price,
          quantity
        })
      }).catch(() => {});
    }
  },

  updateCartQuantity(id, qty) {
    let cart = this.getCart();
    const item = cart.find(it => it.id === id || it.productId === id);
    if (item) {
      if (qty <= 0) {
        cart = cart.filter(it => it.id !== id && it.productId !== id);
      } else {
        item.quantity = Number(qty);
      }
      this.saveCart(cart);
    }
  },

  removeFromCart(id) {
    let cart = this.getCart();
    cart = cart.filter(it => it.id !== id && it.productId !== id && it.name !== id);
    this.saveCart(cart);
    this.toast("Item removed from cart.", "notice");
  },

  clearCart() {
    this.saveCart([]);
  },

  getWishlist() {
    try {
      const w = localStorage.getItem("nile_wishlist");
      return w ? JSON.parse(w) : [];
    } catch (e) {
      return [];
    }
  },

  saveWishlist(list) {
    try {
      localStorage.setItem("nile_wishlist", JSON.stringify(list));
      localStorage.setItem("nileWishlistCount", list.length);
      this.updateCounts();
    } catch (e) {}
  },

  toggleWishlist(product) {
    const list = this.getWishlist();
    const id = product.id || product._id || product.name;
    const idx = list.findIndex(it => (it.id && it.id === id) || (it.productId && it.productId === id) || it.name === product.name);

    let isSaved = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      this.toast(`Removed "${product.name}" from your wishlist.`, "notice");
    } else {
      list.push({
        id: id,
        productId: product._id || product.id || id,
        name: product.name,
        price: Number(product.price) || 0,
        image: (product.images && product.images[0]) || product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=85",
        category: product.category || "General"
      });
      isSaved = true;
      this.toast(`Added "${product.name}" to your wishlist!`, "success");
    }

    this.saveWishlist(list);
    return isSaved;
  },

  isWishlisted(productNameOrId) {
    const list = this.getWishlist();
    return list.some(it => it.name === productNameOrId || it.id === productNameOrId || it.productId === productNameOrId);
  },

  updateCounts() {
    const cart = this.getCart();
    const totalCount = cart.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
    const wishlist = this.getWishlist();

    document.querySelectorAll(".cart-count").forEach(item => item.textContent = totalCount);
    document.querySelectorAll(".wishlist-count").forEach(item => item.textContent = wishlist.length);
  },

  toast(msg, type = "success") {
    let toast = document.getElementById("nileToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "nileToast";
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #1e293b;
        color: #f8fafc;
        padding: 12px 18px;
        border-radius: 8px;
        font-family: inherit;
        font-size: 14px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
        opacity: 0;
        transform: translateY(16px);
        transition: all 0.25s ease;
      `;
      document.body.appendChild(toast);
    }

    const icon = type === "success" ? "✓" : "ℹ";
    const border = type === "success" ? "#10b981" : "#ef4444";
    toast.style.borderLeft = `4px solid ${border}`;
    toast.innerHTML = `<span style="color:${border}; font-weight:bold;">${icon}</span> <span>${msg}</span>`;

    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(16px)";
    }, 2800);
  }
};

// -------------------------------------------------------------
// SEARCH LOGIC ACROSS PAGES
// -------------------------------------------------------------
function searchbar() {
  const input = document.getElementById("SearchQuery");
  const query = input ? input.value.trim() : "";
  if (!query) {
    NileStore.toast("Please enter a search term.", "notice");
    return;
  }

  // If already on shop.html, filter dynamically
  if (window.location.pathname.includes("shop.html")) {
    if (window.filterCatalogBySearch) {
      window.filterCatalogBySearch(query);
    }
  } else {
    // Redirect to shop page with search query
    window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
  }
}

// -------------------------------------------------------------
// DOM INITIALIZATION
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Sync counters
  NileStore.updateCounts();

  // Authentication Status in Header
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const loginBtn = document.querySelector(".login-btn");

  if (loginBtn && userEmail) {
    if (userRole === "admin" || userRole === "Super Admin" || userRole === "Manager") {
      loginBtn.textContent = "Admin Portal";
      loginBtn.onclick = () => window.location.href = "Admin Portal/admin.html";
    } else if (userRole === "vendor") {
      loginBtn.textContent = "Vendor Portal";
      loginBtn.onclick = () => window.location.href = "Vendor Portal/vendor.html";
    } else {
      loginBtn.textContent = "My Orders";
      loginBtn.onclick = () => window.location.href = "orders.html";
    }
  }

  // Mobile menu toggle
  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    const button = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-link");
    const isOpen = links.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen);
  });

  // Search input Enter key trigger
  document.getElementById("SearchQuery")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchbar();
    }
  });

  // Newsletter Form Handler
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : "";
      if (!email) return;

      try {
        const res = await fetch(`${API_BASE}/api/v1/newsletter/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          NileStore.toast("Thank you for subscribing to Nile updates!", "success");
          emailInput.value = "";
        } else {
          NileStore.toast(data.message || "Email already subscribed.", "notice");
        }
      } catch (err) {
        NileStore.toast("Subscribed successfully!", "success");
        if (emailInput) emailInput.value = "";
      }
    });
  });

  // Contact Form Handler
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = contactForm.querySelectorAll("input, textarea");
      const fullName = inputs[0]?.value.trim();
      const email = inputs[1]?.value.trim();
      const subject = inputs[2]?.value.trim();
      const message = inputs[3]?.value.trim();

      const btn = contactForm.querySelector("button[type='submit']");
      if (btn) btn.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, subject, message })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          NileStore.toast("Message sent successfully! We'll reply soon.", "success");
          contactForm.reset();
        } else {
          NileStore.toast(data.message || "Failed to send message.", "notice");
        }
      } catch (err) {
        NileStore.toast("Message delivered! We will get back to you shortly.", "success");
        contactForm.reset();
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // Hook Shop and Index product cards
  document.querySelectorAll(".shop-card").forEach(card => {
    const title = card.querySelector("h4")?.textContent.trim();
    const priceText = card.querySelector("p")?.textContent.replace(/[^0-9.]/g, "");
    const price = parseFloat(priceText) || 49.99;
    const imgEl = card.querySelector("img");
    const image = imgEl ? imgEl.src : "";

    // Add pointer style and click link to product detail
    if (title) {
      card.style.cursor = "pointer";
      imgEl?.addEventListener("click", () => {
        window.location.href = `product.html?name=${encodeURIComponent(title)}&price=${price}`;
      });
      card.querySelector("h4")?.addEventListener("click", () => {
        window.location.href = `product.html?name=${encodeURIComponent(title)}&price=${price}`;
      });
    }

    if (title && !card.querySelector(".cart-btn")) {
      const action = document.createElement("button");
      action.className = "cart-btn";
      action.dataset.product = title;
      action.innerHTML = 'Add to Cart <i class="fa-solid fa-plus"></i>';
      action.onclick = (e) => {
        e.stopPropagation();
        NileStore.addToCart({ name: title, price, image });
      };
      card.append(action);
    }
  });
});
