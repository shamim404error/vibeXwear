/**
 * VibeXwear - Checkout Controller
 * Validates shipping information, handles order calculations, generates Order IDs (e.g., #VX1001),
 * persists orders locally for immediate Admin sync, and prepares for future backend API handoff.
 */

class CheckoutController {
  constructor() {
    this.districts = [
      'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 
      'Barisal', 'Rangpur', 'Mymensingh', 'Gazipur', 'Narayanganj', 
      'Comilla', 'Bogra', 'Jessore', 'Cox\'s Bazar'
    ];
    this.init();
  }

  init() {
    this.populateDistricts();
    this.renderOrderSummary();
    this.bindEvents();
  }

  populateDistricts() {
    const select = document.getElementById('checkoutDistrict');
    if (!select) return;

    select.innerHTML = '<option value="">Select District</option>' + 
      this.districts.map(d => `<option value="${d}" ${d === 'Dhaka' ? 'selected' : ''}>${d}</option>`).join('');
  }

  renderOrderSummary() {
    const items = cartEngine.getItems();
    const container = document.getElementById('checkoutItemsList');
    const emptyNotice = document.getElementById('checkoutEmptyNotice');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    if (!container) return;

    if (items.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'block';
      if (placeOrderBtn) placeOrderBtn.disabled = true;
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No items in cart.</p>';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    if (placeOrderBtn) placeOrderBtn.disabled = false;

    container.innerHTML = items.map(item => `
      <div style="display: flex; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-subtle);">
        <div style="width: 56px; height: 64px; background: #121316; border-radius: var(--radius-xs); overflow: hidden; flex-shrink: 0;">
          <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
          <h5 style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); line-height: 1.3;">
            ${item.name}
          </h5>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Size: <strong style="color: var(--text-secondary);">${item.size}</strong> | 
            Color: <strong style="color: var(--text-secondary);">${item.color}</strong> | 
            Qty: <strong style="color: var(--text-secondary);">${item.quantity}</strong>
          </div>
        </div>
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary);">
          ৳${item.price * item.quantity}
        </div>
      </div>
    `).join('');

    const district = document.getElementById('checkoutDistrict')?.value || 'Dhaka';
    const calcs = cartEngine.getCalculations(district);

    const subtotalEl = document.getElementById('checkoutSubtotal');
    const deliveryEl = document.getElementById('checkoutDelivery');
    const discountRow = document.getElementById('checkoutDiscountRow');
    const discountEl = document.getElementById('checkoutDiscount');
    const totalEl = document.getElementById('checkoutTotal');

    if (subtotalEl) subtotalEl.textContent = `৳${calcs.subtotal}`;
    
    if (deliveryEl) {
      if (calcs.delivery === 0 && calcs.isFreeDelivery) {
        deliveryEl.innerHTML = `<span style="color: var(--status-in-stock); font-weight: 700;">FREE (Drop Promo)</span>`;
      } else {
        deliveryEl.textContent = `৳${calcs.delivery}`;
      }
    }

    if (discountRow && discountEl) {
      if (calcs.discount > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-৳${calcs.discount}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (totalEl) totalEl.textContent = `৳${calcs.total}`;
  }

  bindEvents() {
    // District change listener
    const districtSelect = document.getElementById('checkoutDistrict');
    if (districtSelect) {
      districtSelect.addEventListener('change', () => {
        this.renderOrderSummary();
      });
    }

    // Checkout Form Submission
    const form = document.getElementById('checkoutForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processOrder();
      });
    }
  }

  generateOrderId() {
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem('vibexwear_orders') || '[]');
    } catch (e) {
      orders = [];
    }
    const nextNum = 1001 + orders.length;
    return `VX${nextNum}`;
  }

  processOrder() {
    const items = cartEngine.getItems();
    if (items.length === 0) {
      cartEngine.showToast('Your cart is empty. Please add products first.', 'error');
      return;
    }

    // Form values
    const fullName = document.getElementById('checkoutFullName')?.value.trim();
    const phone = document.getElementById('checkoutPhone')?.value.trim();
    const district = document.getElementById('checkoutDistrict')?.value;
    const area = document.getElementById('checkoutArea')?.value.trim();
    const address = document.getElementById('checkoutAddress')?.value.trim();
    const notes = document.getElementById('checkoutNotes')?.value.trim() || '';

    // Validation
    if (!fullName || fullName.length < 3) {
      cartEngine.showToast('Please enter your full name (minimum 3 characters).', 'warning');
      document.getElementById('checkoutFullName')?.focus();
      return;
    }

    // Bangladeshi phone validation (starts with 01 and has 11 digits)
    const phoneRegex = /^01[3-9]\d{8}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      cartEngine.showToast('Please enter a valid 11-digit Bangladeshi mobile number (e.g., 01712345678).', 'warning');
      document.getElementById('checkoutPhone')?.focus();
      return;
    }

    if (!district) {
      cartEngine.showToast('Please select your delivery district.', 'warning');
      document.getElementById('checkoutDistrict')?.focus();
      return;
    }

    if (!area) {
      cartEngine.showToast('Please specify your area / thana.', 'warning');
      document.getElementById('checkoutArea')?.focus();
      return;
    }

    if (!address || address.length < 8) {
      cartEngine.showToast('Please enter your detailed house/street delivery address.', 'warning');
      document.getElementById('checkoutAddress')?.focus();
      return;
    }

    // Button loading state
    const submitBtn = document.getElementById('placeOrderBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display: inline-block; animation: spin 1s infinite linear;">↻</span>
        PROCESSING ORDER...
      `;
    }

    // Calculations
    const calcs = cartEngine.getCalculations(district);
    const orderId = this.generateOrderId();

    // Construct Order Payload
    const newOrder = {
      orderId: orderId,
      customer: {
        name: fullName,
        phone: cleanPhone,
        district: district,
        area: area,
        fullAddress: address,
        notes: notes
      },
      products: items.map(item => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      subtotal: calcs.subtotal,
      deliveryCharge: calcs.delivery,
      discount: calcs.discount,
      total: calcs.total,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Save to local orders list for immediate Admin viewing
    try {
      const orders = JSON.parse(localStorage.getItem('vibexwear_orders') || '[]');
      orders.unshift(newOrder);
      localStorage.setItem('vibexwear_orders', JSON.stringify(orders));
      localStorage.setItem('vibexwear_latest_order', JSON.stringify(newOrder));
    } catch (e) {
      console.error('Failed to save order to localStorage', e);
    }

    // Simulated short network delay for authentic e-commerce feel
    setTimeout(() => {
      // Clear shopping cart
      cartEngine.clearCart();

      // Redirect to Order Confirmation
      window.location.href = `order-confirmation.html?orderId=${orderId}`;
    }, 600);
  }
}

let checkoutCtrl = null;
document.addEventListener('DOMContentLoaded', () => {
  checkoutCtrl = new CheckoutController();
});
