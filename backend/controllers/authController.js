const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, ADMIN_EMAIL, getAdminPasswordHash } = require('../config/authConfig');

/**
 * Handle Admin Login
 * POST /api/auth/login
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);

    // Timing-safe check against configured admin credentials
    const expectedHash = await getAdminPasswordHash();
    const isEmailMatch = cleanEmail === ADMIN_EMAIL;
    const isPasswordMatch = await bcrypt.compare(cleanPassword, expectedHash);

    if (!isEmailMatch || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Access denied.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: ADMIN_EMAIL,
        role: 'admin',
        brand: 'VibeXwear'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'Super Admin'
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify current Admin Token
 * GET /api/auth/verify
 */
function verifySession(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Session is valid.',
    user: req.admin
  });
}

module.exports = {
  adminLogin,
  verifySession
};
