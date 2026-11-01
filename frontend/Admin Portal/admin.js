// =========================================================================
// NILE ADMIN PORTAL CONTROLLER (REST API INTEGRATION)
// =========================================================================

const NAV = [
  ["dashboard", "Dashboard"],
  ["users", "Users"],
  ["vendors", "Vendors"],
  ["products", "Products & Categories"],
  ["orders", "Orders & Payments"],
  ["commission", "Commission"],
  ["coupons", "Coupons & Promotions"],
  ["reports", "Reports & Analytics"],
  ["reviews", "Reviews & Complaints"],
  ["announcements", "Announcements"],
  ["settings", "System Settings"],
  ["roles", "Roles & Permissions"]
];

// Determine Backend URL dynamically based on environment
const API_BASE = (function () {
  if (typeof window !== "undefined" && window.location && window.location.protocol.startsWith("http")) {
    // If running on backend host (e.g. port 5000), use origin
    return `${window.location.origin}/api/v1/admin`;
  }
  // Fallback for file:// protocol or external dev server
  return "http://localhost:5000/api/v1/admin";
})();

// Build Navigation
const navEl = document.getElementById("nav");
NAV.forEach(([id, label]) => {
  const b = document.createElement("button");
  b.className = "nav-btn" + (id === "dashboard" ? " active" : "");
  b.id = "nav-" + id;
  b.dataset.action = "go";
  b.dataset.id = id;
  b.innerHTML = `<span class="dot"></span><span class="label">${label.replace(/&/g, "&amp;")}</span>`;
  navEl.appendChild(b);
});

function showPage(id) {
  const page = document.getElementById(id);
  const btn = document.getElementById("nav-" + id);
  if (!page || !btn) return;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  page.classList.add("active");
  btn.classList.add("active");
}

// Formatting and DOM Helpers
const CUR = "$";
const money = n => CUR + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = id => document.getElementById(id);
const uid = () => "id_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2400);
}

// Connection Status Pill
function updateConnectionIndicator(isOnline) {
  const el = $("connectionStatus");
  if (!el) return;
  const textEl = el.querySelector(".status-text");
  if (isOnline) {
    el.classList.remove("offline");
    if (textEl) textEl.textContent = "Backend Live";
    el.title = "Connected to Nile Backend API";
  } else {
    el.classList.add("offline");
    if (textEl) textEl.textContent = "Offline Mode";
    el.title = "Running locally. Backend sync pending.";
  }
}

// API Fetch Helper
function getAuthToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("jwtToken") || "";
}

async function apiCall(endpoint, method = "GET", body = null) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const options = { method, headers };
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || `API error ${res.status}`);
    }
    updateConnectionIndicator(true);
    return json;
  } catch (err) {
    console.warn(`[Backend at ${endpoint}]`, err.message);
    updateConnectionIndicator(false);
    return null;
  }
}

const TAG_CLASS = {
  approved: "good",
  active: "good",
  published: "good",
  paid: "good",
  delivered: "good",
  resolved: "good",
  open: "warn",
  pending: "warn",
  processing: "warn",
  shipped: "warn",
  rejected: "bad",
  suspended: "bad",
  cancelled: "bad",
  refunded: "bad",
  removed: "bad",
  inactive: "bad"
};

const tag = s => `<span class="tag ${TAG_CLASS[s] || ""}">${esc(s)}</span>`;
const emptyRow = (cols, msg) => `<tr><td colspan="${cols}" class="empty">${esc(msg)}</td></tr>`;
const btn = (action, id, label, extra = "", cls = "") =>
  `<button class="${cls}" data-action="${action}" data-id="${esc(id)}" ${extra}>${esc(label)}</button>`;

