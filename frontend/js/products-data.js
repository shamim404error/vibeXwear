/**
 * VibeXwear - Product Catalog Data
 * Initial dataset for frontend rendering and future MongoDB seeding.
 */
const PRODUCTS_DATA = [
  {
    id: 'vx-001',
    name: 'Black Oversized Heavyweight T-Shirt',
    slug: 'black-oversized-heavyweight-tee',
    category: 'Oversized Tees',
    price: 799,
    originalPrice: 999,
    discount: 20, // 20% OFF
    image: 'assets/images/tee-black-oversized.svg',
    images: [
      'assets/images/tee-black-oversized.svg',
      'assets/images/tee-dusk-noir.svg'
    ],
    description: 'The defining silhouette of modern streetwear. Engineered with high-density 240 GSM combed cotton for a structural drop-shoulder drape that maintains its shape wash after wash.',
    fabric: '240 GSM 100% Super-Combed Cotton. Bio-washed & silicon softened. 1x1 heavy ribbed crewneck collar with reinforced twin-needle stitching.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Jet Black', hex: '#121316' },
      { name: 'Raw Bone', hex: '#ede8df' },
      { name: 'Maroon', hex: '#361118' }
    ],
    stock: { S: 5, M: 10, L: 8, XL: 2, XXL: 0 },
    featured: true,
    newArrival: false,
    bestSeller: true,
    rating: 4.9,
    reviewsCount: 84
  },
  {
    id: 'vx-002',
    name: 'Cyber Matrix Graphic Oversized Tee',
    slug: 'cyber-matrix-graphic-oversized-tee',
    category: 'Graphic Tees',
    price: 849,
    originalPrice: 1099,
    discount: 23,
    image: 'assets/images/tee-cyber-matrix.svg',
    images: [
      'assets/images/tee-cyber-matrix.svg',
      'assets/images/tee-electric-acid.svg'
    ],
    description: 'Futuristic avant-garde streetwear featuring high-definition cyberpunk typography and technical circuitry screenprint on premium heavyweight cotton.',
    fabric: '240 GSM Luxury Ring-Spun Cotton. High-durability plastisol print with zero cracking. Pre-shrunk to prevent size variations.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian Black', hex: '#18191d' },
      { name: 'Electric Lime', hex: '#d8ff00' }
    ],
    stock: { S: 4, M: 7, L: 12, XL: 3 },
    featured: true,
    newArrival: true,
    bestSeller: false,
    rating: 4.8,
    reviewsCount: 39
  },
  {
    id: 'vx-003',
    name: 'Acid Washed Vintage Drop-Shoulder Tee',
    slug: 'acid-washed-vintage-tee',
    category: 'Acid Wash',
    price: 899,
    originalPrice: 1199,
    discount: 25,
    image: 'assets/images/tee-acid-washed.svg',
    images: [
      'assets/images/tee-acid-washed.svg',
      'assets/images/tee-black-oversized.svg'
    ],
    description: 'Each piece undergoes a specialized individual mineral acid wash process, producing a unique distressed marble patina with authentic 90s vintage grunge appeal.',
    fabric: '260 GSM Heavy Mineral-Washed Cotton. Distressed enzyme bath finish. Blind stitched cuffs and raw aesthetic appeal.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Vintage Slate', hex: '#2b2d33' },
      { name: 'Charcoal Black', hex: '#1c1e22' }
    ],
    stock: { S: 3, M: 6, L: 5, XL: 1 },
    featured: true,
    newArrival: false,
    bestSeller: true,
    rating: 5.0,
    reviewsCount: 62
  },
  {
    id: 'vx-004',
    name: 'Raw Bone Minimalist Boxy Fit Tee',
    slug: 'raw-bone-minimalist-tee',
    category: 'Heavyweight Basics',
    price: 749,
    originalPrice: 899,
    discount: 16,
    image: 'assets/images/tee-raw-bone.svg',
    images: [
      'assets/images/tee-raw-bone.svg',
      'assets/images/tee-dusk-noir.svg'
    ],
    description: 'Understated elegance. Unbleached organic cotton in raw bone tone with clean minimal typographic coordinates printed on the lower hemline.',
    fabric: '220 GSM Natural Unbleached Combed Cotton. Ultra-soft breathable feel with dense tight-weave knit structure.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Raw Bone', hex: '#ede8df' },
      { name: 'Jet Black', hex: '#121316' },
      { name: 'Forest Sage', hex: '#232d26' }
    ],
    stock: { S: 8, M: 14, L: 9, XL: 4, XXL: 2 },
    featured: false,
    newArrival: true,
    bestSeller: false,
    rating: 4.7,
    reviewsCount: 28
  },
  {
    id: 'vx-005',
    name: 'Metropolis Shibuya Kanji Street Tee',
    slug: 'metropolis-shibuya-kanji-tee',
    category: 'Graphic Tees',
    price: 849,
    originalPrice: 1050,
    discount: 19,
    image: 'assets/images/tee-metropolis-kanji.svg',
    images: [
      'assets/images/tee-metropolis-kanji.svg',
      'assets/images/tee-cyber-matrix.svg'
    ],
    description: 'Inspired by Tokyo underground night clubs and neon alleys of Shibuya. Bold vertical Japanese typography paired with technical grid lines.',
    fabric: '240 GSM Premium Combed Cotton. Discharge print for a breathable, zero-handfeel graphic surface.',
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Midnight Black', hex: '#141416' },
      { name: 'Chalk White', hex: '#f0f0f2' }
    ],
    stock: { M: 9, L: 11, XL: 5 },
    featured: false,
    newArrival: true,
    bestSeller: true,
    rating: 4.9,
    reviewsCount: 51
  },
  {
    id: 'vx-006',
    name: 'Nocturne Maroon Luxury Heavyweight Tee',
    slug: 'nocturne-maroon-luxury-tee',
    category: 'Heavyweight Basics',
    price: 949,
    originalPrice: 1299,
    discount: 27,
    image: 'assets/images/tee-maroon-burgundy.svg',
    images: [
      'assets/images/tee-maroon-burgundy.svg',
      'assets/images/tee-black-oversized.svg'
    ],
    description: 'Deep royal burgundy dyed with premium colorfast reactive dyes. Designed for the nocturnal creative who values uncompromising luxury in everyday wear.',
    fabric: '260 GSM Ultra-Dense French Loop Cotton. Velvet handfeel with heavy structured shoulders.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Deep Wine', hex: '#361118' },
      { name: 'Jet Black', hex: '#121316' }
    ],
    stock: { S: 2, M: 4, L: 6, XL: 2 },
    featured: true,
    newArrival: false,
    bestSeller: false,
    rating: 4.8,
    reviewsCount: 31
  },
  {
    id: 'vx-007',
    name: 'Kinetic Acid Industrial Edition Tee',
    slug: 'kinetic-acid-industrial-tee',
    category: 'Graphic Tees',
    price: 799,
    originalPrice: 950,
    discount: 15,
    image: 'assets/images/tee-electric-acid.svg',
    images: [
      'assets/images/tee-electric-acid.svg',
      'assets/images/tee-cyber-matrix.svg'
    ],
    description: 'High-visibility industrial streetwear aesthetic with neon barcode detailing and hazardous warning typographic treatments.',
    fabric: '230 GSM Compact Combed Cotton. Glow-reactive screenprint accents.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Jet Black', hex: '#0f1115' },
      { name: 'Electric Lime', hex: '#d8ff00' }
    ],
    stock: { S: 6, M: 8, L: 4, XL: 0 },
    featured: false,
    newArrival: true,
    bestSeller: false,
    rating: 4.6,
    reviewsCount: 19
  },
  {
    id: 'vx-008',
    name: 'Dusk Noir Boxy Essential Tee',
    slug: 'dusk-noir-boxy-essential-tee',
    category: 'Oversized Tees',
    price: 699,
    originalPrice: 850,
    discount: 18,
    image: 'assets/images/tee-dusk-noir.svg',
    images: [
      'assets/images/tee-dusk-noir.svg',
      'assets/images/tee-black-oversized.svg'
    ],
    description: 'Clean, versatile, and relaxed. The quintessential daily driver for any streetwear wardrobe with a boxy cut and dropped shoulders.',
    fabric: '220 GSM 100% Combed Cotton. Anti-pilling silicone finish with reinforced taped shoulder seams.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Pitch Black', hex: '#15171a' },
      { name: 'Heather Grey', hex: '#717582' }
    ],
    stock: { S: 10, M: 16, L: 12, XL: 6, XXL: 3 },
    featured: false,
    newArrival: false,
    bestSeller: true,
    rating: 4.8,
    reviewsCount: 76
  }
];

