/**
 * VibeXwear - Main Frontend Engine
 * Handles navigation, quick views, modals, and dynamic product rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initStickyNavbar();
  initQuickViewModal();
  initSizeGuideModal();
  initNewsletterForm();
});

// Mobile Navigation
function initMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const closeMobileNav = document.getElementById('closeMobileNav');
  const cartOverlay = document.getElementById('cartOverlay');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.add('open');
      if (cartOverlay) {
        cartOverlay.classList.add('open');
      }
      document.body.style.overflow = 'hidden';
    });
  }

  const closeMenu = () => {
    if (mobileNav) mobileNav.classList.remove('open');
    if (cartOverlay && !document.getElementById('cartDrawer')?.classList.contains('open')) {
      cartOverlay.classList.remove('open');
    }
    document.body.style.overflow = '';
  };

  if (closeMobileNav) {
    closeMobileNav.addEventListener('click', closeMenu);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeMenu);
  }
}

// Sticky Navbar Scroll Effect
function initStickyNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.14)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.borderBottomColor = 'var(--border-subtle)';
      navbar.style.boxShadow = 'none';
    }
  });
}

// Generate Product Card HTML
function createProductCardHTML(p) {
  const stockInfo = getStockStatus(p);
  const discountBadge = p.discount ? `<span class="badge badge-discount">-${p.discount}%</span>` : '';
  const bestsellerBadge = p.bestSeller ? `<span class="badge badge-bestseller">BESTSELLER</span>` : '';
  const newBadge = p.newArrival ? `<span class="badge badge-new">NEW DROP</span>` : '';

  const swatches = (p.colors || []).map(c => `
    <span class="swatch-dot" style="background-color: ${c.hex};" title="${c.name}"></span>
  `).join('');

  return `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}" data-price="${p.price}">
      <div class="product-image-wrap">
        <div class="card-badges">
          ${discountBadge}
          ${bestsellerBadge}
          ${newBadge}
        </div>
        <a href="product.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </a>
        <div class="card-quick-actions">
          <button class="quick-btn" onclick="openQuickView('${p.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Quick View
          </button>
          <button class="quick-btn" onclick="handleQuickAddToCart('${p.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add
          </button>
        </div>
      </div>
      <div class="product-content">
        <div class="product-category-row">
          <span class="product-cat">${p.category}</span>
          <span class="badge-stock ${stockInfo.class}">${stockInfo.label}</span>
        </div>
        <h4 class="product-name">
          <a href="product.html?id=${p.id}">${p.name}</a>
        </h4>
        <div class="product-swatches">
          ${swatches}
        </div>
        <div class="product-price-row">
          <span class="price-current">৳${p.price}</span>
          ${p.originalPrice ? `<span class="price-original">৳${p.originalPrice}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Quick Add Handler: selects first available size
function handleQuickAddToCart(productId) {
  const p = getProductById(productId);
  if (!p) return;

  // Find first size with stock
  let availableSize = null;
  if (p.sizes && p.stock) {
    availableSize = p.sizes.find(s => p.stock[s] > 0) || p.sizes[0];
  }

  const defaultColor = p.colors && p.colors[0] ? p.colors[0].name : 'Default';
  cartEngine.addToCart(p.id, availableSize, defaultColor, 1);
}

// Quick View Modal
function initQuickViewModal() {
  let modalOverlay = document.getElementById('quickViewModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'quickViewModal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-dialog">
        <button class="close-btn modal-close-btn" onclick="closeQuickView()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div id="quickViewContent" class="quick-view-container"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeQuickView();
    });
  }
}

function openQuickView(productId) {
  const p = getProductById(productId);
  if (!p) return;

  const content = document.getElementById('quickViewContent');
  if (!content) return;

  const stockInfo = getStockStatus(p);
  const colorButtons = (p.colors || []).map((c, i) => `
    <button class="color-option-btn ${i === 0 ? 'active' : ''}" onclick="selectQuickColor(this, '${c.name}')">
      <span class="color-dot" style="background-color: ${c.hex}"></span>
      ${c.name}
    </button>
  `).join('');

  const sizeButtons = (p.sizes || []).map((s, i) => {
    const qty = p.stock && p.stock[s] !== undefined ? p.stock[s] : 10;
    const isOutOfStock = qty <= 0;
    return `
      <button class="size-btn ${i === 0 && !isOutOfStock ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}" 
        ${isOutOfStock ? 'disabled' : ''} 
        onclick="selectQuickSize(this, '${s}', ${qty})">
        ${s}
      </button>
    `;
  }).join('');

  content.innerHTML = `
    <div class="product-detail-grid" style="padding: 24px;">
      <div class="detail-gallery" style="position: static;">
        <div class="detail-main-image">
          <img id="quickMainImg" src="${p.image}" alt="${p.name}">
        </div>
      </div>
      <div class="detail-info">
        <div class="product-cat">${p.category}</div>
        <h3 class="detail-title">${p.name}</h3>
        
        <div class="detail-price-box">
          <span class="detail-price-main">৳${p.price}</span>
          ${p.originalPrice ? `<span class="detail-price-old">৳${p.originalPrice}</span>` : ''}
          ${p.discount ? `<span class="badge badge-discount">SAVE ${p.discount}%</span>` : ''}
        </div>

        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">
          ${p.description}
        </p>

        <div>
          <div class="detail-variants-title">COLOR: <span id="quickSelectedColor" style="color: var(--accent-primary);">${p.colors[0]?.name || ''}</span></div>
          <div class="color-picker-row">${colorButtons}</div>
        </div>

        <div>
          <div class="detail-variants-title">SIZE: <span id="quickSelectedSize" style="color: var(--accent-primary);">${p.sizes[0] || ''}</span></div>
          <div class="size-picker-row">${sizeButtons}</div>
          <div id="quickStockStatus" class="stock-indicator-row">
            <span class="badge-stock ${stockInfo.class}">${stockInfo.label}</span>
          </div>
        </div>

        <div class="detail-actions-row">
          <div class="stepper-large">
            <button onclick="adjustQuickQty(-1)">-</button>
            <span id="quickQty">1</span>
            <button onclick="adjustQuickQty(1)">+</button>
          </div>
          <button class="btn btn-primary" style="flex: 1;" onclick="submitQuickAddToCart('${p.id}')">
            ADD TO CART
          </button>
        </div>

        <div style="margin-top: 10px;">
          <a href="product.html?id=${p.id}" class="btn btn-outline btn-block">VIEW FULL DETAILS</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('quickViewModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function selectQuickColor(btn, colorName) {
  document.querySelectorAll('.color-option-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const label = document.getElementById('quickSelectedColor');
  if (label) label.textContent = colorName;
}

function selectQuickSize(btn, size, qty) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const label = document.getElementById('quickSelectedSize');
  if (label) label.textContent = size;

  const stockBadge = document.getElementById('quickStockStatus');
  if (stockBadge) {
    if (qty <= 0) {
      stockBadge.innerHTML = `<span class="badge-stock out-of-stock">Out of Stock</span>`;
    } else if (qty <= 3) {
      stockBadge.innerHTML = `<span class="badge-stock low-stock">Low Stock (${qty} left)</span>`;
    } else {
      stockBadge.innerHTML = `<span class="badge-stock in-stock">In Stock (${qty} available)</span>`;
    }
  }
}

let quickQtyVal = 1;
function adjustQuickQty(delta) {
  quickQtyVal = Math.max(1, quickQtyVal + delta);
  const qtyEl = document.getElementById('quickQty');
  if (qtyEl) qtyEl.textContent = quickQtyVal;
}

function submitQuickAddToCart(productId) {
  const size = document.getElementById('quickSelectedSize')?.textContent || 'M';
  const color = document.getElementById('quickSelectedColor')?.textContent || 'Black';
  cartEngine.addToCart(productId, size, color, quickQtyVal);
  closeQuickView();
}

// Size Guide Modal
function initSizeGuideModal() {
  let modal = document.getElementById('sizeGuideModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sizeGuideModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <button class="close-btn modal-close-btn" onclick="document.getElementById('sizeGuideModal').classList.remove('open'); document.body.style.overflow='';">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div style="padding: 32px;">
          <h3 style="font-family: var(--font-display); font-size: 1.6rem; text-transform: uppercase; margin-bottom: 8px;">
            STREETWEAR FIT & SIZE GUIDE
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px;">
            All VibeXwear silhouettes feature our signature oversized, drop-shoulder cut. Order your true size for a relaxed drape, or size down for standard fitted look.
          </p>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-medium); color: var(--accent-primary);">
                  <th style="padding: 10px 8px;">SIZE</th>
                  <th style="padding: 10px 8px;">CHEST (IN)</th>
                  <th style="padding: 10px 8px;">LENGTH (IN)</th>
                  <th style="padding: 10px 8px;">SHOULDER (IN)</th>
                </tr>
              </thead>
              <tbody style="color: var(--text-secondary);">
                <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 10px 8px; font-weight: 800; color: #fff;">S</td><td>40"</td><td>27.5"</td><td>20"</td></tr>
                <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 10px 8px; font-weight: 800; color: #fff;">M</td><td>42"</td><td>28.5"</td><td>21"</td></tr>
                <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 10px 8px; font-weight: 800; color: #fff;">L</td><td>44"</td><td>29.5"</td><td>22"</td></tr>
                <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 10px 8px; font-weight: 800; color: #fff;">XL</td><td>46"</td><td>30.5"</td><td>23"</td></tr>
                <tr><td style="padding: 10px 8px; font-weight: 800; color: #fff;">XXL</td><td>48"</td><td>31.5"</td><td>24"</td></tr>
              </tbody>
            </table>
          </div>
          <div style="margin-top: 24px; padding: 14px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--text-secondary);">
            💡 <strong>Model Reference:</strong> Male model is 6'0" (183cm), 74kg wearing Size L for an oversized aesthetic.
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

function openSizeGuide() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

// Newsletter Signup
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value;
      if (email) {
        cartEngine.showToast('Subscribed! Welcome to the VibeXwear Inner Circle.', 'success');
        form.reset();
      }
    });
  }
}
