const rateLimit = require('express-rate-limit');

// General API Rate Limiter: max 200 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// Strict Auth Limiter: max 5 login attempts per 15 minutes (mitigates brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed login attempts. Account temporarily locked for 15 minutes.'
  }
});

// Checkout Order Limiter: max 20 orders per 15 minutes per IP (prevents bot order floods)
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Order creation rate limit reached. Please wait before placing more orders.'
  }
});

/**
 * Recursive sanitizer to clean strings and prevent prototype pollution / XSS
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/[<>]/g, '') // Strip angle brackets
      .trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(value)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue; // Prevent Prototype Pollution
      }
      cleanObj[key] = sanitizeValue(value[key]);
    }
    return cleanObj;
  }
  return value;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

/**
 * Centralized error handler - prevents leaking internal stack traces
 */
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;

  console.error(`[Server Error] ${new Date().toISOString()} - ${err.message}`);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Internal Server Error' : err.message || 'Something went wrong',
    ...(isProduction ? {} : { stack: err.stack })
  });
}

module.exports = {
  apiLimiter,
  authLimiter,
  orderLimiter,
  sanitizeBody,
  errorHandler
};
