/**
 * VibeXwear - Product Detail Page Controller
 * Manages gallery view, size/color selectors, live stock indicator, and cart actions.
 */

class ProductDetailController {
  constructor() {
    this.product = null;
    this.selectedSize = null;
    this.selectedColor = null;
    this.quantity = 1;

    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'vx-001';
    this.product = getProductById(productId) || PRODUCTS_DATA[0];

    // Set initial size (first with stock)
    if (this.product.sizes && this.product.sizes.length > 0) {
      this.selectedSize = this.product.sizes.find(s => (this.product.stock?.[s] || 0) > 0) || this.product.sizes[0];
    }

    // Set initial color
    if (this.product.colors && this.product.colors.length > 0) {
      this.selectedColor = this.product.colors[0].name;
    }

    this.render();
    this.renderRelatedProducts();
  }

  render() {
    const p = this.product;
    document.title = `${p.name} | VibeXwear`;

    // Breadcrumbs
    const bcCat = document.getElementById('bcCategory');
    const bcName = document.getElementById('bcProductName');
    if (bcCat) {
      bcCat.textContent = p.category;
      bcCat.href = `shop.html?cat=${encodeURIComponent(p.category)}`;
    }
    if (bcName) bcName.textContent = p.name;

    // Gallery
    const mainImg = document.getElementById('detailMainImage');
    if (mainImg) {
      mainImg.src = p.image;
      mainImg.alt = p.name;
    }

    const thumbsContainer = document.getElementById('detailThumbnails');
    if (thumbsContainer) {
      const allImages = p.images && p.images.length > 0 ? p.images : [p.image];
      thumbsContainer.innerHTML = allImages.map((img, i) => `
        <div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="productDetailCtrl.switchImage('${img}', this)">
          <img src="${img}" alt="Thumbnail ${i + 1}">
        </div>
      `).join('');
    }

    // Title & Category
    const catEl = document.getElementById('detailCategory');
    if (catEl) catEl.textContent = p.category;

    const titleEl = document.getElementById('detailTitle');
    if (titleEl) titleEl.textContent = p.name;

    // Price
    const priceEl = document.getElementById('detailPrice');
    if (priceEl) priceEl.textContent = `৳${p.price}`;

    const oldPriceEl = document.getElementById('detailOriginalPrice');
    if (oldPriceEl) {
      if (p.originalPrice) {
        oldPriceEl.textContent = `৳${p.originalPrice}`;
        oldPriceEl.style.display = 'inline';
      } else {
        oldPriceEl.style.display = 'none';
      }
    }

    const discountBadgeEl = document.getElementById('detailDiscountBadge');
    if (discountBadgeEl) {
      if (p.discount) {
        discountBadgeEl.textContent = `SAVE ${p.discount}%`;
        discountBadgeEl.style.display = 'inline-block';
      } else {
        discountBadgeEl.style.display = 'none';
      }
    }

    // Description & Fabric
    const descEl = document.getElementById('detailDescription');
    if (descEl) descEl.textContent = p.description;

    const fabricEl = document.getElementById('detailFabricText');
    if (fabricEl) fabricEl.textContent = p.fabric;

    // Colors
    const colorsContainer = document.getElementById('detailColorOptions');
    const colorLabel = document.getElementById('selectedColorLabel');
    if (colorLabel) colorLabel.textContent = this.selectedColor;

    if (colorsContainer) {
      colorsContainer.innerHTML = (p.colors || []).map(c => `
        <button class="color-option-btn ${c.name === this.selectedColor ? 'active' : ''}" 
          onclick="productDetailCtrl.selectColor('${c.name}', this)">
          <span class="color-dot" style="background-color: ${c.hex}"></span>
          ${c.name}
        </button>
      `).join('');
    }

    // Sizes
    this.renderSizes();

    // Stock Status
    this.updateStockStatus();

    // Stepper
    const qtyEl = document.getElementById('detailQty');
    if (qtyEl) qtyEl.textContent = this.quantity;
  }