const PERMS = [
  "Manage users",
  "Manage vendors",
  "Manage products",
  "Manage orders",
  "Manage payments",
  "View reports",
  "Manage settings"
];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function seed() {
  return {
    users: [
      { id: "u_super_admin", name: "Platform Admin", email: "admin@nile.com", role: "Super Admin", status: "active" },
      { id: "u1", name: "Pat Smith", email: "pat@mail.com", role: "vendor", status: "active" },
      { id: "u2", name: "Sau Rivera", email: "sau@mail.com", role: "vendor", status: "active" },
      { id: "u3", name: "Elena Vance", email: "elena@customer.com", role: "user", status: "active" }
    ],
    vendors: [
      { id: "v1", store: "Cookie Shop", owner: "Pat Smith", email: "pat@mail.com", status: "approved", rate: 8.5 },
      { id: "v2", store: "Tech Extreme", owner: "Sau Rivera", email: "sau@mail.com", status: "approved", rate: 10 }
    ],
    categories: ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Kids"],
    products: [
      { id: "p1", name: "Smartphone Pro Max", vendorId: "v2", category: "Electronics", price: 899.99, status: "published" },
      { id: "p2", name: "Wireless ANC Headphones", vendorId: "v2", category: "Electronics", price: 199.5, status: "published" }
    ],
    orders: [
      { id: "ORD-94812", customer: "Elena Vance", vendorId: "v2", amount: 899.99, status: "delivered", payment: "paid" }
    ],
    commission: 10,
    coupons: [
      { id: "cp_1", code: "WELCOME10", discount: 10, active: true },
      { id: "cp_2", code: "NILEMEGA20", discount: 20, active: true }
    ],
    reviews: [
      { id: "rev_1", type: "Review", from: "Elena Vance", vendorId: "v2", about: "Smartphone", text: "Great phone!", status: "open" }
    ],
    announcements: [
      { id: "ann_1", title: "Welcome to Nile Portal v2", message: "Enjoy the enhanced catalog and admin tools.", audience: "Everyone", date: new Date().toISOString() }
    ],
    settings: { name: "Nile Marketplace", email: "support@nile.com", vreg: "open", maint: "off" },
    roles: [
      { id: "ro1", name: "Super Admin", locked: true, perms: PERMS.slice() },
      { id: "ro2", name: "Manager", locked: false, perms: ["Manage vendors", "Manage products", "Manage orders", "View reports"] },
      { id: "ro3", name: "Support", locked: false, perms: ["Manage orders"] }
    ]
  };
}

// In-Memory state with fallback
let state = Object.assign(seed(), load("ad_state_v2", {}));
const persist = () => save("ad_state_v2", state);

const findVendor = id => state.vendors.find(v => v.id === id);
const vendorName = id => {
  const v = findVendor(id);
  return v ? v.store : "General Store";
};
const rateOf = v => (v && v.rate !== null && v.rate !== undefined && v.rate !== "" ? Number(v.rate) : Number(state.commission));
const paidOrders = () => state.orders.filter(o => o.payment === "paid");
const sum = arr => arr.reduce((s, o) => s + Number(o.amount || 0), 0);
const vendorPaid = id => sum(paidOrders().filter(o => o.vendorId === id));
const commissionOf = v => (vendorPaid(v.id) * rateOf(v)) / 100;

// -------------------------------------------------------------
// RENDERING FUNCTIONS
// -------------------------------------------------------------
function renderDashboard() {
  const revenue = sum(paidOrders());
  const earned = state.vendors.reduce((s, v) => s + commissionOf(v), 0);
  const pendingVendors = state.vendors.filter(v => v.status === "pending").length;
  const pendingProducts = state.products.filter(p => p.status === "pending").length;
  const openReviews = state.reviews.filter(r => r.status === "open").length;
  const cards = [
    ["Total users", state.users.length],
    ["Approved vendors", state.vendors.filter(v => v.status === "approved").length],
    ["Total orders", state.orders.length],
    ["Total revenue", money(revenue)],
    ["Commission earned", money(earned)],
    ["Published products", state.products.filter(p => p.status === "published").length]
  ];
  $("dashCards").innerHTML = cards.map(c => `<div class="card"><h3>${esc(c[0])}</h3><p>${esc(c[1])}</p></div>`).join("");

  const items = [
    [pendingVendors, "vendor application(s) waiting for review", "vendors"],
    [pendingProducts, "product(s) waiting for approval", "products"],
    [openReviews, "open review(s) or complaint(s)", "reviews"]
  ].filter(i => i[0] > 0);

  $("attentionPanel").innerHTML = items.length
    ? items.map(i => `<div class="attn-item"><span>${i[0]} ${esc(i[1])}</span>${btn("go", i[2], "Review", "", "btn ghost small")}</div>`).join("")
    : '<div class="empty">Nothing needs your attention right now.</div>';
}

