require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import configurations and services
const connectDB = require('./config/database');
const orderStatusScheduler = require('./services/OrderStatusScheduler');

// Import routes
const orderRoutes = require('./routes/orders');
const systemRoutes = require('./routes/system');

// Import middleware
const { errorHandler, notFound, requestLogger, responseTime } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    data: null
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Serve static files from frontend directory
app.use(express.static('./frontend'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestLogger);
app.use(responseTime);

// Routes
app.use('/api', systemRoutes);
app.use('/api/orders', orderRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Multi-Store Order Simulator API',
    version: '2.0.0',
    stores: ['kapruka', 'kapuruka', 'lassana_flora', 'onlinekade'],
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Multi-Store Order Simulator API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🏪 Supported Stores: kapruka, kapuruka, lassana_flora, onlinekade`);
  
  // Start the order status scheduler
  orderStatusScheduler.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  // Stop the scheduler
  orderStatusScheduler.stop();
  
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  
  // Stop the scheduler
  orderStatusScheduler.stop();
  
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
