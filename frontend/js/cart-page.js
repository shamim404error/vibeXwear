/**
 * VibeXwear - Full Cart Page Controller
 * Handles table rendering, size/color variant switches, quantity updates, and calculations.
 */

class CartPageController {
  constructor() {
    this.init();
  }

  init() {
    this.render();

    // Listen to custom cart updates from cartEngine
    window.addEventListener('cartUpdated', () => {
      this.render();
    });

    const couponForm = document.getElementById('cartCouponForm');
    if (couponForm) {
      couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('couponCodeInput');
        const res = cartEngine.applyCouponCode(input?.value);
        if (res.success) {
          cartEngine.showToast(res.message, 'success');
        } else {
          cartEngine.showToast(res.message, 'error');
        }
      });
    }
  }

  render() {
    const items = cartEngine.getItems();
    const container = document.getElementById('cartItemsList');
    const emptyState = document.getElementById('cartEmptyContainer');
    const layoutWrapper = document.getElementById('cartContentLayout');

    if (!container || !emptyState || !layoutWrapper) return;

    if (items.length === 0) {
      layoutWrapper.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    layoutWrapper.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = items.map((item, index) => {
      const product = typeof getProductById === 'function' ? getProductById(item.productId) : null;
      
      // Sizes dropdown
      const sizeOptions = (product?.sizes || ['S', 'M', 'L', 'XL']).map(s => `
        <option value="${s}" ${s === item.size ? 'selected' : ''}>Size: ${s}</option>
      `).join('');

      // Colors dropdown
      const colorOptions = (product?.colors || [{ name: item.color }]).map(c => `
        <option value="${c.name}" ${c.name === item.color ? 'selected' : ''}>Color: ${c.name}</option>
      `).join('');

      return `
        <div class="cart-item-row" style="display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--border-subtle); align-items: center; flex-wrap: wrap;">
          <!-- Image -->
          <div style="width: 88px; height: 104px; background: #121316; border-radius: var(--radius-sm); overflow: hidden; flex-shrink: 0;">
            <a href="product.html?id=${item.productId}">
              <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </a>
          </div>

          <!-- Product Title & Dropdown Variants -->
          <div style="flex: 1; min-width: 200px;">
            <a href="product.html?id=${item.productId}" style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">
              ${item.name}
            </a>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin: 4px 0 10px;">
              Unit Price: <span style="color: var(--text-primary); font-weight: 700;">৳${item.price}</span>
            </div>
            
            <!-- Variant Dropdowns -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <select class="form-control" style="padding: 6px 10px; font-size: 0.8rem; width: auto;" 
                onchange="cartEngine.updateVariant(${index}, this.value, null)">
                ${sizeOptions}
              </select>
              <select class="form-control" style="padding: 6px 10px; font-size: 0.8rem; width: auto;" 
                onchange="cartEngine.updateVariant(${index}, null, this.value)">
                ${colorOptions}
              </select>
            </div>
          </div>

          <!-- Quantity Stepper -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="qty-stepper">
              <button onclick="cartEngine.updateQuantity(${index}, ${item.quantity - 1})">-</button>
              <span>${item.quantity}</span>
              <button onclick="cartEngine.updateQuantity(${index}, ${item.quantity + 1})">+</button>
            </div>
          </div>

          <!-- Subtotal & Remove -->
          <div style="text-align: right; min-width: 100px;">
            <div style="font-size: 1.15rem; font-weight: 900; color: var(--accent-primary);">
              ৳${item.price * item.quantity}
            </div>
            <button onclick="cartEngine.removeFromCart(${index})" style="margin-top: 6px; font-size: 0.78rem; color: var(--text-muted); text-decoration: underline; background: none; border: none; cursor: pointer;">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.renderSummary();
  }

  renderSummary() {
    const calcs = cartEngine.getCalculations();

    const subtotalEl = document.getElementById('cartSummarySubtotal');
    const deliveryEl = document.getElementById('cartSummaryDelivery');
    const discountRow = document.getElementById('cartSummaryDiscountRow');
    const discountEl = document.getElementById('cartSummaryDiscount');
    const totalEl = document.getElementById('cartSummaryTotal');

    if (subtotalEl) subtotalEl.textContent = `৳${calcs.subtotal}`;
    
    if (deliveryEl) {
      if (calcs.delivery === 0 && calcs.isFreeDelivery) {
        deliveryEl.innerHTML = `<span style="color: var(--status-in-stock); font-weight: 700;">FREE (Promo)</span>`;
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
}

let cartPageCtrl = null;
document.addEventListener('DOMContentLoaded', () => {
  cartPageCtrl = new CartPageController();
});