function renderUsers() {
  $("userList").innerHTML = state.users.length
    ? state.users.map(u => `<tr>
        <td>${esc(u.name || (u.FName ? `${u.FName} ${u.LName || ''}` : u.email))}</td>
        <td>${esc(u.email)}</td>
        <td>${esc(u.role)}</td>
        <td>${tag(u.status || "active")}</td>
        <td class="row-actions">
          ${(u.status || "active") === "active" ? btn("userStatus", u.id, "Suspend", 'data-status="suspended"') : btn("userStatus", u.id, "Activate", 'data-status="active"', "good")}
          ${btn("userDelete", u.id, "Delete")}
        </td>
      </tr>`).join("")
    : emptyRow(5, "No users yet.");
}

function renderVendors() {
  const f = $("vendorFilter").value;
  const list = state.vendors.filter(v => f === "all" || v.status === f);
  $("vendorList").innerHTML = list.length
    ? list.map(v => {
        let actions = "";
        if (v.status === "pending") {
          actions = btn("vendorStatus", v.id, "Approve", 'data-status="approved"', "good") + btn("vendorStatus", v.id, "Reject", 'data-status="rejected"');
        } else if (v.status === "approved") {
          actions = btn("vendorStatus", v.id, "Suspend", 'data-status="suspended"');
        } else if (v.status === "suspended") {
          actions = btn("vendorStatus", v.id, "Reinstate", 'data-status="approved"', "good");
        } else {
          actions = btn("vendorStatus", v.id, "Approve", 'data-status="approved"', "good");
        }
        return `<tr>
          <td>${esc(v.store)}</td>
          <td>${esc(v.owner)}</td>
          <td>${esc(v.email)}</td>
          <td>${tag(v.status)}</td>
          <td class="row-actions">${actions}</td>
        </tr>`;
      }).join("")
    : emptyRow(5, "No vendors match this filter.");
}

function renderProducts() {
  $("productList").innerHTML = state.products.length
    ? state.products.map(p => {
        let actions = "";
        if (p.status === "pending") {
          actions = btn("productStatus", p.id, "Approve", 'data-status="published"', "good") + btn("productStatus", p.id, "Reject", 'data-status="rejected"');
        } else if (p.status === "published") {
          actions = btn("productStatus", p.id, "Unpublish", 'data-status="rejected"');
        } else {
          actions = btn("productStatus", p.id, "Approve", 'data-status="published"', "good");
        }
        actions += btn("productDelete", p.id, "Remove");
        return `<tr>
          <td>${esc(p.name)}</td>
          <td>${esc(vendorName(p.vendorId))}</td>
          <td>${esc(p.category)}</td>
          <td>${money(p.price)}</td>
          <td>${tag(p.status)}</td>
          <td class="row-actions">${actions}</td>
        </tr>`;
      }).join("")
    : emptyRow(6, "No products submitted yet.");

  $("categoryList").innerHTML = state.categories.length
    ? state.categories.map((c, i) => {
        const count = state.products.filter(p => p.category === c).length;
        return `<tr>
          <td>${esc(c)}</td>
          <td>${count}</td>
          <td class="row-actions">${btn("categoryDelete", c, "Remove")}</td>
        </tr>`;
      }).join("")
    : emptyRow(3, "No categories yet.");
}

