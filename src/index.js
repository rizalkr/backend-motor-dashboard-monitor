const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const oilChangeRoutes = require('./routes/oilChangeRoutes');
const fuelRecordRoutes = require('./routes/fuelRecordRoutes');

// Import database connection
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    res.json({
      status: 'success',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server health check failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api', oilChangeRoutes);  // Includes /api/vehicles/:vehicleId/oil-changes and /api/oil-changes/:id
app.use('/api', fuelRecordRoutes); // Includes /api/vehicles/:vehicleId/fuel-records and /api/fuel-records/:id

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Vehicle Maintenance Tracking API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth (POST /register, POST /login)',
      vehicles: '/api/vehicles (GET, POST, GET /:id, DELETE /:id)',
      oilChanges: '/api/vehicles/:vehicleId/oil-changes (GET, POST), /api/oil-changes/:id (PATCH, DELETE)',
      fuelRecords: '/api/vehicles/:vehicleId/fuel-records (GET, POST), /api/fuel-records/:id (PATCH, DELETE)'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON in request body'
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      message: 'Request entity too large'
    });
  }

  // Generic error response
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');
  
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  
  try {
    await pool.end();
    console.log('Database pool has ended');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vehicle Maintenance API Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
