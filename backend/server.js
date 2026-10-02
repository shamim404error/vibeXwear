const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// API Root Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'VibeXwear',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Fallback route for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🔥 VibeXwear Server running on http://localhost:${PORT}`);
    console.log(`👕 Storefront: http://localhost:${PORT}`);
    console.log(`⚡ Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`===============================================`);
  });
}

module.exports = app;
