// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Default error response
  let error = {
    success: false,
    message: 'Internal Server Error',
    data: null
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error.message = messages.join(', ');
    return res.status(400).json(error);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    return res.status(400).json(error);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error.message = 'Invalid data format';
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // Custom application errors
  if (err.message) {
    error.message = err.message;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
};

// 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  next();
};

// Response time middleware
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  errorHandler,
  notFound,
  requestLogger,
  responseTime
};
