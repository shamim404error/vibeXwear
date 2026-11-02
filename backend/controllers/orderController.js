const fs = require('fs');
const path = require('path');

// Orders data file for persistent local storage
const DATA_FILE = path.join(__dirname, '../../orders-data.json');

// Initialize sample orders if file doesn't exist
const INITIAL_ORDERS = [
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
        image: 'assets/images/tee-black-oversized.svg'
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

function readOrders() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_ORDERS, null, 2), 'utf-8');
      return INITIAL_ORDERS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading orders file:', err.message);
    return INITIAL_ORDERS;
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders file:', err.message);
  }
}

const ALLOWED_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

/**
 * Create Order (Public, Rate-Limited)
 * POST /api/orders
 */
function createOrder(req, res, next) {
  try {
    const { customer, products, district, notes } = req.body || {};

    if (!customer || typeof customer !== 'object') {
      return res.status(400).json({ success: false, message: 'Customer details are required.' });
    }

    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim().replace(/[\s-]/g, '');
    const userDistrict = String(customer.district || district || '').trim();
    const area = String(customer.area || '').trim();
    const address = String(customer.fullAddress || customer.address || '').trim();

    // Validation
    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({ success: false, message: 'Valid customer name (3-100 characters) is required.' });
    }

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 11-digit Bangladeshi mobile number required.' });
    }

    if (!userDistrict) {
      return res.status(400).json({ success: false, message: 'Delivery district is required.' });
    }

    if (!area || area.length < 2) {
      return res.status(400).json({ success: false, message: 'Delivery area/thana is required.' });
    }

    if (!address || address.length < 5 || address.length > 300) {
      return res.status(400).json({ success: false, message: 'Detailed delivery address (5-300 chars) is required.' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    // Verify products and compute prices server-side
    let calculatedSubtotal = 0;
    const sanitizedProducts = [];

    for (const item of products) {
      const quantity = Math.floor(Number(item.quantity) || 0);
      const price = Number(item.price) || 0;
      if (quantity <= 0 || quantity > 50) {
        return res.status(400).json({ success: false, message: 'Invalid item quantity.' });
      }
      if (price < 0 || price > 50000) {
        return res.status(400).json({ success: false, message: 'Invalid item price.' });
      }

      calculatedSubtotal += price * quantity;
      sanitizedProducts.push({
        productId: String(item.productId || '').slice(0, 50),
        name: String(item.name || '').slice(0, 100),
        size: String(item.size || 'M').slice(0, 10),
        color: String(item.color || 'Default').slice(0, 30),
        quantity,
        price,
        image: String(item.image || '').slice(0, 200)
      });
    }

    const deliveryFee = userDistrict.toLowerCase() === 'dhaka' ? 60 : 100;
    const isFreeDelivery = calculatedSubtotal >= 2000;
    const finalDelivery = isFreeDelivery ? 0 : deliveryFee;
    const discount = Number(req.body.discount) || 0;
    const grandTotal = Math.max(0, calculatedSubtotal + finalDelivery - discount);

    const orders = readOrders();
    const orderId = `VX${1001 + orders.length}`;

    const newOrder = {
      orderId,
      customer: {
        name,
        phone,
        district: userDistrict,
        area,
        fullAddress: address,
        notes: String(notes || '').slice(0, 300)
      },
      products: sanitizedProducts,
      subtotal: calculatedSubtotal,
      deliveryCharge: finalDelivery,
      discount,
      total: grandTotal,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    writeOrders(orders);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get All Orders (Admin Protected)
 * GET /api/orders
 */
function getAllOrders(req, res, next) {
  try {
    const orders = readOrders();
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Order Status (Admin Protected)
 * PATCH /api/orders/:id/status
 */
function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
      });
    }

    const orders = readOrders();
    const order = orders.find(o => o.orderId === id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found.`
      });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    writeOrders(orders);

    return res.status(200).json({
      success: true,
      message: `Order #${id} status updated to ${status}.`,
      order
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus
};
