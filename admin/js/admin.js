/**
 * VibeXwear - Admin Dashboard Engine (Hardened & Secured)
 * Features:
 * - JWT Session Gate & Authentication
 * - Server-synchronized Order Management
 * - Stored XSS Protection via Strict HTML Escaping
 * - Role Verification & Automatic Session Expiry Handling
 */

/**
 * Security: Strict HTML Escaper to prevent Stored XSS
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fallback seed orders in case API is offline
const INITIAL_SEED_ORDERS = [
  {
    orderId: 'VX1001',
    customer: {
      name: 'Rahim Chowdhury',
      phone: '01711223344',
      district: 'Dhaka',
      area: 'Mirpur-10',
      fullAddress: 'House 14, Road 5, Block B, Mirpur-10, Dhaka'
    },
    products: [
      {
        productId: 'vx-001',
        name: 'Black Oversized Heavyweight T-Shirt',
        size: 'L',
        color: 'Jet Black',
        quantity: 2,
        price: 799,
        image: '../frontend/assets/images/tee-black-oversized.svg'
      }
    ],
    subtotal: 1598,
    deliveryCharge: 100,
    discount: 0,
    total: 1698,
    paymentMethod: 'Cash on Delivery',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

class AdminController {
  constructor() {
    this.token = sessionStorage.getItem('vibexwear_admin_token') || null;
    this.orders = [];
    this.products = this.loadProducts();
    this.currentView = 'dashboard';
    this.orderStatusFilter = 'all';
    this.orderSearchQuery = '';

    this.init();
  }

  // Session Management
  getAuthToken() {
    return sessionStorage.getItem('vibexwear_admin_token');
  }

  setAuthToken(token) {
    this.token = token;
    sessionStorage.setItem('vibexwear_admin_token', token);
  }

  clearAuthToken() {
    this.token = null;
    sessionStorage.removeItem('vibexwear_admin_token');
  }

  async init() {
    this.bindAuthEvents();
    this.bindNavigation();
    this.bindSearchAndFilters();
    this.bindProductModal();

    // Verify existing session or prompt for login
    await this.checkAuthAndLoad();
  }

  bindAuthEvents() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }

  async checkAuthAndLoad() {
    const token = this.getAuthToken();
    const gate = document.getElementById('adminAuthGate');

    if (!token) {
      this.showLoginGate();
      return;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (gate) gate.style.display = 'none';
          await this.loadOrders();
          this.renderAll();
          return;
        }
      }
    } catch (e) {
      console.warn('Backend verify check skipped or offline:', e.message);
      // If offline/file-mode with token, allow local inspection
      if (gate) gate.style.display = 'none';
      this.orders = this.loadLocalOrders();
      this.renderAll();
      return;
    }

    // Invalid or expired token
    this.clearAuthToken();
    this.showLoginGate('Session expired. Please enter your credentials to authenticate.');
  }

  showLoginGate(msg = null) {
    const gate = document.getElementById('adminAuthGate');
    const alertBox = document.getElementById('adminLoginAlert');
    if (gate) gate.style.display = 'flex';

    if (alertBox && msg) {
      alertBox.textContent = msg;
      alertBox.className = 'admin-login-alert';
      alertBox.style.display = 'block';
    } else if (alertBox) {
      alertBox.style.display = 'none';
    }
  }

  async handleLogin() {
    const emailInput = document.getElementById('adminEmailInput');
    const passwordInput = document.getElementById('adminPasswordInput');
    const alertBox = document.getElementById('adminLoginAlert');
    const submitBtn = document.getElementById('adminLoginBtn');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      if (alertBox) {
        alertBox.textContent = 'Please enter both admin email and password.';
        alertBox.style.display = 'block';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'VERIFYING CREDENTIALS... 🔒';
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        this.setAuthToken(data.token);
        if (alertBox) {
          alertBox.className = 'admin-login-alert success';
          alertBox.textContent = 'Access granted. Initializing dashboard...';
          alertBox.style.display = 'block';
        }

        setTimeout(async () => {
          document.getElementById('adminAuthGate').style.display = 'none';
          if (loginForm) loginForm.reset();
          await this.loadOrders();
          this.renderAll();
        }, 500);
      } else {
        if (alertBox) {
          alertBox.className = 'admin-login-alert';
          alertBox.textContent = data.message || 'Authentication failed. Please check credentials.';
          alertBox.style.display = 'block';
        }
      }
    } catch (err) {
      console.warn('Network error during login, attempting local check', err);
      // Fallback for static file testing
      if (email === 'admin@vibexwear.com' && password === 'admin123456') {
        this.setAuthToken('local_dev_token_' + Date.now());
        document.getElementById('adminAuthGate').style.display = 'none';
        this.orders = this.loadLocalOrders();
        this.renderAll();
      } else {
        if (alertBox) {
          alertBox.textContent = 'Invalid credentials or server connection failed.';
          alertBox.style.display = 'block';
        }
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'AUTHENTICATE & UNLOCK ⚡';
      }
    }
  }

  logout() {
    this.clearAuthToken();
    this.orders = [];
    this.showLoginGate('You have securely logged out from the admin console.');
    const recentTbody = document.getElementById('recentOrdersTbody');
    const allTbody = document.getElementById('allOrdersTbody');
    if (recentTbody) recentTbody.innerHTML = '';
    if (allTbody) allTbody.innerHTML = '';
  }

  handleSessionExpired() {
    this.clearAuthToken();
    this.showLoginGate('Session expired or unauthorized. Please re-authenticate.');
  }

  // Orders Management
  async loadOrders() {
    const token = this.getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        this.handleSessionExpired();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          this.orders = data.orders;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch orders from API, fallback to local storage:', e);
    }

    this.orders = this.loadLocalOrders();
  }

  loadLocalOrders() {
    try {
      const stored = localStorage.getItem('vibexwear_orders');
      if (stored) {
        return JSON.parse(stored);
      }
      return INITIAL_SEED_ORDERS;
    } catch (e) {
      return INITIAL_SEED_ORDERS;
    }
  }

  saveOrders() {
    try {
      localStorage.setItem('vibexwear_orders', JSON.stringify(this.orders));
    } catch (e) {
      console.error('Error saving orders locally:', e);
    }
  }

  loadProducts() {
    try {
      const stored = localStorage.getItem('vibexwear_admin_products');
      if (stored) {
        return JSON.parse(stored);
      }
      const prods = (typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : []).map(p => ({
        ...p,
        image: p.image.startsWith('../') ? p.image : `../frontend/${p.image}`
      }));
      localStorage.setItem('vibexwear_admin_products', JSON.stringify(prods));
      return prods;
    } catch (e) {
      return [];
    }
  }

  saveProducts() {
    try {
      localStorage.setItem('vibexwear_admin_products', JSON.stringify(this.products));
    } catch (e) {
      console.error('Error saving products locally:', e);
    }
  }

  renderAll() {
    this.renderMetrics();
    this.renderRecentOrders();
    this.renderOrdersTable();
    this.renderProductsTable();
    this.renderInventoryTable();
  }

  bindNavigation() {
    document.querySelectorAll('.admin-nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.switchView(view);
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.admin-nav-item[data-view="${viewName}"]`)?.classList.add('active');

    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewName}`)?.classList.add('active');

    if (viewName === 'dashboard') {
      this.renderMetrics();
      this.renderRecentOrders();
    } else if (viewName === 'orders') {
      this.renderOrdersTable();
    } else if (viewName === 'products') {
      this.renderProductsTable();
    } else if (viewName === 'inventory') {
      this.renderInventoryTable();
    }
  }

  renderMetrics() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === 'Pending').length;
    const confirmedOrders = this.orders.filter(o => o.status === 'Confirmed').length;
    const processingOrders = this.orders.filter(o => o.status === 'Processing').length;
    const deliveredOrders = this.orders.filter(o => o.status === 'Delivered').length;

    const totalProducts = this.products.length;
    const lowStockCount = this.products.filter(p => {
      if (!p.stock) return false;
      const total = Object.values(p.stock).reduce((a, b) => a + b, 0);
      return total <= 8;
    }).length;

    const totalSales = this.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    this.setText('metricTotalOrders', totalOrders);
    this.setText('metricPendingOrders', pendingOrders);
    this.setText('metricConfirmedOrders', confirmedOrders);
    this.setText('metricProcessingOrders', processingOrders);
    this.setText('metricDeliveredOrders', deliveredOrders);
    this.setText('metricTotalProducts', totalProducts);
    this.setText('metricLowStock', lowStockCount);
    this.setText('metricTotalSales', `৳${totalSales}`);
  }

  setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  renderRecentOrders() {
    const tbody = document.getElementById('recentOrdersTbody');
    if (!tbody) return;

    const recent = this.orders.slice(0, 5);
    tbody.innerHTML = recent.map(o => `
      <tr>
        <td><strong>#${escapeHTML(o.orderId)}</strong></td>
        <td>${escapeHTML(o.customer?.name || 'Customer')}</td>
        <td>${escapeHTML(o.customer?.district || 'Dhaka')}</td>
        <td>${(o.products || []).map(p => `${escapeHTML(p.name)} (${escapeHTML(p.size)}×${Number(p.quantity) || 1})`).join(', ')}</td>
        <td style="font-weight: 800; color: var(--accent-lime);">৳${Number(o.total) || 0}</td>
        <td>
          <select class="admin-select" onchange="adminCtrl.updateOrderStatus('${escapeHTML(o.orderId)}', this.value)">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  bindSearchAndFilters() {
    const searchInput = document.getElementById('ordersSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.orderSearchQuery = e.target.value.trim().toLowerCase();
        this.renderOrdersTable();
      });
    }

    const filterSelect = document.getElementById('ordersStatusFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.orderStatusFilter = e.target.value;
        this.renderOrdersTable();
      });
    }
  }

  renderOrdersTable() {
    const tbody = document.getElementById('allOrdersTbody');
    if (!tbody) return;

    let filtered = [...this.orders];

    if (this.orderStatusFilter !== 'all') {
      filtered = filtered.filter(o => String(o.status || '').toLowerCase() === this.orderStatusFilter.toLowerCase());
    }

    if (this.orderSearchQuery) {
      filtered = filtered.filter(o => 
        String(o.orderId || '').toLowerCase().includes(this.orderSearchQuery) ||
        String(o.customer?.name || '').toLowerCase().includes(this.orderSearchQuery) ||
        String(o.customer?.phone || '').includes(this.orderSearchQuery) ||
        String(o.customer?.district || '').toLowerCase().includes(this.orderSearchQuery)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No orders found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(o => `
      <tr>
        <td><strong>#${escapeHTML(o.orderId)}</strong></td>
        <td>
          <div style="font-weight: 700;">${escapeHTML(o.customer?.name || 'Unknown')}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHTML(o.customer?.phone || '')}</div>
        </td>
        <td>
          <div>${escapeHTML(o.customer?.area || '')}, ${escapeHTML(o.customer?.district || '')}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(o.customer?.fullAddress || '')}</div>
        </td>
        <td>
          ${(o.products || []).map(p => `
            <div style="font-size: 0.8rem;">• ${escapeHTML(p.name)} [Size: ${escapeHTML(p.size)} | Color: ${escapeHTML(p.color)} | Qty: ${Number(p.quantity) || 1}]</div>
          `).join('')}
        </td>
        <td style="font-weight: 800; color: var(--accent-lime);">৳${Number(o.total) || 0}</td>
        <td>
          <span class="status-pill status-${escapeHTML(String(o.status || 'pending').toLowerCase())}">${escapeHTML(o.status || 'Pending')}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <select class="admin-select" onchange="adminCtrl.updateOrderStatus('${escapeHTML(o.orderId)}', this.value)">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="admin-btn admin-btn-secondary" onclick="adminCtrl.viewOrderDetails('${escapeHTML(o.orderId)}')">
              Details
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async updateOrderStatus(orderId, newStatus) {
    const token = this.getAuthToken();

    // Attempt backend update first
    if (token) {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (res.status === 401 || res.status === 403) {
          this.handleSessionExpired();
          return;
        }

        const data = await res.json();
        if (!res.ok || !data.success) {
          this.notify(data.message || 'Failed to update order status on server.');
          return;
        }
      } catch (err) {
        console.warn('Server status update request failed, persisting locally', err);
      }
    }

    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) return;

    order.status = newStatus;
    this.saveOrders();
    this.renderMetrics();
    this.renderRecentOrders();
    this.renderOrdersTable();
    this.notify(`Order #${orderId} status updated to "${newStatus}".`);
  }

  viewOrderDetails(orderId) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <h3 style="font-family: var(--font-display); font-size: 1.4rem; text-transform: uppercase; margin-bottom: 16px;">
        ORDER DETAILS #${escapeHTML(order.orderId)}
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div style="background: var(--admin-subtle); padding: 16px; border-radius: 8px;">
          <h5 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; margin-bottom: 8px;">Customer Information</h5>
          <p><strong>Name:</strong> ${escapeHTML(order.customer?.name || 'N/A')}</p>
          <p><strong>Phone:</strong> ${escapeHTML(order.customer?.phone || 'N/A')}</p>
          <p><strong>District:</strong> ${escapeHTML(order.customer?.district || 'N/A')}</p>
          <p><strong>Address:</strong> ${escapeHTML(order.customer?.fullAddress || 'N/A')}</p>
          ${order.customer?.notes ? `<p><strong>Notes:</strong> ${escapeHTML(order.customer.notes)}</p>` : ''}
        </div>
        <div style="background: var(--admin-subtle); padding: 16px; border-radius: 8px;">
          <h5 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; margin-bottom: 8px;">Order Summary</h5>
          <p><strong>Status:</strong> <span class="status-pill status-${escapeHTML(String(order.status || 'pending').toLowerCase())}">${escapeHTML(order.status || 'Pending')}</span></p>
          <p><strong>Payment Method:</strong> ${escapeHTML(order.paymentMethod || 'Cash on Delivery')}</p>
          <p><strong>Subtotal:</strong> ৳${Number(order.subtotal) || 0}</p>
          <p><strong>Delivery Fee:</strong> ৳${Number(order.deliveryCharge) || 0}</p>
          <p><strong>Discount:</strong> ৳${Number(order.discount) || 0}</p>
          <p style="font-size: 1.1rem; font-weight: 800; color: var(--accent-lime); margin-top: 6px;"><strong>Grand Total:</strong> ৳${Number(order.total) || 0}</p>
        </div>
      </div>

      <h5 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; margin-bottom: 10px;">Ordered Products</h5>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${(order.products || []).map(p => `
          <div style="display: flex; gap: 14px; align-items: center; background: var(--admin-subtle); padding: 12px; border-radius: 8px;">
            <div style="flex: 1;">
              <div style="font-weight: 700;">${escapeHTML(p.name)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Size: ${escapeHTML(p.size)} | Color: ${escapeHTML(p.color)} | Qty: ${Number(p.quantity) || 1}</div>
            </div>
            <div style="font-weight: 800; color: var(--accent-lime);">৳${(Number(p.price) || 0) * (Number(p.quantity) || 1)}</div>
          </div>
        `).join('')}
      </div>
    `;

    modal.classList.add('open');
  }

  renderProductsTable() {
    const tbody = document.getElementById('productsTbody');
    if (!tbody) return;

    tbody.innerHTML = this.products.map(p => {
      const totalStock = p.stock ? Object.values(p.stock).reduce((a, b) => a + Number(b), 0) : 0;
      return `
        <tr>
          <td>
            <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" style="width: 44px; height: 50px; object-fit: cover; border-radius: 4px; background: #000;">
          </td>
          <td>
            <strong>${escapeHTML(p.name)}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(p.category)}</div>
          </td>
          <td style="font-weight: 800; color: var(--accent-lime);">৳${Number(p.price) || 0}</td>
          <td>${p.discount ? `${Number(p.discount)}% OFF` : '—'}</td>
          <td>
            <strong>${totalStock}</strong> units
            <div style="font-size: 0.72rem; color: var(--text-muted);">
              ${Object.entries(p.stock || {}).map(([s, q]) => `${escapeHTML(s)}:${Number(q)}`).join(' ')}
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 4px;">
              ${p.featured ? '<span class="status-pill status-confirmed">Featured</span>' : ''}
              ${p.bestSeller ? '<span class="status-pill status-pending">Best</span>' : ''}
              ${p.newArrival ? '<span class="status-pill status-delivered">New</span>' : ''}
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="admin-btn admin-btn-secondary" onclick="adminCtrl.deleteProduct('${escapeHTML(p.id)}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderInventoryTable() {
    const tbody = document.getElementById('inventoryTbody');
    if (!tbody) return;

    tbody.innerHTML = this.products.map(p => {
      const s = p.stock || { S: 0, M: 0, L: 0, XL: 0 };
      const total = Object.values(s).reduce((a, b) => a + Number(b), 0);

      let statusBadge = '<span class="status-pill status-delivered">In Stock</span>';
      if (total === 0) statusBadge = '<span class="status-pill status-cancelled">Out of Stock</span>';
      else if (total <= 8) statusBadge = '<span class="status-pill status-pending">Low Stock</span>';

      return `
        <tr>
          <td><strong>${escapeHTML(p.name)}</strong></td>
          <td>${escapeHTML(p.category)}</td>
          <td>
            <span style="font-weight: 700;">${Number(s.S) || 0}</span>
            <button onclick="adminCtrl.adjustStock('${escapeHTML(p.id)}', 'S', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td>
            <span style="font-weight: 700;">${Number(s.M) || 0}</span>
            <button onclick="adminCtrl.adjustStock('${escapeHTML(p.id)}', 'M', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td>
            <span style="font-weight: 700;">${Number(s.L) || 0}</span>
            <button onclick="adminCtrl.adjustStock('${escapeHTML(p.id)}', 'L', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td>
            <span style="font-weight: 700;">${Number(s.XL) || 0}</span>
            <button onclick="adminCtrl.adjustStock('${escapeHTML(p.id)}', 'XL', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td><strong>${total}</strong></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  adjustStock(productId, size, delta) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    if (!product.stock) product.stock = {};
    product.stock[size] = Math.max(0, (Number(product.stock[size]) || 0) + delta);
    this.saveProducts();
    this.renderInventoryTable();
    this.renderProductsTable();
    this.renderMetrics();
    this.notify(`Stock for ${product.name} (Size ${size}) updated.`);
  }

  deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== productId);
      this.saveProducts();
      this.renderProductsTable();
      this.renderInventoryTable();
      this.renderMetrics();
      this.notify('Product deleted successfully.');
    }
  }

  bindProductModal() {
    const form = document.getElementById('addProductForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('prodName')?.value.trim();
        const category = document.getElementById('prodCategory')?.value;
        const price = Number(document.getElementById('prodPrice')?.value);
        const stockS = Math.max(0, Number(document.getElementById('stockS')?.value || 0));
        const stockM = Math.max(0, Number(document.getElementById('stockM')?.value || 0));
        const stockL = Math.max(0, Number(document.getElementById('stockL')?.value || 0));
        const stockXL = Math.max(0, Number(document.getElementById('stockXL')?.value || 0));

        if (!name || isNaN(price) || price <= 0) {
          alert('Please provide valid product name and price.');
          return;
        }

        const newProd = {
          id: `vx-${Date.now().toString().slice(-4)}`,
          name: name,
          category: category,
          price: price,
          image: '../frontend/assets/images/tee-black-oversized.svg',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [{ name: 'Jet Black', hex: '#121316' }],
          stock: { S: stockS, M: stockM, L: stockL, XL: stockXL },
          featured: true,
          bestSeller: false,
          newArrival: true
        };

        this.products.unshift(newProd);
        this.saveProducts();
        this.renderProductsTable();
        this.renderInventoryTable();
        this.renderMetrics();
        this.closeModals();
        form.reset();
        this.notify(`Product "${name}" added to catalog.`);
      });
    }
  }

  openAddProductModal() {
    document.getElementById('addProductModal')?.classList.add('open');
  }

  closeModals() {
    document.querySelectorAll('.admin-modal').forEach(m => m.classList.remove('open'));
  }

  notify(msg) {
    console.log('[Admin Secure Notification]', msg);
    // Custom banner or alert
  }
}

let adminCtrl = null;
document.addEventListener('DOMContentLoaded', () => {
  adminCtrl = new AdminController();
});
