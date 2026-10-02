/**
 * VibeXwear - Admin Dashboard Engine
 * Synchronizes with customer orders, manages status progressions, products catalog, and inventory.
 */

// Sample seed orders to test out-of-the-box
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
  },
  {
    orderId: 'VX1002',
    customer: {
      name: 'Tanvir Hossain',
      phone: '01899887766',
      district: 'Chittagong',
      area: 'GEC Circle',
      fullAddress: 'Flat 4A, Green Heights, Nasirabad, Chittagong'
    },
    products: [
      {
        productId: 'vx-003',
        name: 'Acid Washed Vintage Drop-Shoulder Tee',
        size: 'M',
        color: 'Vintage Slate',
        quantity: 1,
        price: 899,
        image: '../frontend/assets/images/tee-acid-washed.svg'
      },
      {
        productId: 'vx-004',
        name: 'Raw Bone Minimalist Boxy Fit Tee',
        size: 'L',
        color: 'Raw Bone',
        quantity: 1,
        price: 749,
        image: '../frontend/assets/images/tee-raw-bone.svg'
      }
    ],
    subtotal: 1648,
    deliveryCharge: 100,
    discount: 164,
    total: 1584,
    paymentMethod: 'Cash on Delivery',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    orderId: 'VX1003',
    customer: {
      name: 'Sabir Ahmed',
      phone: '01633445566',
      district: 'Sylhet',
      area: 'Zindabazar',
      fullAddress: 'Shapla Bhaban, Zindabazar, Sylhet'
    },
    products: [
      {
        productId: 'vx-002',
        name: 'Cyber Matrix Graphic Oversized Tee',
        size: 'XL',
        color: 'Obsidian Black',
        quantity: 1,
        price: 849,
        image: '../frontend/assets/images/tee-cyber-matrix.svg'
      }
    ],
    subtotal: 849,
    deliveryCharge: 100,
    discount: 0,
    total: 949,
    paymentMethod: 'Cash on Delivery',
    status: 'Delivered',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

class AdminController {
  constructor() {
    this.orders = this.loadOrders();
    this.products = this.loadProducts();
    this.currentView = 'dashboard';
    this.orderStatusFilter = 'all';
    this.orderSearchQuery = '';

    this.init();
  }

  loadOrders() {
    try {
      const stored = localStorage.getItem('vibexwear_orders');
      if (stored) {
        return JSON.parse(stored);
      } else {
        localStorage.setItem('vibexwear_orders', JSON.stringify(INITIAL_SEED_ORDERS));
        return INITIAL_SEED_ORDERS;
      }
    } catch (e) {
      return INITIAL_SEED_ORDERS;
    }
  }

  saveOrders() {
    localStorage.setItem('vibexwear_orders', JSON.stringify(this.orders));
  }

  loadProducts() {
    try {
      const stored = localStorage.getItem('vibexwear_admin_products');
      if (stored) {
        return JSON.parse(stored);
      } else {
        // Fallback to PRODUCTS_DATA
        const prods = (typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : []).map(p => ({
          ...p,
          image: p.image.startsWith('../') ? p.image : `../frontend/${p.image}`
        }));
        localStorage.setItem('vibexwear_admin_products', JSON.stringify(prods));
        return prods;
      }
    } catch (e) {
      return [];
    }
  }

  saveProducts() {
    localStorage.setItem('vibexwear_admin_products', JSON.stringify(this.products));
  }

  init() {
    this.bindNavigation();
    this.renderMetrics();
    this.renderRecentOrders();
    this.renderOrdersTable();
    this.renderProductsTable();
    this.renderInventoryTable();
    this.bindSearchAndFilters();
    this.bindProductModal();
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

    // Total products & low stock products count
    const totalProducts = this.products.length;
    const lowStockCount = this.products.filter(p => {
      if (!p.stock) return false;
      const total = Object.values(p.stock).reduce((a, b) => a + b, 0);
      return total <= 8;
    }).length;

    // Total sales (from confirmed, processing, and delivered orders)
    const totalSales = this.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Update DOM counters
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
        <td><strong>#${o.orderId}</strong></td>
        <td>${o.customer.name}</td>
        <td>${o.customer.district}</td>
        <td>${o.products.map(p => `${p.name} (${p.size}×${p.quantity})`).join(', ')}</td>
        <td style="font-weight: 800; color: var(--accent-lime);">৳${o.total}</td>
        <td>
          <select class="admin-select" onchange="adminCtrl.updateOrderStatus('${o.orderId}', this.value)">
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
      filtered = filtered.filter(o => o.status.toLowerCase() === this.orderStatusFilter.toLowerCase());
    }

    if (this.orderSearchQuery) {
      filtered = filtered.filter(o => 
        o.orderId.toLowerCase().includes(this.orderSearchQuery) ||
        o.customer.name.toLowerCase().includes(this.orderSearchQuery) ||
        o.customer.phone.includes(this.orderSearchQuery) ||
        o.customer.district.toLowerCase().includes(this.orderSearchQuery)
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
        <td><strong>#${o.orderId}</strong></td>
        <td>
          <div style="font-weight: 700;">${o.customer.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${o.customer.phone}</div>
        </td>
        <td>
          <div>${o.customer.area}, ${o.customer.district}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${o.customer.fullAddress}</div>
        </td>
        <td>
          ${o.products.map(p => `
            <div style="font-size: 0.8rem;">• ${p.name} [Size: ${p.size} | Color: ${p.color} | Qty: ${p.quantity}]</div>
          `).join('')}
        </td>
        <td style="font-weight: 800; color: var(--accent-lime);">৳${o.total}</td>
        <td>
          <span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <select class="admin-select" onchange="adminCtrl.updateOrderStatus('${o.orderId}', this.value)">
              <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button class="admin-btn admin-btn-secondary" onclick="adminCtrl.viewOrderDetails('${o.orderId}')">
              Details
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  updateOrderStatus(orderId, newStatus) {
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
        ORDER DETAILS #${order.orderId}
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div style="background: var(--admin-subtle); padding: 16px; border-radius: 8px;">
          <h5 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; margin-bottom: 8px;">Customer Information</h5>
          <p><strong>Name:</strong> ${order.customer.name}</p>
          <p><strong>Phone:</strong> ${order.customer.phone}</p>
          <p><strong>District:</strong> ${order.customer.district}</p>
          <p><strong>Address:</strong> ${order.customer.fullAddress}</p>
          ${order.customer.notes ? `<p><strong>Notes:</strong> ${order.customer.notes}</p>` : ''}
        </div>
        <div style="background: var(--admin-subtle); padding: 16px; border-radius: 8px;">
          <h5 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; margin-bottom: 8px;">Order Summary</h5>
          <p><strong>Status:</strong> <span class="status-pill status-${order.status.toLowerCase()}">${order.status}</span></p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Subtotal:</strong> ৳${order.subtotal}</p>
          <p><strong>Delivery Fee:</strong> ৳${order.deliveryCharge}</p>
          <p><strong>Discount:</strong> ৳${order.discount}</p>
          <p style="font-size: 1.1rem; font-weight: 800; color: var(--accent-lime); margin-top: 6px;"><strong>Grand Total:</strong> ৳${order.total}</p>
        </div>
      </div>

      <h5 style="color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; margin-bottom: 10px;">Ordered Products</h5>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${order.products.map(p => `
          <div style="display: flex; gap: 14px; align-items: center; background: var(--admin-subtle); padding: 12px; border-radius: 8px;">
            <div style="flex: 1;">
              <div style="font-weight: 700;">${p.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Size: ${p.size} | Color: ${p.color} | Qty: ${p.quantity}</div>
            </div>
            <div style="font-weight: 800; color: var(--accent-lime);">৳${p.price * p.quantity}</div>
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
      const totalStock = p.stock ? Object.values(p.stock).reduce((a, b) => a + b, 0) : 0;
      return `
        <tr>
          <td>
            <img src="${p.image}" alt="${p.name}" style="width: 44px; height: 50px; object-fit: cover; border-radius: 4px; background: #000;">
          </td>
          <td>
            <strong>${p.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.category}</div>
          </td>
          <td style="font-weight: 800; color: var(--accent-lime);">৳${p.price}</td>
          <td>${p.discount ? `${p.discount}% OFF` : '—'}</td>
          <td>
            <strong>${totalStock}</strong> units
            <div style="font-size: 0.72rem; color: var(--text-muted);">
              ${Object.entries(p.stock || {}).map(([s, q]) => `${s}:${q}`).join(' ')}
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
              <button class="admin-btn admin-btn-secondary" onclick="adminCtrl.editProduct('${p.id}')">Edit</button>
              <button class="admin-btn admin-btn-secondary" style="color: var(--status-cancelled);" onclick="adminCtrl.deleteProduct('${p.id}')">Delete</button>
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
      const s = p.stock || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
      const total = Object.values(s).reduce((a, b) => a + b, 0);

      let statusBadge = '<span class="status-pill status-delivered">In Stock</span>';
      if (total === 0) statusBadge = '<span class="status-pill status-cancelled">Out of Stock</span>';
      else if (total <= 8) statusBadge = '<span class="status-pill status-pending">Low Stock</span>';

      return `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.category}</td>
          <td>
            <span style="font-weight: 700;">${s.S || 0}</span>
            <button onclick="adminCtrl.adjustStock('${p.id}', 'S', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td>
            <span style="font-weight: 700;">${s.M || 0}</span>
            <button onclick="adminCtrl.adjustStock('${p.id}', 'M', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td>
            <span style="font-weight: 700;">${s.L || 0}</span>
            <button onclick="adminCtrl.adjustStock('${p.id}', 'L', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
          </td>
          <td>
            <span style="font-weight: 700;">${s.XL || 0}</span>
            <button onclick="adminCtrl.adjustStock('${p.id}', 'XL', 1)" style="margin-left: 4px; padding: 2px 6px; background: var(--admin-subtle); border: 1px solid var(--border-subtle); color: #fff; border-radius: 2px; cursor: pointer;">+</button>
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
    product.stock[size] = Math.max(0, (product.stock[size] || 0) + delta);
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
        const stockS = Number(document.getElementById('stockS')?.value || 0);
        const stockM = Number(document.getElementById('stockM')?.value || 0);
        const stockL = Number(document.getElementById('stockL')?.value || 0);
        const stockXL = Number(document.getElementById('stockXL')?.value || 0);

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
    console.log('[Admin]', msg);
    alert(msg);
  }
}

let adminCtrl = null;
document.addEventListener('DOMContentLoaded', () => {
  adminCtrl = new AdminController();
});
