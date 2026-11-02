const express = require('express');
const router = express.Router();
const { adminLogin, verifySession } = require('../controllers/authController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { authLimiter, sanitizeBody } = require('../middleware/securityMiddleware');

// Public route: Admin Login (strictly rate-limited against brute-force)
router.post('/login', authLimiter, sanitizeBody, adminLogin);

// Protected route: Verify current session token
router.get('/verify', protectAdmin, verifySession);

module.exports = router;