  renderSizes() {
    const p = this.product;
    const sizesContainer = document.getElementById('detailSizeOptions');
    const sizeLabel = document.getElementById('selectedSizeLabel');
    if (sizeLabel) sizeLabel.textContent = this.selectedSize;

    if (sizesContainer) {
      sizesContainer.innerHTML = (p.sizes || []).map(s => {
        const qty = p.stock && p.stock[s] !== undefined ? p.stock[s] : 10;
        const isOutOfStock = qty <= 0;
        return `
          <button class="size-btn ${s === this.selectedSize ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}"
            ${isOutOfStock ? 'disabled' : ''}
            onclick="productDetailCtrl.selectSize('${s}', this)">
            ${s}
          </button>
        `;
      }).join('');
    }
  }

  switchImage(imgSrc, thumbEl) {
    const mainImg = document.getElementById('detailMainImage');
    if (mainImg) mainImg.src = imgSrc;

    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  }

  selectColor(colorName, btnEl) {
    this.selectedColor = colorName;
    document.querySelectorAll('.color-option-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const colorLabel = document.getElementById('selectedColorLabel');
    if (colorLabel) colorLabel.textContent = colorName;
  }

  selectSize(size, btnEl) {
    this.selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const sizeLabel = document.getElementById('selectedSizeLabel');
    if (sizeLabel) sizeLabel.textContent = size;

    // Reset quantity if it exceeds available stock for the new size
    const available = this.product.stock?.[size] || 0;
    if (this.quantity > available && available > 0) {
      this.quantity = available;
      const qtyEl = document.getElementById('detailQty');
      if (qtyEl) qtyEl.textContent = this.quantity;
    }

    this.updateStockStatus();
  }

  updateStockStatus() {
    const statusContainer = document.getElementById('detailStockIndicator');
    if (!statusContainer) return;

    const available = this.product.stock?.[this.selectedSize] || 0;
    const addBtn = document.getElementById('detailAddToCartBtn');
    const buyBtn = document.getElementById('detailBuyNowBtn');

    if (available <= 0) {
      statusContainer.innerHTML = `
        <span class="badge-stock out-of-stock">
          ✕ Out of Stock in Size ${this.selectedSize}
        </span>
      `;
      if (addBtn) addBtn.disabled = true;
      if (buyBtn) buyBtn.disabled = true;
    } else if (available <= 3) {
      statusContainer.innerHTML = `
        <span class="badge-stock low-stock">
          ⚡ Hurry! Only ${available} left in Size ${this.selectedSize}
        </span>
      `;
      if (addBtn) addBtn.disabled = false;
      if (buyBtn) buyBtn.disabled = false;
    } else {
      statusContainer.innerHTML = `
        <span class="badge-stock in-stock">
          ✓ In Stock (${available} units ready to ship)
        </span>
      `;
      if (addBtn) addBtn.disabled = false;
      if (buyBtn) buyBtn.disabled = false;
    }
  }

  adjustQuantity(delta) {
    const available = this.product.stock?.[this.selectedSize] || 10;
    if (available <= 0) return;

    const newQty = this.quantity + delta;
    if (newQty < 1) return;

    if (newQty > available) {
      cartEngine.showToast(`Only ${available} items in stock for Size ${this.selectedSize}.`, 'warning');
      return;
    }

    this.quantity = newQty;
    const qtyEl = document.getElementById('detailQty');
    if (qtyEl) qtyEl.textContent = this.quantity;
  }

  addToCart() {
    if (!this.selectedSize) {
      cartEngine.showToast('Please select a size first.', 'warning');
      return;
    }
    cartEngine.addToCart(this.product.id, this.selectedSize, this.selectedColor, this.quantity);
  }

  buyNow() {
    if (!this.selectedSize) {
      cartEngine.showToast('Please select a size first.', 'warning');
      return;
    }
    const success = cartEngine.addToCart(this.product.id, this.selectedSize, this.selectedColor, this.quantity);
    if (success) {
      window.location.href = 'checkout.html';
    }
  }

  renderRelatedProducts() {
    const container = document.getElementById('relatedProductsGrid');
    if (!container) return;

    const related = PRODUCTS_DATA
      .filter(p => p.id !== this.product.id)
      .slice(0, 4);

    container.innerHTML = related.map(createProductCardHTML).join('');
  }
}

// Accordion toggle helper
function toggleAccordion(header) {
  const item = header.parentElement;
  item.classList.toggle('open');
}

let productDetailCtrl = null;
document.addEventListener('DOMContentLoaded', () => {
  productDetailCtrl = new ProductDetailController();
});
