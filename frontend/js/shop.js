/**
 * VibeXwear - Shop Engine
 * Handles search, multi-faceted filtering, sorting, and dynamic grid updates.
 */

class ShopController {
  constructor() {
    this.products = [...PRODUCTS_DATA];
    this.filteredProducts = [...PRODUCTS_DATA];
    this.currentCategory = 'All';
    this.currentSort = 'featured';
    this.searchQuery = '';
    this.maxPrice = 1500;
    this.selectedSizes = new Set();
    this.inStockOnly = false;

    this.init();
  }

  init() {
    this.parseURLParams();
    this.bindEvents();
    this.applyFilters();
  }

  parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    const sort = urlParams.get('sort');
    const search = urlParams.get('search');

    if (cat) this.currentCategory = cat;
    if (sort) this.currentSort = sort;
    if (search) this.searchQuery = search;

    // Set UI input values based on params
    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect && sort) sortSelect.value = sort;

    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput && search) searchInput.value = search;
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.applyFilters();
      });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.applyFilters();
      });
    }

    // Price range slider
    const priceSlider = document.getElementById('priceRangeSlider');
    const priceDisplay = document.getElementById('priceRangeVal');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        this.maxPrice = Number(e.target.value);
        if (priceDisplay) priceDisplay.textContent = `৳${this.maxPrice}`;
        this.applyFilters();
      });
    }

    // In Stock Only checkbox
    const inStockCheck = document.getElementById('inStockOnlyCheck');
    if (inStockCheck) {
      inStockCheck.addEventListener('change', (e) => {
        this.inStockOnly = e.target.checked;
        this.applyFilters();
      });
    }

    // Category options
    document.querySelectorAll('.filter-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = btn.dataset.category;
        this.setCategory(cat);
      });
    });

    // Size filter pills
    document.querySelectorAll('.size-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const size = pill.dataset.size;
        if (this.selectedSizes.has(size)) {
          this.selectedSizes.delete(size);
          pill.classList.remove('active');
        } else {
          this.selectedSizes.add(size);
          pill.classList.add('active');
        }
        this.applyFilters();
      });
    });

    // Reset filters button
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  setCategory(category) {
    this.currentCategory = category;
    document.querySelectorAll('.filter-cat-btn').forEach(b => {
      if (b.dataset.category === category) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    this.applyFilters();
  }

  resetFilters() {
    this.currentCategory = 'All';
    this.currentSort = 'featured';
    this.searchQuery = '';
    this.maxPrice = 1500;
    this.selectedSizes.clear();
    this.inStockOnly = false;

    // Reset UI elements
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    const priceSlider = document.getElementById('priceRangeSlider');
    const priceDisplay = document.getElementById('priceRangeVal');
    if (priceSlider) {
      priceSlider.value = 1500;
      if (priceDisplay) priceDisplay.textContent = '৳1500';
    }

    const inStockCheck = document.getElementById('inStockOnlyCheck');
    if (inStockCheck) inStockCheck.checked = false;

    document.querySelectorAll('.filter-cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'All');
    });

    document.querySelectorAll('.size-filter-pill').forEach(p => p.classList.remove('active'));

    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.products];

    // 1. Category Filter
    if (this.currentCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // 2. Search Query
    if (this.searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        p.category.toLowerCase().includes(this.searchQuery)
      );
    }

    // 3. Price Filter
    result = result.filter(p => p.price <= this.maxPrice);

    // 4. In Stock Filter
    if (this.inStockOnly) {
      result = result.filter(p => getTotalStock(p) > 0);
    }

    // 5. Size Filter
    if (this.selectedSizes.size > 0) {
      result = result.filter(p => {
        return Array.from(this.selectedSizes).some(size => {
          return p.stock && p.stock[size] > 0;
        });
      });
    }

    // 6. Sorting
    switch (this.currentSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'bestseller':
        result.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    this.filteredProducts = result;
    this.render();
  }

  render() {
    const grid = document.getElementById('shopProductsGrid');
    const countDisplay = document.getElementById('shopResultsCount');
    if (!grid) return;

    if (countDisplay) {
      countDisplay.textContent = `Showing ${this.filteredProducts.length} ${this.filteredProducts.length === 1 ? 'Product' : 'Products'}`;
    }

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-medium);">
          <div style="font-size: 2.5rem; margin-bottom: 12px; color: var(--text-muted);">⚡</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; text-transform: uppercase;">NO PRODUCTS FOUND</h3>
          <p style="color: var(--text-secondary); max-width: 380px; margin: 8px auto 20px; font-size: 0.9rem;">
            We couldn't find any streetwear pieces matching your active filters. Try adjusting your search or clearing filters.
          </p>
          <button class="btn btn-primary" onclick="shopCtrl.resetFilters()">RESET ALL FILTERS</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredProducts.map(createProductCardHTML).join('');
  }
}

let shopCtrl = null;
document.addEventListener('DOMContentLoaded', () => {
  shopCtrl = new ShopController();
});
