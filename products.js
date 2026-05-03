/* ============================================================
   PEMBE FLOUR MILLERS — products.js
   Now connected to Firebase for live stock levels
   ============================================================ */

import { loadStock } from './firebase.js';

/* ---- PRODUCT DATA ---- */
const products = [
  {
    id: 1, name: "Pembe Premium Wheat Flour",
    category: "wheat", image: "images/pembe-2kgwheat.png", bg: "wheat",
    description: "Fine-milled premium wheat flour, perfect for chapati, bread & pastries.",
    badge: "Best Seller",
    sizes: [
      { label: "500g", price: 45 }, { label: "1kg", price: 85 },
      { label: "2kg", price: 160 }, { label: "5kg", price: 390 }
    ]
  },
  {
    id: 2, name: "Pembe Maize Flour",
    category: "maize", image: "images/pembe-2kgmaize.png", bg: "maize",
    description: "Smooth, well-sifted unga for perfect ugali every time.",
    badge: "Popular",
    sizes: [
      { label: "1kg", price: 75 }, { label: "2kg", price: 140 },
      { label: "5kg", price: 340 }, { label: "10kg", price: 660 }
    ]
  },
  {
    id: 3, name: "Whole Wheat Flour",
    category: "wheat", image: "images/pembe-2kgwheat2.png", bg: "wheat",
    description: "Stone-ground whole wheat, retaining bran and germ for full nutrition.",
    badge: "Healthy",
    sizes: [
      { label: "1kg", price: 95 }, { label: "2kg", price: 180 },
      { label: "5kg", price: 430 }
    ]
  },
  {
    id: 4, name: "Semolina Flour",
    category: "wheat", image: "images/pembe-wimbi.png", bg: "wheat",
    description: "Coarse-ground durum wheat, ideal for pasta, porridge & traditional recipes.",
    badge: "",
    sizes: [
      { label: "500g", price: 65 }, { label: "1kg", price: 120 },
      { label: "2kg", price: 230 }
    ]
  },
  {
    id: 5, name: "Chick Starter Feed",
    category: "feed", image: "images/pembe-startermash.png", bg: "feed",
    description: "Nutrient-rich starter crumble for chicks aged 0–8 weeks.",
    badge: "New",
    sizes: [
      { label: "5kg bag", price: 550 }, { label: "10kg bag", price: 1050 },
      { label: "25kg bag", price: 2550 }
    ]
  },
  {
    id: 6, name: "Layer Chicken Feed",
    category: "feed", image: "images/pembe-chickenfeeds.png", bg: "feed",
    description: "Balanced mash formula for laying hens — boosts egg production.",
    badge: "",
    sizes: [
      { label: "5kg bag", price: 520 }, { label: "10kg bag", price: 990 },
      { label: "25kg bag", price: 2400 }
    ]
  },
  {
    id: 7, name: "Grower Feed",
    category: "feed", image: "images/pembe-chickenfeeds2.png", bg: "feed",
    description: "High-protein pellets for broilers and pullets aged 8–20 weeks.",
    badge: "",
    sizes: [
      { label: "5kg bag", price: 510 }, { label: "10kg bag", price: 970 },
      { label: "25kg bag", price: 2350 }
    ]
  },
  {
    id: 8, name: "Wheat Bran",
    category: "bran", image: "images/wheatbran.png", bg: "bran",
    description: "High-fibre bran, great as livestock supplement or for whole grain baking.",
    badge: "",
    sizes: [
      { label: "1kg", price: 55 }, { label: "2kg", price: 100 },
      { label: "5kg", price: 240 }
    ]
  }
];

/* ---- STATE ---- */
let selectedSizes = {};
let quantities    = {};
let cart          = [];
let stockData     = {};  /* ← stores stock from Firebase */

products.forEach(function(p) {
  selectedSizes[p.id] = 0;
  quantities[p.id]    = 1;
});

/* ---- STOCK STATUS HELPER ---- */
/* Returns the stock status for a product */
function getStockStatus(productName) {
  const info = stockData[productName];
  if (!info) return { status: 'in-stock', label: 'In Stock', stock: 99 };
  if (info.stock === 0) return { status: 'out-of-stock', label: 'Out of Stock', stock: 0 };
  if (info.stock <= info.lowStockLimit) return { status: 'low-stock', label: 'Low Stock — ' + info.stock + ' left', stock: info.stock };
  return { status: 'in-stock', label: 'In Stock', stock: info.stock };
}

/* ---- SCROLL ANIMATION OBSERVER ---- */
const animationObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

function applyAnimations() {
  document.querySelectorAll(
    '.product-card, .feature-item, .review-card, .value-card, .stat-item, .contact-item'
  ).forEach(function(el) {
    if (!el.classList.contains('visible')) {
      el.classList.add('fade-in');
      animationObserver.observe(el);
    }
  });
}

