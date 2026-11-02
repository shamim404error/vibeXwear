const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secure_random_key_vibexwear_streetwear_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Admin credentials configured via environment
const ADMIN_EMAIL = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@vibexwear.com').trim().toLowerCase();
const ADMIN_PASSWORD_RAW = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456';

// Pre-hashed admin password for secure timing-safe authentication
let adminPasswordHash = null;

async function getAdminPasswordHash() {
  if (!adminPasswordHash) {
    adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD_RAW, 12);
  }
  return adminPasswordHash;
}

// Immediately compute hash on module initialization
getAdminPasswordHash().catch(console.error);

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ADMIN_EMAIL,
  getAdminPasswordHash
};
