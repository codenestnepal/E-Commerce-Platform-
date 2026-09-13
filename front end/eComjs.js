//Logic for Login/Signup page

function searchbar() {
  const query = document.getElementById("SearchQuery").value;
  if(query) {
    alert("Searching for: " + query);
    // Later you can connect this to backend or product search
  } else {
    alert("Please enter a search term.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cartCount = Number(localStorage.getItem("nileCartCount") || 0);
  const wishlistCount = Number(localStorage.getItem("nileWishlistCount") || 0);

  const updateCounts = () => {
    document.querySelectorAll(".cart-count").forEach((item) => item.textContent = localStorage.getItem("nileCartCount") || 0);
    document.querySelectorAll(".wishlist-count").forEach((item) => item.textContent = localStorage.getItem("nileWishlistCount") || 0);
  };

  localStorage.setItem("nileCartCount", cartCount);
  localStorage.setItem("nileWishlistCount", wishlistCount);
  updateCounts();

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
    if (title && !card.querySelector("button")) {
      const action = document.createElement("button");
      action.className = "cart-btn";
      action.dataset.product = title;
      action.innerHTML = 'Add to Cart <i class="fa-solid fa-plus"></i>';
      card.append(action);
    }
  });

  document.querySelector(".menu-toggle")?.addEventListener("click", () => {
    const button = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-link");
    const isOpen = links.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen);
  });

  document.querySelectorAll(".cart-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const nextCount = Number(localStorage.getItem("nileCartCount") || 0) + 1;
      localStorage.setItem("nileCartCount", nextCount);
      updateCounts();
      button.innerHTML = 'Added <i class="fa-solid fa-check"></i>';
      setTimeout(() => { button.innerHTML = 'Add to Cart <i class="fa-solid fa-plus"></i>'; }, 1300);
    });
  });

  document.querySelectorAll(".product-wishlist").forEach((button) => {
    button.addEventListener("click", () => {
      const isSaved = button.classList.toggle("is-saved");
      button.querySelector("i").className = isSaved ? "fa-solid fa-heart" : "fa-regular fa-heart";
      const amount = Number(localStorage.getItem("nileWishlistCount") || 0) + (isSaved ? 1 : -1);
      localStorage.setItem("nileWishlistCount", Math.max(amount, 0));
      updateCounts();
    });
  });
});