/* ---- RENDER PRODUCTS ---- */
function renderProducts(list) {
  const countEl = document.getElementById('product-count');
  if (countEl) {
    countEl.textContent = 'Showing ' + list.length +
      ' product' + (list.length !== 1 ? 's' : '');
  }

  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = '<p style="color:#7A6A50;padding:20px;">No products found.</p>';
    return;
  }

  grid.innerHTML = list.map(function(p) {
    const szIdx  = selectedSizes[p.id] || 0;
    const price  = p.sizes[szIdx].price;
    const qty    = quantities[p.id] || 1;
    const stock  = getStockStatus(p.name);

    const sizeOptions = p.sizes.map(function(s, i) {
      return '<option value="' + i + '"' +
        (i === szIdx ? ' selected' : '') + '>' +
        s.label + ' — KSh ' + s.price.toLocaleString() +
        '</option>';
    }).join('');

    /* Stock badge color */
    const badgeColor =
      stock.status === 'out-of-stock' ? '#e24b4a' :
      stock.status === 'low-stock'    ? '#D4A017' : '#3B6D11';

    /* Disable button if out of stock */
    const btnDisabled = stock.status === 'out-of-stock' ?
      'disabled style="opacity:0.5;cursor:not-allowed;"' : '';
    const btnText = stock.status === 'out-of-stock' ?
      'Out of Stock' : 'Add to Cart';

    return `
      <div class="product-card" id="card-${p.id}">
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
        <div class="product-info">
          ${p.badge ? '<span class="product-badge">' + p.badge + '</span>' : ''}
          <span class="product-category">${getCategoryLabel(p.category)}</span>
          <h3>${p.name}</h3>
          <p>${p.description}</p>

          <!-- Stock status badge -->
          <span style="
            display:inline-block;
            font-size:11px;
            font-weight:700;
            padding:3px 10px;
            border-radius:20px;
            margin-bottom:10px;
            background:${badgeColor}22;
            color:${badgeColor};
            border:1px solid ${badgeColor}44;
          ">${stock.label}</span>

          <span class="product-price">KSh ${price.toLocaleString()}</span>
          <div class="qty-row">
            <span class="qty-label">Size:</span>
            <select class="size-select"
              onchange="changeSize(${p.id}, this.value)"
              ${stock.status === 'out-of-stock' ? 'disabled' : ''}>
              ${sizeOptions}
            </select>
          </div>
          <div class="qty-row">
            <span class="qty-label">Qty:</span>
            <div class="qty-ctrl">
              <button onclick="changeQty(${p.id}, -1)"
                ${stock.status === 'out-of-stock' ? 'disabled' : ''}>−</button>
              <span id="qty-${p.id}">${qty}</span>
              <button onclick="changeQty(${p.id}, +1)"
                ${stock.status === 'out-of-stock' ? 'disabled' : ''}>+</button>
            </div>
          </div>
          <button class="add-btn" id="btn-${p.id}"
            onclick="addToCart(${p.id})" ${btnDisabled}>
            ${btnText}
          </button>
        </div>
      </div>
    `;
  }).join('');

  applyAnimations();
}

function getCategoryLabel(cat) {
  if (cat === 'wheat') return 'Wheat Flour';
  if (cat === 'maize') return 'Maize Flour';
  if (cat === 'feed')  return 'Animal Feed';
  if (cat === 'bran')  return 'Bran & By-products';
  return cat;
}

/* ---- FILTER & SEARCH ---- */
function filterProducts() {
  const query    = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('filter-cat').value;
  const sortBy   = document.getElementById('filter-sort').value;

  let filtered = products.filter(function(p) {
    const matchSearch = !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    const matchCategory = !category || p.category === category;
    return matchSearch && matchCategory;
  });

  if (sortBy === 'price-asc') {
    filtered.sort(function(a, b) {
      return a.sizes[selectedSizes[a.id]||0].price -
             b.sizes[selectedSizes[b.id]||0].price;
    });
  } else if (sortBy === 'price-desc') {
    filtered.sort(function(a, b) {
      return b.sizes[selectedSizes[b.id]||0].price -
             a.sizes[selectedSizes[a.id]||0].price;
    });
  } else if (sortBy === 'name') {
    filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
  }

  renderProducts(filtered);
}

/* ---- SIZE & QUANTITY ---- */
function changeSize(id, value) {
  selectedSizes[id] = parseInt(value);
  filterProducts();
}