function renderOrders() {
  $("orderList").innerHTML = state.orders.length
    ? state.orders.map(o => {
        const opts = ORDER_STATUSES.map(s => `<option value="${s}" ${o.status === s ? "selected" : ""}>${s}</option>`).join("");
        let pay = "";
        if (o.payment === "paid") {
          pay = btn("paymentSet", o.id, "Refund", 'data-payment="refunded"');
        } else if (o.payment === "pending") {
          pay = btn("paymentSet", o.id, "Mark paid", 'data-payment="paid"', "good");
        }
        return `<tr>
          <td>${esc(o.id)}</td>
          <td>${esc(o.customer)}</td>
          <td>${esc(vendorName(o.vendorId))}</td>
          <td>${money(o.amount)}</td>
          <td><select class="select" data-change="orderStatus" data-id="${esc(o.id)}" aria-label="Order status">${opts}</select></td>
          <td>${tag(o.payment)}</td>
          <td class="row-actions">${pay}</td>
        </tr>`;
      }).join("")
    : emptyRow(7, "No orders yet.");
}

function renderCommission() {
  $("commissionList").innerHTML = state.vendors.length
    ? state.vendors.map(v => {
        const custom = v.rate !== null && v.rate !== undefined && v.rate !== "" ? v.rate : "";
        return `<tr>
          <td>${esc(v.store)}</td>
          <td>
            <input class="cell-input" type="number" min="0" max="100" step="0.1" value="${esc(custom)}" placeholder="${esc(state.commission)}"
              data-change="vendorRate" data-id="${esc(v.id)}" aria-label="Commission rate for ${esc(v.store)}">
          </td>
          <td>${money(vendorPaid(v.id))}</td>
          <td>${money(commissionOf(v))}</td>
        </tr>`;
      }).join("")
    : emptyRow(4, "No vendors yet.");
}

function renderCoupons() {
  $("couponList").innerHTML = state.coupons.length
    ? state.coupons.map(c => `<tr>
        <td>${esc(c.code)}</td>
        <td>${esc(c.discount)}%</td>
        <td>${tag(c.active ? "active" : "inactive")}</td>
        <td class="row-actions">
          ${btn("couponToggle", c.id, c.active ? "Disable" : "Enable", "", c.active ? "" : "good")}
          ${btn("couponDelete", c.id, "Remove")}
        </td>
      </tr>`).join("")
    : emptyRow(4, "No coupons yet.");
}

