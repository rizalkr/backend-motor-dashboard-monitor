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
    console.log('🔍 Health check started...');
    
    // Enhanced environment diagnostics
    const envDiagnostics = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
      DB_URL_EXISTS: !!process.env.DB_URL,
      DB_URL_LENGTH: process.env.DB_URL ? process.env.DB_URL.length : 0,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      PORT: process.env.PORT,
      ALL_ENV_VARS: Object.keys(process.env).filter(key => 
        key.startsWith('DB_') || 
        key.startsWith('JWT_') || 
        key.startsWith('VERCEL_') ||
        key === 'NODE_ENV' ||
        key === 'PORT'
      )
    };
    
    console.log('Environment diagnostics:', envDiagnostics);
    
    // Check for critical missing environment variables
    const missingVars = [];
    if (!process.env.DB_URL) missingVars.push('DB_URL');
    if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
    
    if (missingVars.length > 0) {
      console.warn('⚠️ Missing critical environment variables:', missingVars);
    }
    
    // Test database connection with timing
    console.log('📊 Testing database connection...');
    const connectionStart = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version, current_database() as db_name, current_user as db_user');
    const connectionTime = Date.now() - connectionStart;
    
    const dbInfo = result.rows[0];
    console.log('✅ Database query successful:', {
      connection_time_ms: connectionTime,
      current_time: dbInfo.current_time,
      db_version: dbInfo.db_version.split(' ')[0] + ' ' + dbInfo.db_version.split(' ')[1],
      db_name: dbInfo.db_name,
      db_user: dbInfo.db_user
    });
    
    res.json({
      status: 'success',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        is_vercel: !!process.env.VERCEL,
        vercel_env: process.env.VERCEL_ENV,
        vercel_region: process.env.VERCEL_REGION
      },
      database_info: {
        name: dbInfo.db_name,
        user: dbInfo.db_user,
        version: dbInfo.db_version.split(' ')[1],
        connection_time_ms: connectionTime,
        server_time: dbInfo.current_time
      },
      configuration: {
        db_url_configured: !!process.env.DB_URL,
        jwt_secret_configured: !!process.env.JWT_SECRET,
        missing_env_vars: missingVars
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:');
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      internalPosition: error.internalPosition,
      internalQuery: error.internalQuery,
      where: error.where,
      schema: error.schema,
      table: error.table,
      column: error.column,
      dataType: error.dataType,
      constraint: error.constraint
    });
    
    // Enhanced database configuration logging
    console.error('Database config check:', {
      DB_URL_provided: !!process.env.DB_URL,
      DB_URL_length: process.env.DB_URL ? process.env.DB_URL.length : 0,
      DB_URL_prefix: process.env.DB_URL ? process.env.DB_URL.substring(0, 20) + '...' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
      Available_ENV_Vars: Object.keys(process.env).filter(key => 
        key.startsWith('DB_') || 
        key.startsWith('JWT_') || 
        key.startsWith('VERCEL_') ||
        key === 'NODE_ENV' ||
        key === 'PORT'
      )
    });
    
    // Pool diagnostics
    console.error('Connection pool stats:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    });
    
    // Specific error handling with more details
    let errorMessage = 'Server health check failed';
    let troubleshooting = [];
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection refused - server not accepting connections';
      troubleshooting.push('Check if database server is running');
      troubleshooting.push('Verify database host and port in connection string');
      troubleshooting.push('Check firewall settings');
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Database host not found - DNS resolution failed';
      troubleshooting.push('Verify database hostname in DB_URL');
      troubleshooting.push('Check internet connectivity');
      troubleshooting.push('Ensure DB_URL environment variable is set correctly in Vercel');
    } else if (error.code === '28P01') {
      errorMessage = 'Database authentication failed - invalid credentials';
      troubleshooting.push('Check database username and password');
      troubleshooting.push('Verify credentials in DB_URL connection string');
      troubleshooting.push('Ensure user has proper permissions');
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Database connection timeout - server unreachable or overloaded';
      troubleshooting.push('Check network connectivity');
      troubleshooting.push('Verify database server is responding');
      troubleshooting.push('Consider increasing connection timeout');
    } else if (error.code === '3D000') {
      errorMessage = 'Database does not exist';
      troubleshooting.push('Check database name in connection string');
      troubleshooting.push('Ensure database has been created');
      troubleshooting.push('Run migration scripts if needed');
    } else if (!process.env.DB_URL) {
      errorMessage = 'Database connection string not configured';
      troubleshooting.push('Set DB_URL environment variable in Vercel dashboard');
      troubleshooting.push('Ensure DB_URL contains valid PostgreSQL connection string');
      troubleshooting.push('Format: postgresql://user:password@host:port/database');
    } else {
      troubleshooting.push('Check database server status');
      troubleshooting.push('Verify connection parameters');
      troubleshooting.push('Review server logs for more details');
    }
    
    console.error('🔧 Troubleshooting steps:', troubleshooting);
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: {
        code: error.code,
        name: error.name,
        message: error.message,
        severity: error.severity,
        detail: error.detail,
        hint: error.hint
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        is_vercel: !!process.env.VERCEL,
        vercel_env: process.env.VERCEL_ENV,
        vercel_region: process.env.VERCEL_REGION
      },
      configuration: {
        db_url_configured: !!process.env.DB_URL,
        jwt_secret_configured: !!process.env.JWT_SECRET,
        available_env_vars: Object.keys(process.env).filter(key => 
          key.startsWith('DB_') || 
          key.startsWith('JWT_') || 
          key.startsWith('VERCEL_') ||
          key === 'NODE_ENV' ||
          key === 'PORT'
        )
      },
      troubleshooting: troubleshooting,
      pool_stats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
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

// Start server only if not running in Vercel (serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Vehicle Maintenance API Server running on port ${PORT}`);
    console.log(`📚 API Documentation available at http://localhost:${PORT}/`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