function changeQty(id, delta) {
  const product   = products.find(function(p) { return p.id === id; });
  const stockInfo = getStockStatus(product.name);
  const maxQty    = stockInfo.stock || 99;

  /* Never go below 1 or above available stock */
  quantities[id] = Math.min(
    maxQty,
    Math.max(1, (quantities[id] || 1) + delta)
  );

  const el = document.getElementById('qty-' + id);
  if (el) el.textContent = quantities[id];

  /* Warn the customer if they hit the limit */
  if (quantities[id] >= maxQty && delta > 0) {
    showToast('Maximum available stock is ' + maxQty + ' units');
  }
}

/* ---- CART ---- */
function addToCart(id) {
  const product = products.find(function(p) { return p.id === id; });
  const stock   = getStockStatus(product.name);
  const qty     = quantities[id] || 1;

  /* Block if out of stock */
  if (stock.status === 'out-of-stock') {
    showToast('Sorry — this product is out of stock!');
    return;
  }

  const szIdx = selectedSizes[id] || 0;
  const size  = product.sizes[szIdx];
  const qty   = quantities[id] || 1;
  const key   = id + '-' + szIdx;

  const existing = cart.find(function(c) { return c.key === key; });
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key, id,
      name:  product.name,
      image: product.image,
      size:  size.label,
      price: size.price,
      qty
    });
  }

  updateCartUI();

  const btn = document.getElementById('btn-' + id);
  if (btn) {
    btn.textContent = '✓ Added!';
    btn.classList.add('added');
    setTimeout(function() {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }, 1500);
  }

  showToast(qty + '× ' + product.name + ' (' + size.label + ') added!');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce(function(sum, item) {
    return sum + item.price * item.qty;
  }, 0);
  const count = cart.reduce(function(sum, item) {
    return sum + item.qty;
  }, 0);

  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = 'KSh ' + total.toLocaleString();

  const body = document.getElementById('cart-body');
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty">🛒<p>Your cart is empty</p></div>';
    return;
  }

  body.innerHTML = cart.map(function(item, index) {
    return `
      <div class="cart-item">
        <div class="cart-item-icon">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">${item.size} × ${item.qty}</div>
          <div class="cart-item-price">
            KSh ${(item.price * item.qty).toLocaleString()}
          </div>
        </div>
        <button class="cart-item-remove"
          onclick="removeFromCart(${index})">✕</button>
      </div>
    `;
  }).join('');
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  const isOpen  = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}

/* ---- CHECKOUT ---- */
function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const lines = cart.map(function(item) {
    return '• ' + item.name + ' (' + item.size + ') ×' + item.qty +
      ' = KSh ' + (item.price * item.qty).toLocaleString();
  }).join('\n');
  const total   = cart.reduce(function(s, c) { return s + c.price * c.qty; }, 0);
  const subject = 'Order from Pembe Flour Millers Website';
  const body    = 'Hello,\n\nI would like to place the following order:\n\n'
    + lines + '\n\nTotal: KSh ' + total.toLocaleString()
    + '\n\nPlease confirm availability and delivery details.\n\nThank you.';
  window.open(
    'mailto:orders@pembeflourmillers.com' +
    '?subject=' + encodeURIComponent(subject) +
    '&body='    + encodeURIComponent(body)
  );
}

function whatsappOrder() {
  if (cart.length === 0) { showToast('Add items to your cart first!'); return; }
  const lines = cart.map(function(item) {
    return item.name + ' (' + item.size + ') ×' + item.qty;
  }).join(', ');
  const total = cart.reduce(function(s, c) { return s + c.price * c.qty; }, 0);
  const msg   = 'Hello Pembe Flour Millers! I would like to order: '
    + lines + '. Total: KSh ' + total.toLocaleString()
    + '. Please confirm. Thank you!';
  window.open(
    'https://wa.me/254745319126?text=' + encodeURIComponent(msg),
    '_blank'
  );
}

/* ---- TOAST ---- */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

/* ---- PRELOAD IMAGES ---- */
function preloadImages() {
  products.forEach(function(p) {
    const img = new Image();
    img.src = p.image;
  });
}

/* ---- MAKE FUNCTIONS GLOBAL ---- */
/* Needed because we are using type="module" */
window.filterProducts  = filterProducts;
window.changeSize      = changeSize;
window.changeQty       = changeQty;
window.addToCart       = addToCart;
window.removeFromCart  = removeFromCart;
window.toggleCart      = toggleCart;
window.checkout        = checkout;
window.whatsappOrder   = whatsappOrder;

/* ---- START ---- */
/* Load stock from Firebase first, then render products */
async function init() {
  /* Show loading message while fetching stock */
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.innerHTML = '<p style="color:#7A6A50;padding:20px;">Loading products...</p>';
  }

  /* Fetch stock from Firebase */
  stockData = await loadStock();

  /* Now render products with stock info */
  renderProducts(products);
  preloadImages();
  applyAnimations();
}

init();