function renderReports() {
  const revenue = sum(paidOrders());
  const earned = state.vendors.reduce((s, v) => s + commissionOf(v), 0);
  const avg = paidOrders().length ? revenue / paidOrders().length : 0;
  const cards = [
    ["Total revenue", money(revenue)],
    ["Commission earned", money(earned)],
    ["Orders", state.orders.length],
    ["Avg. paid order", money(avg)]
  ];
  $("reportCards").innerHTML = cards.map(c => `<div class="card"><h3>${esc(c[0])}</h3><p>${esc(c[1])}</p></div>`).join("");

  const total = state.orders.length;
  $("statusBars").innerHTML = total
    ? ORDER_STATUSES.map(s => {
        const n = state.orders.filter(o => o.status === s).length;
        const pct = Math.round((n / total) * 100);
        return `<div class="bar-row"><span class="bar-label">${s}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-val">${n}</span></div>`;
      }).join("")
    : '<div class="empty">No orders to report on yet.</div>';

  const rows = state.vendors
    .map(v => ({ v, sales: vendorPaid(v.id), count: state.orders.filter(o => o.vendorId === v.id).length }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  $("topVendors").innerHTML = rows.length
    ? rows.map(r => `<tr><td>${esc(r.v.store)}</td><td>${r.count}</td><td>${money(r.sales)}</td></tr>`).join("")
    : emptyRow(3, "No vendors yet.");
}

function renderReviews() {
  $("reviewList").innerHTML = state.reviews.length
    ? state.reviews.map(r => `<tr>
        <td>${esc(r.type)}</td>
        <td>${esc(r.from)}</td>
        <td>${esc(vendorName(r.vendorId))}</td>
        <td class="msg">${esc(r.text)}</td>
        <td>${tag(r.status)}</td>
        <td class="row-actions">
          ${r.status === "open" ? btn("reviewStatus", r.id, "Resolve", 'data-status="resolved"', "good") : ""}
          ${r.status !== "removed" ? btn("reviewStatus", r.id, "Remove", 'data-status="removed"') : btn("reviewStatus", r.id, "Restore", 'data-status="open"', "good")}
        </td>
      </tr>`).join("")
    : emptyRow(6, "No reviews or complaints.");
}

function renderAnnouncements() {
  $("annPanel").innerHTML = state.announcements.length
    ? state.announcements.map(a => {
        const d = new Date(a.date);
        const when = isNaN(d) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        return `<div class="notif-item">
          <div class="notif-dot"></div>
          <div class="grow">
            <div><strong>${esc(a.title)}</strong></div>
            <div>${esc(a.message)}</div>
            <div class="notif-time">To ${esc(a.audience)} · ${esc(when)}</div>
          </div>
          <div class="row-actions">${btn("annDelete", a.id, "Delete")}</div>
        </div>`;
      }).join("")
    : '<div class="empty">No announcements yet.</div>';
}

function renderRoles() {
  const head = `<thead><tr><th>Permission</th>${state.roles.map(r =>
    `<th>${esc(r.name)} ${r.locked ? "" : btn("roleDelete", r.id, "✕", 'title="Delete role" aria-label="Delete role ' + esc(r.name) + '"')}</th>`
  ).join("")}</tr></thead>`;

  const body = `<tbody>${PERMS.map(p => `<tr>
    <td>${esc(p)}</td>
    ${state.roles.map(r => `<td>
      <input type="checkbox" data-change="perm" data-id="${esc(r.id)}" data-perm="${esc(p)}"
        ${r.perms.includes(p) ? "checked" : ""} ${r.locked ? "disabled" : ""} aria-label="${esc(r.name)}: ${esc(p)}">
    </td>`).join("")}
  </tr>`).join("")}</tbody>`;

  $("roleTable").innerHTML = head + body;
}

function loadSettings() {
  const s = state.settings || {};
  if ($("st-name")) $("st-name").value = s.name || "";
  if ($("st-email")) $("st-email").value = s.email || "";
  if ($("st-vreg")) $("st-vreg").value = s.vreg || "open";
  if ($("st-maint")) $("st-maint").value = s.maint || "off";
  if ($("defaultRate")) $("defaultRate").value = state.commission || 10;
}

function renderAll() {
  renderDashboard();
  renderUsers();
  renderVendors();
  renderProducts();
  renderOrders();
  renderCommission();
  renderCoupons();
  renderReports();
  renderReviews();
  renderAnnouncements();
  renderRoles();
}

function update(msg) {
  persist();
  renderAll();
  if (msg) toast(msg);
}

// -------------------------------------------------------------
// BACKEND SYNCHRONIZATION
// -------------------------------------------------------------
async function syncWithBackend() {
  const res = await apiCall("/state");
  if (res && res.success && res.state) {
    state = Object.assign(state, res.state);
    persist();
    renderAll();
    loadSettings();
    updateConnectionIndicator(true);
  } else {
    updateConnectionIndicator(false);
  }
}

// -------------------------------------------------------------
// USER ACTIONS (WITH ASYNC API INTEGRATION)
// -------------------------------------------------------------
const actions = {
  go: d => showPage(d.id),
  toggleForm: d => {
    const f = $(d.id);
    if (f) f.classList.toggle("open");
  },
  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("jwtToken");
    toast("You have been logged out.");
    setTimeout(() => {
      if (window.location.pathname.includes("/admin")) {
        window.location.href = "../login.html";
      }
    }, 1200);
  },

  userStatus: async d => {
    const u = state.users.find(x => x.id === d.id);
    if (!u) return;
    const old = u.status;
    u.status = d.status;
    update(d.status === "active" ? "User activated." : "User suspended.");

    const res = await apiCall(`/users/${d.id}/status`, "PUT", { status: d.status });
    if (!res || !res.success) {
      u.status = old;
      update("Sync failed, rolled back.");
    }
  },

  userDelete: async d => {
    const u = state.users.find(x => x.id === d.id);
    if (!u) return;
    if (u.role === "Super Admin") {
      toast("Super Admin accounts cannot be deleted.");
      return;
    }
    if (!confirm("Delete " + (u.name || u.email) + "? This cannot be undone.")) return;

    state.users = state.users.filter(x => x.id !== d.id);
    update("User deleted.");

    await apiCall(`/users/${d.id}`, "DELETE");
  },

  vendorStatus: async d => {
    const v = findVendor(d.id);
    if (!v) return;
    v.status = d.status;
    const msg = { approved: "Vendor approved.", rejected: "Vendor rejected.", suspended: "Vendor suspended." }[d.status] || "Vendor updated.";
    update(msg);

    await apiCall(`/vendors/${d.id}/status`, "PUT", { status: d.status });
  },

  productStatus: async d => {
    const p = state.products.find(x => x.id === d.id);
    if (!p) return;
    if (d.status === "published" && p.vendorId) {
      const v = findVendor(p.vendorId);
      if (v && v.status !== "approved") {
        toast("Approve the vendor before publishing their products.");
        return;
      }
    }
    p.status = d.status;
    update(d.status === "published" ? "Product published." : "Product unpublished.");

    await apiCall(`/products/${d.id}/status`, "PUT", { status: d.status });
  },

  productDelete: async d => {
    if (!confirm("Remove this product?")) return;
    state.products = state.products.filter(x => x.id !== d.id);
    update("Product removed.");

    await apiCall(`/products/${d.id}`, "DELETE");
  },

  addCategory: async () => {
    const name = $("c-name").value.trim();
    if (!name) {
      toast("Enter a category name.");
      return;
    }
    if (state.categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      toast("That category already exists.");
      return;
    }
    state.categories.push(name);
    $("c-name").value = "";
    $("categoryForm").classList.remove("open");
    update("Category added.");

    await apiCall("/categories", "POST", { name });
  },

  categoryDelete: async d => {
    const catName = d.id;
    if (!catName) return;
    if (state.products.some(p => p.category === catName)) {
      toast("Move or remove products in this category first.");
      return;
    }
    state.categories = state.categories.filter(c => c !== catName);
    update("Category removed.");

    await apiCall(`/categories/${encodeURIComponent(catName)}`, "DELETE");
  },

  paymentSet: async d => {
    const o = state.orders.find(x => x.id === d.id);
    if (!o) return;
    o.payment = d.payment;
    update(d.payment === "refunded" ? "Payment refunded." : "Payment marked as paid.");

    await apiCall(`/orders/${d.id}/payment`, "PUT", { payment: d.payment });
  },

  saveCommission: async () => {
    const n = parseFloat($("defaultRate").value);
    if (isNaN(n) || n < 0 || n > 100) {
      toast("Enter a rate between 0 and 100.");
      return;
    }
    state.commission = n;
    update("Commission rate saved.");

    await apiCall("/commission/default", "PUT", { rate: n });
  },

  addCoupon: async () => {
    const code = $("cp-code").value.trim().toUpperCase().replace(/\s+/g, "");
    const discount = parseFloat($("cp-discount").value);
    if (!code || isNaN(discount)) {
      toast("Fill in all coupon fields.");
      return;
    }
    if (discount < 1 || discount > 100) {
      toast("Discount must be between 1 and 100.");
      return;
    }
    if (state.coupons.some(c => c.code === code)) {
      toast("That coupon code already exists.");
      return;
    }
    const newCoupon = { id: uid(), code, discount, active: true };
    state.coupons.push(newCoupon);
    $("cp-code").value = "";
    $("cp-discount").value = "";
    $("couponForm").classList.remove("open");
    update("Coupon added.");

    await apiCall("/coupons", "POST", { code, discount });
  },

  couponToggle: async d => {
    const c = state.coupons.find(x => x.id === d.id);
    if (!c) return;
    c.active = !c.active;
    update(c.active ? "Coupon enabled." : "Coupon disabled.");

    await apiCall(`/coupons/${d.id}/toggle`, "PUT");
  },

  couponDelete: async d => {
    state.coupons = state.coupons.filter(x => x.id !== d.id);
    update("Coupon removed.");

    await apiCall(`/coupons/${d.id}`, "DELETE");
  },

  reviewStatus: async d => {
    const r = state.reviews.find(x => x.id === d.id);
    if (!r) return;
    r.status = d.status;
    update("Review updated.");

    await apiCall(`/reviews/${d.id}/status`, "PUT", { status: d.status });
  },

  addAnnouncement: async () => {
    const title = $("an-title").value.trim();
    const message = $("an-msg").value.trim();
    const audience = $("an-aud").value;
    if (!title || !message) {
      toast("Add a title and a message.");
      return;
    }
    const newAnn = { id: uid(), title, message, audience, date: new Date().toISOString() };
    state.announcements.unshift(newAnn);
    $("an-title").value = "";
    $("an-msg").value = "";
    $("annForm").classList.remove("open");
    update("Announcement sent.");

    await apiCall("/announcements", "POST", { title, message, audience });
  },

  annDelete: async d => {
    state.announcements = state.announcements.filter(x => x.id !== d.id);
    update("Announcement deleted.");

    await apiCall(`/announcements/${d.id}`, "DELETE");
  },

  saveSettings: async () => {
    const name = $("st-name").value.trim();
    const email = $("st-email").value.trim();
    if (!name) {
      toast("Enter a site name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Enter a valid support email.");
      return;
    }
    const newSettings = {
      name,
      email,
      vreg: $("st-vreg").value,
      maint: $("st-maint").value
    };
    state.settings = newSettings;
    update("Settings saved.");

    await apiCall("/settings", "PUT", newSettings);
  },

  addRole: async () => {
    const name = $("r-name").value.trim();
    if (!name) {
      toast("Enter a role name.");
      return;
    }
    if (state.roles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      toast("That role already exists.");
      return;
    }
    const newRole = { id: uid(), name, locked: false, perms: [] };
    state.roles.push(newRole);
    $("r-name").value = "";
    $("roleForm").classList.remove("open");
    update("Role added.");

    await apiCall("/roles", "POST", { name });
  },

  roleDelete: async d => {
    const r = state.roles.find(x => x.id === d.id);
    if (!r || r.locked) return;
    if (!confirm("Delete the " + r.name + " role?")) return;
    state.roles = state.roles.filter(x => x.id !== d.id);
    update("Role deleted.");

    await apiCall(`/roles/${d.id}`, "DELETE");
  }
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el.dataset);
});

