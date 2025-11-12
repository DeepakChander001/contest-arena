const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Google OAuth URL endpoint
app.get('/api/auth/google/url', (req, res) => {
  res.json({
    error: 'Google OAuth not configured',
    message: 'Please add your Google OAuth credentials to the .env file. See ENV_FORMAT.md for instructions.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: development`);
  console.log(`⚠️ Google OAuth: Not configured`);
  console.log(`🔗 Frontend URL: http://localhost:8080`);
});
