# VibeXwear - Premium Streetwear T-Shirt E-Commerce Platform

A real-world style, full-stack T-shirt e-commerce website engineered for the **VibeXwear** clothing brand. Built with a modern, high-contrast luxury streetwear aesthetic and a clean, beginner-friendly technology stack.

---

## ⚡ Tech Stack

- **Frontend:** HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphism, Responsive Design), Vanilla JavaScript (ES6+ Modules, Event Architecture).
- **Backend:** Node.js, Express.js (RESTful API architecture ready).
- **Database:** MongoDB (Local development, zero-cost).
- **Payment Method:** Cash on Delivery (COD) for local end-to-end testing without third-party fees.

---

## 📁 Project Structure

```
vibexwear/
├── frontend/
│   ├── index.html              # Modern Streetwear Homepage
│   ├── shop.html               # Product Catalog with Search, Filters & Sorting
│   ├── product.html            # Product Details, Gallery, Size/Color Selectors
│   ├── cart.html               # Full Shopping Bag with Calculations & Promo Codes
│   ├── checkout.html           # Customer Delivery Details & COD Checkout
│   ├── order-confirmation.html # Order ID (#VX1001), Summary & Tracking Timeline
│   ├── css/
│   │   └── style.css           # Master Streetwear Design System
│   ├── js/
│   │   ├── products-data.js    # Catalog Dataset & Stock Attributes
│   │   ├── cart.js             # Cart Engine with LocalStorage Sync & Calculations
│   │   ├── main.js             # Navigation, Quick View & Size Guide Modals, Toasts
│   │   ├── shop.js             # Category, Price, Size Filters & Sorting Controller
│   │   ├── product.js          # Product Detail Gallery & Stock Checker
│   │   ├── cart-page.js        # Full Cart Table & Variant Switchers
│   │   └── checkout.js         # Order Submission & Field Validations
│   └── assets/
│       └── images/             # High-Resolution SVG Apparel Mockups & Logo
├── backend/
│   ├── server.js               # Express Server & Static File Host
│   ├── routes/                 # Express API Route Handlers (Step 5+)
│   ├── controllers/            # Business Logic & DB Operations (Step 5+)
│   ├── models/                 # Mongoose Schemas (Step 6+)
│   ├── middleware/             # Auth & Error Handling (Step 11+)
│   └── config/                 # DB Connection & Configuration
├── admin/
│   ├── index.html              # Admin Dashboard, Orders, Products & Inventory Matrix
│   ├── css/
│   │   └── admin.css           # Streetwear Dark Theme for Admin Console
│   └── js/
│       └── admin.js            # Admin Operations, Status Toggles & Stock Adjustments
├── .env.example                # Local Environment Variables Template
├── .gitignore                  # Git Ignore Rules
├── package.json                # Project Dependencies & Scripts
└── README.md                   # Documentation & Setup Guide
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Access (No Server Required)
You can directly open any of the HTML files in your web browser:
- Storefront: Open `frontend/index.html` in Chrome/Firefox/Edge.
- Admin Panel: Open `admin/index.html` in your browser.

### Option 2: Using the Node.js Express Server
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm start
   ```
3. Open your browser:
   - **Storefront:** `http://localhost:5000`
   - **Admin Console:** `http://localhost:5000/admin`
   - **API Health:** `http://localhost:5000/api/health`

---

## 🎨 Design System

- **Background:** Deep Charcoal / Obsidian (`#0a0b0d`, `#121317`, `#16181e`)
- **Accent:** Electric Lime (`#d8ff00`)
- **Typography:** `Plus Jakarta Sans` & `Syne`
- **Aesthetic:** Minimalist, high contrast, streetwear silhouettes, 240+ GSM heavyweight aesthetic, rounded cards (`12px` - `18px`), subtle borders, smooth micro-interactions.

---

## 📋 Features Completed in Step 1

1. **Project Architecture**: Complete modular folder setup for frontend, backend, and admin.
2. **Homepage (`index.html`)**:
   - Modern glassmorphic navbar with logo, menu links, search trigger, and animated cart count badge.
   - Hero section with bold streetwear typography: *"WEAR YOUR VIBE."*, subtitle, and *"SHOP NOW"* CTA.
   - Category navigation pills (*All Drops, Oversized Silhouettes, Graphic Statement, Acid Wash, Heavyweight Basics*).
   - Curated product grids for Featured Products, Best Sellers, and New Arrivals.
   - Fabric engineering banner highlighting 240 GSM luxury combed cotton.
   - Brand manifesto story and verified customer reviews.
   - VIP drop subscription newsletter and streetwear footer.
3. **Shop Page (`shop.html`)**:
   - Live search by product name, style, or category.
   - Multi-faceted filter sidebar (Category filter, Max price range slider, Size pills `S/M/L/XL/XXL`, In-Stock filter).
   - Sorting dropdown (*Featured, Newest, Best Sellers, Price: Low to High, Price: High to Low*).
   - Quick View modal dialog with instant variant selection.
4. **Product Details Page (`product.html`)**:
   - Sticky visual gallery with interactive thumbnail switcher.
   - Dynamic size and color pickers with real-time stock feedback (*In Stock, Low Stock, Out of Stock*).
   - Quantity selector enforcing size-specific inventory limits.
   - Interactive Size Guide modal and accordions for Fabric Specifications, Delivery Details, and Care instructions.
   - Related products recommendation grid.
5. **Shopping Cart (`cart.html` & Slide-Out Drawer)**:
   - Dynamic slide-out drawer accessible from any page.
   - Full cart table allowing in-cart size and color variant modifications.
   - Live calculations: Subtotal, Delivery Fee (৳100 or Free over ৳2000), Discount, and Grand Total.
   - Promo code validation (e.g., `VIBE10` for 10% off).
6. **Checkout (`checkout.html`)**:
   - Structured shipping form with Bangladeshi district selectors (Dhaka, Chittagong, Sylhet, etc.) and 11-digit phone validation.
   - Cash on Delivery (COD) payment badge.
   - Order generation with unique Order IDs (e.g., `#VX1001`) and automatic order persistence.
7. **Order Confirmation (`order-confirmation.html`)**:
   - Visual success confirmation displaying Order ID, Total in ৳, Customer details, and an interactive 5-stage Order Tracking modal.
8. **Admin Dashboard (`admin/index.html`)**:
   - 8 KPI Metric Cards: *Total Orders, Pending Orders, Confirmed Orders, Processing Orders, Delivered Orders, Total Products, Low Stock Alert, Total Sales*.
   - Orders Management view with search, status filters, and live status changer (*Pending → Confirmed → Processing → Shipped → Delivered → Cancelled*).
   - Product Catalog management with Add Product modal.
   - Inventory Matrix displaying stock across individual sizes (S, M, L, XL, XXL) with quick adjustment controls.

---

## 🛣️ Roadmap: Next Steps

- **Step 2:** Deepen product listing and product details integrations.
- **Step 3:** Deepen cart functionality.
- **Step 4:** Deepen checkout features.
- **Step 5:** Create Node.js + Express backend APIs.
- **Step 6:** Connect local MongoDB.
- **Step 7:** Create product REST APIs.
- **Step 8:** Create order REST APIs.
- **Step 9:** Connect checkout with backend and database.
- **Step 10-14:** Implement Admin authentication, persistent order & inventory management.
- **Step 15-16:** Complete end-to-end testing and bug polish.
