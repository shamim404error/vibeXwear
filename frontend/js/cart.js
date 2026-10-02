/**
 * VibeXwear - Cart Engine
 * Manages shopping cart state, stock validation, calculations, and UI sync.
 */

const CART_STORAGE_KEY = 'vibexwear_cart';
const COUPON_STORAGE_KEY = 'vibexwear_coupon';
const DEFAULT_DELIVERY_CHARGE = 100;

class CartEngine {
  constructor() {
    this.cart = this.loadCart();
    this.appliedCoupon = this.loadCoupon();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
      this.updateBadges();
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: this.cart } }));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }

  loadCoupon() {
    try {
      const coupon = localStorage.getItem(COUPON_STORAGE_KEY);
      return coupon ? JSON.parse(coupon) : null;
    } catch (e) {
      return null;
    }
  }

  saveCoupon(coupon) {
    this.appliedCoupon = coupon;
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
    this.saveCart();
  }

  getItems() {
    return this.cart;
  }

  getItemCount() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  addToCart(productId, size, color, quantity = 1) {
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    if (!product) {
      this.showToast('Product not found.', 'error');
      return false;
    }

    if (!size) {
      this.showToast('Please select a size first.', 'warning');
      return false;
    }

    const availableStock = product.stock && product.stock[size] !== undefined ? product.stock[size] : 10;
    if (availableStock <= 0) {
      this.showToast(`Size ${size} is currently out of stock.`, 'error');
      return false;
    }

    // Check if same item (same product ID, same size, same color) already exists
    const existingIndex = this.cart.findIndex(
      item => item.productId === productId && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      const currentQty = this.cart[existingIndex].quantity;
      if (currentQty + quantity > availableStock) {
        this.showToast(`Only ${availableStock} items available in size ${size}.`, 'warning');
        this.cart[existingIndex].quantity = availableStock;
      } else {
        this.cart[existingIndex].quantity += quantity;
        this.showToast(`Updated "${product.name}" quantity (${this.cart[existingIndex].quantity}).`, 'success');
      }
    } else {
      if (quantity > availableStock) {
        quantity = availableStock;
      }
      this.cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        size: size,
        color: color || (product.colors && product.colors[0] ? product.colors[0].name : 'Default'),
        quantity: quantity,
        maxStock: availableStock
      });
      this.showToast(`Added "${product.name}" (${size}) to cart.`, 'success');
    }

    this.saveCart();
    this.openDrawer();
    return true;
  }

  updateQuantity(index, newQty) {
    if (index < 0 || index >= this.cart.length) return;
    const item = this.cart[index];
    const product = typeof getProductById === 'function' ? getProductById(item.productId) : null;
    const maxStock = product && product.stock && product.stock[item.size] !== undefined 
      ? product.stock[item.size] 
      : item.maxStock || 10;

    if (newQty <= 0) {
      this.removeFromCart(index);
      return;
    }

    if (newQty > maxStock) {
      this.showToast(`Maximum ${maxStock} available for size ${item.size}.`, 'warning');
      item.quantity = maxStock;
    } else {
      item.quantity = newQty;
    }

    this.saveCart();
  }

  updateVariant(index, newSize, newColor) {
    if (index < 0 || index >= this.cart.length) return;
    const item = this.cart[index];
    const product = typeof getProductById === 'function' ? getProductById(item.productId) : null;

    if (newSize) {
      const availableStock = product && product.stock && product.stock[newSize] !== undefined
        ? product.stock[newSize]
        : 10;

      if (availableStock <= 0) {
        this.showToast(`Size ${newSize} is out of stock.`, 'error');
        return;
      }
      item.size = newSize;
      item.maxStock = availableStock;
      if (item.quantity > availableStock) {
        item.quantity = availableStock;
      }
    }

    if (newColor) {
      item.color = newColor;
    }

    this.showToast('Item option updated.', 'info');
    this.saveCart();
  }

  removeFromCart(index) {
    if (index < 0 || index >= this.cart.length) return;
    const item = this.cart[index];
    this.cart.splice(index, 1);
    this.saveCart();
    this.showToast(`Removed "${item.name}" from cart.`, 'info');
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  applyCouponCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    if (cleanCode === 'VIBE10') {
      const coupon = { code: 'VIBE10', type: 'percentage', value: 10, description: '10% Off Streetwear Drop' };
      this.saveCoupon(coupon);
      return { success: true, message: 'Coupon "VIBE10" applied! 10% discount added.' };
    } else if (cleanCode === 'WELCOME50') {
      const coupon = { code: 'WELCOME50', type: 'fixed', value: 50, description: '৳50 Off First Drop' };
      this.saveCoupon(coupon);
      return { success: true, message: 'Coupon "WELCOME50" applied! ৳50 discount added.' };
    } else {
      return { success: false, message: 'Invalid or expired promo code.' };
    }
  }

  removeCoupon() {
    this.saveCoupon(null);
    this.showToast('Promo code removed.', 'info');
  }

  getCalculations(district = 'Dhaka') {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Delivery logic: ৳100 as standard (prompt specifies "Delivery: ৳100"), 
    // Free delivery over ৳2000
    let delivery = subtotal > 0 ? (subtotal >= 2000 ? 0 : DEFAULT_DELIVERY_CHARGE) : 0;
    
    let discount = 0;
    if (this.appliedCoupon && subtotal > 0) {
      if (this.appliedCoupon.type === 'percentage') {
        discount = Math.round((subtotal * this.appliedCoupon.value) / 100);
      } else if (this.appliedCoupon.type === 'fixed') {
        discount = Math.min(this.appliedCoupon.value, subtotal);
      }
    }

    const total = Math.max(0, subtotal + delivery - discount);

    return {
      subtotal,
      delivery,
      discount,
      total,
      itemCount: this.getItemCount(),
      coupon: this.appliedCoupon,
      isFreeDelivery: delivery === 0 && subtotal >= 2000
    };
  }

  updateBadges() {
    const count = this.getItemCount();
    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = count;
      if (count > 0) {
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }
    });
  }

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.renderDrawerContent();
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  renderDrawerContent() {
    const container = document.getElementById('cartDrawerItems');
    const footerContainer = document.getElementById('cartDrawerFooter');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-state">
          <div class="empty-cart-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h4>YOUR CART IS EMPTY</h4>
          <p>Discover our latest heavy-duty drops and elevate your everyday style.</p>
          <a href="shop.html" class="btn btn-primary" onclick="cartEngine.closeDrawer()">EXPLORE COLLECTION</a>
        </div>
      `;
      if (footerContainer) {
        footerContainer.style.display = 'none';
      }
      return;
    }

    if (footerContainer) {
      footerContainer.style.display = 'block';
    }

    const calcs = this.getCalculations();

    container.innerHTML = this.cart.map((item, index) => `
      <div class="drawer-cart-item">
        <div class="drawer-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="drawer-item-info">
          <div class="drawer-item-header">
            <h5 class="drawer-item-title">${item.name}</h5>
            <button class="drawer-remove-btn" onclick="cartEngine.removeFromCart(${index})" title="Remove">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="drawer-item-meta">
            <span class="badge-tag">Size: ${item.size}</span>
            <span class="badge-tag">${item.color}</span>
          </div>
          <div class="drawer-item-footer">
            <div class="qty-stepper qty-stepper-sm">
              <button onclick="cartEngine.updateQuantity(${index}, ${item.quantity - 1})">-</button>
              <span>${item.quantity}</span>
              <button onclick="cartEngine.updateQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
            <div class="drawer-item-price">৳${item.price * item.quantity}</div>
          </div>
        </div>
      </div>
    `).join('');

    const drawerSubtotal = document.getElementById('drawerSubtotal');
    if (drawerSubtotal) {
      drawerSubtotal.textContent = `৳${calcs.subtotal}`;
    }
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d8ff00" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }
}

// Global instance
const cartEngine = new CartEngine();

document.addEventListener('DOMContentLoaded', () => {
  cartEngine.updateBadges();

  // Attach overlay close listener
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => cartEngine.closeDrawer());
  }

  const closeBtn = document.getElementById('closeCartDrawer');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => cartEngine.closeDrawer());
  }

  // Hook cart open buttons
  document.querySelectorAll('.open-cart-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cartEngine.openDrawer();
    });
  });
});
