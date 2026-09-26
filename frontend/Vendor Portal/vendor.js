const NAV = [
  ["dashboard","Dashboard"],["products","Products"],["categories","Categories"],
  ["inventory","Inventory"],["orders","Orders"],["sales","Sales & Revenue"],
  ["promotions","Promotions & Discounts"],["profile","Store Management"],["notifications","Notifications"]
];
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
const orders = [
  {id:'#1042', customer:'C. Cordero', amount:840, status:'pending'},
  {id:'#1041', customer:'S. Sau', amount:1520, status:'paid'},
  {id:'#1040', customer:'D. Default', amount:390, status:'paid'},
];
const notifications = [
  {text:'Your promotion "Weekend Sale" ends in 2 days.', time:'2h ago'},
  {text:'Order #1042 is awaiting confirmation.', time:'5h ago'},
  {text:'Product "Iced Coffee 350ml" is low on stock.', time:'1d ago'},
];

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'), 2200);
}

function renderProducts(){
  const el=document.getElementById('productList');
  if(!products.length){ el.innerHTML='<tr><td colspan="4" class="empty">No products yet. Add your first one above.</td></tr>'; }
  else{
    el.innerHTML = products.map((p,i)=>`<tr><td>${p.name}</td><td>${Number(p.price).toFixed(2)}</td><td>${p.stock}</td>
      <td class="row-actions"><button onclick="removeProduct(${i})">Remove</button></td></tr>`).join('');
  }
  document.getElementById('statProducts').textContent = products.length;
}
function addProduct(){
  const name=document.getElementById('p-name').value.trim();
  const price=document.getElementById('p-price').value;
  const stock=document.getElementById('p-stock').value;
  if(!name||!price||!stock){ toast('Fill in all product fields.'); return; }
  products.push({name, price, stock}); save('vp_products', products);
  document.getElementById('p-name').value='';document.getElementById('p-price').value='';document.getElementById('p-stock').value='';
  toggleForm('productForm'); renderProducts(); toast('Product added.');
}
function removeProduct(i){ products.splice(i,1); save('vp_products', products); renderProducts(); toast('Product removed.'); }

function renderCategories(){
  const el=document.getElementById('categoryList');
  if(!categories.length){ el.innerHTML='<tr><td colspan="3" class="empty">No categories yet.</td></tr>'; return; }
  el.innerHTML = categories.map((c,i)=>{
    return `<tr><td>${c}</td><td>0</td><td class="row-actions"><button onclick="removeCategory(${i})">Remove</button></td></tr>`;
  }).join('');
}
function addCategory(){
  const name=document.getElementById('c-name').value.trim();
  if(!name){ toast('Enter a category name.'); return; }
  categories.push(name); save('vp_categories', categories);
  document.getElementById('c-name').value='';
  toggleForm('categoryForm'); renderCategories(); toast('Category added.');
}
function removeCategory(i){ categories.splice(i,1); save('vp_categories', categories); renderCategories(); toast('Category removed.'); }

function renderPromos(){
  const el=document.getElementById('promoList');
  if(!promos.length){ el.innerHTML='<tr><td colspan="3" class="empty">No promotions running.</td></tr>'; return; }
  el.innerHTML = promos.map((pr,i)=>`<tr><td>${pr.name}</td><td>${pr.discount}%</td>
    <td class="row-actions"><button onclick="removePromo(${i})">Remove</button></td></tr>`).join('');
}
function addPromotion(){
  const name=document.getElementById('promo-name').value.trim();
  const discount=document.getElementById('promo-discount').value;
  if(!name||!discount){ toast('Fill in all promotion fields.'); return; }
  promos.push({name, discount}); save('vp_promos', promos);
  document.getElementById('promo-name').value='';document.getElementById('promo-discount').value='';
  toggleForm('promoForm'); renderPromos(); toast('Promotion added.');
}
function removePromo(i){ promos.splice(i,1); save('vp_promos', promos); renderPromos(); toast('Promotion removed.'); }

function renderInventory(){
  const el=document.getElementById('inventoryList');
  if(!products.length){ el.innerHTML='<tr><td colspan="3" class="empty">Add products to see stock levels here.</td></tr>'; return; }
  el.innerHTML = products.map(p=>{
    const low = Number(p.stock) <= 5;
    return `<tr><td>${p.name}</td><td>${p.stock}</td><td><span class="tag ${low?'low':'ok'}">${low?'Low stock':'In stock'}</span></td></tr>`;
  }).join('');
}

function renderOrders(){
  const el=document.getElementById('orderList');
  el.innerHTML = orders.map(o=>`<tr><td>${o.id}</td><td>${o.customer}</td><td>${o.amount.toFixed(2)}</td>
    <td><span class="tag ${o.status}">${o.status}</span></td></tr>`).join('');
  document.getElementById('statOrders').textContent = orders.filter(o=>o.status==='pending').length;
  const total = orders.filter(o=>o.status==='paid').reduce((s,o)=>s+o.amount,0);
  document.getElementById('statSales').textContent = ''+total.toFixed(2);
}

function renderNotifications(){
  const el=document.getElementById('notifPanel');
  el.innerHTML = notifications.map(n=>`<div class="notif-item"><div class="notif-dot"></div>
    <div><div>${n.text}</div><div class="notif-time">${n.time}</div></div></div>`).join('');
  document.getElementById('statNotifs').textContent = notifications.length;
}

function saveProfile(){
  const data = {
    store: document.getElementById('pr-store').value,
    email: document.getElementById('pr-email').value,
    phone: document.getElementById('pr-phone').value,
    address: document.getElementById('pr-address').value,
    desc: document.getElementById('pr-desc').value,
  };
  save('vp_profile', data);
  toast('Profile saved.');
}
function loadProfile(){
  const d = load('vp_profile', null);
  if(!d) return;
  document.getElementById('pr-store').value = d.store||'';
  document.getElementById('pr-email').value = d.email||'';
  document.getElementById('pr-phone').value = d.phone||'';
  document.getElementById('pr-address').value = d.address||'';
  document.getElementById('pr-desc').value = d.desc||'';
}

function logout(){ toast('You have been logged out.'); }

renderProducts(); renderCategories(); renderPromos(); renderOrders(); renderNotifications(); loadProfile();