// Helper functions for catalog queries
function getProductById(id) {
  return PRODUCTS_DATA.find(p => p.id === id || p.slug === id);
}

function getTotalStock(product) {
  if (!product || !product.stock) return 0;
  return Object.values(product.stock).reduce((acc, curr) => acc + curr, 0);
}

function getStockStatus(product, size = null) {
  if (!product || !product.stock) return { status: 'out_of_stock', label: 'Out of Stock', class: 'out-of-stock' };
  
  if (size) {
    const qty = product.stock[size] || 0;
    if (qty === 0) return { status: 'out_of_stock', label: 'Out of Stock', class: 'out-of-stock', count: 0 };
    if (qty <= 3) return { status: 'low_stock', label: `Low Stock (${qty} left)`, class: 'low-stock', count: qty };
    return { status: 'in_stock', label: 'In Stock', class: 'in-stock', count: qty };
  }

  const total = getTotalStock(product);
  if (total === 0) return { status: 'out_of_stock', label: 'Out of Stock', class: 'out-of-stock', count: 0 };
  if (total <= 6) return { status: 'low_stock', label: 'Low Stock', class: 'low-stock', count: total };
  return { status: 'in_stock', label: 'In Stock', class: 'in-stock', count: total };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRODUCTS_DATA, getProductById, getTotalStock, getStockStatus };
}