// -------------------------------------------------------------
// CHANGE LISTENERS (DROPDOWNS, INPUTS, CHECKBOXES)
// -------------------------------------------------------------
const changes = {
  vendorFilter: () => renderVendors(),

  orderStatus: async (d, el) => {
    const o = state.orders.find(x => x.id === d.id);
    if (o && ORDER_STATUSES.includes(el.value)) {
      o.status = el.value;
      update("Order status updated.");
      await apiCall(`/orders/${d.id}/status`, "PUT", { status: el.value });
    }
  },

  vendorRate: async (d, el) => {
    const v = findVendor(d.id);
    if (!v) return;
    if (el.value.trim() === "") {
      v.rate = null;
      update("Vendor rate reset to default.");
      await apiCall(`/vendors/${d.id}/rate`, "PUT", { rate: null });
      return;
    }
    const n = parseFloat(el.value);
    if (isNaN(n) || n < 0 || n > 100) {
      toast("Enter a rate between 0 and 100.");
      renderCommission();
      return;
    }
    v.rate = n;
    update("Vendor rate saved.");
    await apiCall(`/vendors/${d.id}/rate`, "PUT", { rate: n });
  },

  perm: async (d, el) => {
    const r = state.roles.find(x => x.id === d.id);
    if (!r || r.locked) return;
    r.perms = r.perms.filter(p => p !== d.perm);
    if (el.checked) r.perms.push(d.perm);
    persist();
    toast("Permissions updated.");

    await apiCall(`/roles/${d.id}/permissions`, "PUT", { perm: d.perm, enabled: el.checked });
  }
};

document.addEventListener("change", e => {
  const el = e.target.closest("[data-change]");
  if (!el) return;
  const fn = changes[el.dataset.change];
  if (fn) fn(el.dataset, el);
});

// Initial boot & sync
renderAll();
loadSettings();
syncWithBackend();
