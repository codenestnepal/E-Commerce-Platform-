const NAV = [
  ["dashboard","Dashboard"],["products","Products"],["categories","Categories"],
  ["inventory","Inventory"],["orders","Orders"],["sales","Sales & Revenue"],
  ["promotions","Promotions & Discounts"],["profile","Store Management"],["notifications","Notifications"]
];

const API_BASE = "http://localhost:8000/api/v1/vendor";

function getAuthToken() {
  return localStorage.getItem("vendorToken") || localStorage.getItem("jwtToken") || "";
}

async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { credentials: "omit", ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Backend Offline/Unreachable at ${endpoint}]`, err.message);
    return null;
  }
}

const navEl = document.getElementById('nav');
NAV.forEach(([id,label])=>{
  const b=document.createElement('button');
  b.className='nav-btn'+(id==='dashboard'?' active':'');
  b.id='nav-'+id;
  b.innerHTML=`<span class="dot"></span><span class="label">${label}</span>`;
  b.onclick=()=>showPage(id);
  navEl.appendChild(b);
});

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('nav-'+id).classList.add('active');
  if(id==='inventory') renderInventory();
  if(id==='sales') loadSalesMetrics();
}

function toggleForm(id){
  document.getElementById(id).classList.toggle('open');
}

function load(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function save(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){}
}

let products = load('vp_products', []);
let categories = load('vp_categories', []);
let promos = load('vp_promos', []);
let orders = [
  {id:'#1042', customer:'C. Cordero', amount:840, status:'pending'},
  {id:'#1041', customer:'S. Sau', amount:1520, status:'paid'},
  {id:'#1040', customer:'D. Default', amount:390, status:'paid'},
];
let notifications = [
  {text:'Your promotion "Weekend Sale" ends in 2 days.', time:'2h ago'},
  {text:'Order #1042 is awaiting confirmation.', time:'5h ago'},
  {text:'Product "Iced Coffee 350ml" is low on stock.', time:'1d ago'},
];

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'), 2200);
}

// ---------------- PRODUCTS ----------------
async function loadProducts() {
  const data = await apiFetch("/products");
  if (data && data.success && Array.isArray(data.products)) {
    products = data.products.map(p => ({
      _id: p._id,
      name: p.name,
      price: p.price,
      stock: p.stock
    }));
    save('vp_products', products);
  }
  renderProducts();
}

function renderProducts(){
  const el=document.getElementById('productList');
  if(!products.length){ el.innerHTML='<tr><td colspan="4" class="empty">No products yet. Add your first one above.</td></tr>'; }
  else{
    el.innerHTML = products.map((p,i)=>`<tr><td>${p.name}</td><td>${Number(p.price).toFixed(2)}</td><td>${p.stock}</td>
      <td class="row-actions"><button onclick="removeProduct('${p._id || i}', ${i})">Remove</button></td></tr>`).join('');
  }
  document.getElementById('statProducts').textContent = products.length;
}

async function addProduct(){
  const name=document.getElementById('p-name').value.trim();
  const price=document.getElementById('p-price').value;
  const stock=document.getElementById('p-stock').value;
  if(!name||!price||!stock){ toast('Fill in all product fields.'); return; }

  const res = await apiFetch("/products", {
    method: "POST",
    body: JSON.stringify({ name, price: Number(price), stock: Number(stock) })
  });

  if (res && res.success) {
    toast('Product added to backend.');
    await loadProducts();
    await loadDashboardStats();
  } else {
    // Fallback to local storage
    products.push({name, price, stock});
    save('vp_products', products);
    renderProducts();
    toast('Product saved (offline mode).');
  }

  document.getElementById('p-name').value='';
  document.getElementById('p-price').value='';
  document.getElementById('p-stock').value='';
  toggleForm('productForm');
}

async function removeProduct(idOrIndex, index){
  if (typeof idOrIndex === 'string' && idOrIndex.length > 5) {
    const res = await apiFetch(`/products/${idOrIndex}`, { method: "DELETE" });
    if (res && res.success) {
      toast('Product removed from backend.');
      await loadProducts();
      await loadDashboardStats();
      return;
    }
  }
  products.splice(index, 1);
  save('vp_products', products);
  renderProducts();
  toast('Product removed.');
}

// ---------------- CATEGORIES ----------------
async function loadCategories() {
  const data = await apiFetch("/categories");
  if (data && data.success && Array.isArray(data.categories)) {
    categories = data.categories.map(c => ({
      _id: c.id,
      name: c.name,
      productCount: c.productCount || 0
    }));
    save('vp_categories', categories);
  }
  renderCategories();
}

function renderCategories(){
  const el=document.getElementById('categoryList');
  if(!categories.length){ el.innerHTML='<tr><td colspan="3" class="empty">No categories yet.</td></tr>'; return; }
  el.innerHTML = categories.map((c,i)=>{
    const name = typeof c === 'object' ? c.name : c;
    const count = typeof c === 'object' ? (c.productCount || 0) : 0;
    return `<tr><td>${name}</td><td>${count}</td><td class="row-actions"><button onclick="removeCategory(${i})">Remove</button></td></tr>`;
  }).join('');
}

async function addCategory(){
  const name=document.getElementById('c-name').value.trim();
  if(!name){ toast('Enter a category name.'); return; }

  const res = await apiFetch("/categories", {
    method: "POST",
    body: JSON.stringify({ name })
  });

  if (res && res.success) {
    toast('Category saved to backend.');
    await loadCategories();
  } else {
    categories.push(name);
    save('vp_categories', categories);
    renderCategories();
    toast('Category added.');
  }

  document.getElementById('c-name').value='';
  toggleForm('categoryForm');
}

function removeCategory(i){
  categories.splice(i,1);
  save('vp_categories', categories);
  renderCategories();
  toast('Category removed.');
}

// ---------------- PROMOTIONS ----------------
async function loadPromotions() {
  const data = await apiFetch("/promotions");
  if (data && data.success && Array.isArray(data.promotions)) {
    promos = data.promotions.map(pr => ({
      _id: pr._id,
      name: pr.name,
      discount: pr.discountPercentage
    }));
    save('vp_promos', promos);
  }
  renderPromos();
}

function renderPromos(){
  const el=document.getElementById('promoList');
  if(!promos.length){ el.innerHTML='<tr><td colspan="3" class="empty">No promotions running.</td></tr>'; return; }
  el.innerHTML = promos.map((pr,i)=>`<tr><td>${pr.name}</td><td>${pr.discount}%</td>
    <td class="row-actions"><button onclick="removePromo('${pr._id || i}', ${i})">Remove</button></td></tr>`).join('');
}

async function addPromotion(){
  const name=document.getElementById('promo-name').value.trim();
  const discount=document.getElementById('promo-discount').value;
  if(!name||!discount){ toast('Fill in all promotion fields.'); return; }

  const res = await apiFetch("/promotions", {
    method: "POST",
    body: JSON.stringify({ name, discountPercentage: Number(discount) })
  });

  if (res && res.success) {
    toast('Promotion created in backend.');
    await loadPromotions();
  } else {
    promos.push({name, discount});
    save('vp_promos', promos);
    renderPromos();
    toast('Promotion added.');
  }

  document.getElementById('promo-name').value='';
  document.getElementById('promo-discount').value='';
  toggleForm('promoForm');
}

async function removePromo(idOrIndex, index){
  if (typeof idOrIndex === 'string' && idOrIndex.length > 5) {
    const res = await apiFetch(`/promotions/${idOrIndex}`, { method: "DELETE" });
    if (res && res.success) {
      toast('Promotion removed.');
      await loadPromotions();
      return;
    }
  }
  promos.splice(index,1);
  save('vp_promos', promos);
  renderPromos();
  toast('Promotion removed.');
}

// ---------------- INVENTORY ----------------
async function renderInventory(){
  const el=document.getElementById('inventoryList');
  const data = await apiFetch("/inventory");

  let list = [];
  if (data && data.success && Array.isArray(data.inventory)) {
    list = data.inventory;
  } else {
    list = products.map(p => ({
      name: p.name,
      stock: p.stock,
      isLow: Number(p.stock) <= 5
    }));
  }

  if(!list.length){ el.innerHTML='<tr><td colspan="3" class="empty">Add products to see stock levels here.</td></tr>'; return; }
  el.innerHTML = list.map(p=>{
    const low = p.isLow !== undefined ? p.isLow : (Number(p.stock) <= 5);
    return `<tr><td>${p.name}</td><td>${p.stock}</td><td><span class="tag ${low?'low':'ok'}">${low?'Low stock':'In stock'}</span></td></tr>`;
  }).join('');
}

// ---------------- ORDERS ----------------
async function loadOrders() {
  const data = await apiFetch("/orders");
  if (data && data.success && Array.isArray(data.orders)) {
    orders = data.orders;
  }
  renderOrders();
}

function renderOrders(){
  const el=document.getElementById('orderList');
  el.innerHTML = orders.map(o=>`<tr><td>${o.id}</td><td>${o.customer}</td><td>${Number(o.amount).toFixed(2)}</td>
    <td><span class="tag ${o.status}">${o.status}</span></td></tr>`).join('');
  document.getElementById('statOrders').textContent = orders.filter(o=>o.status==='pending').length;
  const total = orders.filter(o=>o.status==='paid'||o.status==='delivered').reduce((s,o)=>s+Number(o.amount),0);
  document.getElementById('statSales').textContent = ''+total.toFixed(2);
}

// ---------------- DASHBOARD & SALES ----------------
async function loadDashboardStats() {
  const data = await apiFetch("/dashboard/stats");
  if (data && data.success && data.stats) {
    document.getElementById('statProducts').textContent = data.stats.totalProducts;
    document.getElementById('statOrders').textContent = data.stats.pendingOrders;
    document.getElementById('statSales').textContent = Number(data.stats.totalSales).toFixed(2);
    document.getElementById('statNotifs').textContent = data.stats.notifications;
  }
}

async function loadSalesMetrics() {
  const data = await apiFetch("/sales/metrics");
  if (data && data.success && data.metrics) {
    const cards = document.querySelectorAll("#sales .cards .card p");
    if (cards.length >= 3) {
      cards[0].textContent = Number(data.metrics.thisWeek).toFixed(2);
      cards[1].textContent = Number(data.metrics.thisMonth).toFixed(2);
      cards[2].textContent = Number(data.metrics.avgOrderValue).toFixed(2);
    }
  }
}

// ---------------- NOTIFICATIONS ----------------
async function loadNotifications() {
  const data = await apiFetch("/notifications");
  if (data && data.success && Array.isArray(data.notifications)) {
    notifications = data.notifications;
  }
  renderNotifications();
}

function renderNotifications(){
  const el=document.getElementById('notifPanel');
  el.innerHTML = notifications.map(n=>`<div class="notif-item"><div class="notif-dot"></div>
    <div><div>${n.text}</div><div class="notif-time">${n.time}</div></div></div>`).join('');
  document.getElementById('statNotifs').textContent = notifications.length;
}

// ---------------- STORE PROFILE ----------------
async function saveProfile(){
  const data = {
    storeName: document.getElementById('pr-store').value,
    contactEmail: document.getElementById('pr-email').value,
    phone: document.getElementById('pr-phone').value,
    address: document.getElementById('pr-address').value,
    description: document.getElementById('pr-desc').value,
  };

  const res = await apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(data)
  });

  if (res && res.success) {
    toast('Profile saved to backend.');
  } else {
    save('vp_profile', data);
    toast('Profile saved (offline mode).');
  }
}

async function loadProfile(){
  const res = await apiFetch("/profile");
  if (res && res.success && res.profile) {
    const d = res.profile;
    document.getElementById('pr-store').value = d.storeName || '';
    document.getElementById('pr-email').value = d.contactEmail || '';
    document.getElementById('pr-phone').value = d.phone || '';
    document.getElementById('pr-address').value = d.address || '';
    document.getElementById('pr-desc').value = d.description || '';
    return;
  }

  const d = load('vp_profile', null);
  if(!d) return;
  document.getElementById('pr-store').value = d.storeName || d.store || '';
  document.getElementById('pr-email').value = d.contactEmail || d.email || '';
  document.getElementById('pr-phone').value = d.phone || '';
  document.getElementById('pr-address').value = d.address || '';
  document.getElementById('pr-desc').value = d.description || d.desc || '';
}

function logout(){
  localStorage.removeItem("vendorToken");
  toast('You have been logged out.');
}

// Initialize all sections
async function init() {
  await Promise.allSettled([
    loadProducts(),
    loadCategories(),
    loadPromotions(),
    loadOrders(),
    loadNotifications(),
    loadProfile(),
    loadDashboardStats(),
    loadSalesMetrics()
  ]);
}

init();
