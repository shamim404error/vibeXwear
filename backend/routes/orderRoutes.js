const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { orderLimiter, sanitizeBody } = require('../middleware/securityMiddleware');

// Public route: Customer places order (strictly rate-limited against bots/floods)
router.post('/', orderLimiter, sanitizeBody, createOrder);

// Protected routes: Admin order management
router.get('/', protectAdmin, getAllOrders);
router.patch('/:id/status', protectAdmin, sanitizeBody, updateOrderStatus);

module.exports = router;
