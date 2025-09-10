const request = require('supertest');
const mongoose = require('mongoose');
const Order = require('../models/Order');

// Test database
const MONGODB_URI = 'mongodb+srv://yasirunipunbasnayake2_db_user:hFIS1XVxBmbaC5Ro@techtitans0.c5azljc.mongodb.net/test_ecommerce_db';

// Create app without starting server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const orderRoutes = require('../routes/orders');
const systemRoutes = require('../routes/system');
const { errorHandler, notFound, requestLogger, responseTime } = require('../middleware');

const createTestApp = () => {
  const app = express();
  
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  app.use('/api', systemRoutes);
  app.use('/api/orders', orderRoutes);
  
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Glowmark Order Simulator API',
      version: '1.0.0'
    });
  });
  
  app.use(notFound);
  app.use(errorHandler);
  
  return app;
};

describe('Order API Tests', () => {
  let app;
  let testOrderId;
  const testUserId = 'test-user-123';

  beforeAll(async () => {
    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to test database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Create test app
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clean up test data
    await Order.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close database connection
    await Order.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        userId: testUserId,
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            title: 'Finch Dried Red Cherries 750G',
            price: 990,
            quantity: 2
          },
          {
            productId: '66ab1e45c9aeeb2d95105141',
            title: 'Super Chef Peach Halves In Light Syrup 840G',
            price: 2200,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.totalAmount).toBe(4180); // (990*2) + (2200*1)
      
      testOrderId = response.body.data.orderId;
    });

    it('should fail to create order without required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('UserId and items are required');
    });

    it('should fail to create order with invalid items', async () => {
      const orderData = {
        userId: testUserId,
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            // Missing title, price, quantity
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must have productId, title, price, and quantity');
    });
  });

  describe('GET /api/orders/user/:userId', () => {
    beforeEach(async () => {
      // Create test orders
      const orderData = {
        userId: testUserId,
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            title: 'Test Product',
            price: 100,
            quantity: 1
          }
        ]
      };

      await request(app)
        .post('/api/orders')
        .send(orderData);
    });

    it('should get orders for a user', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].userId).toBe(testUserId);
    });

    it('should return empty array for user with no orders', async () => {
      const response = await request(app)
        .get('/api/orders/user/non-existent-user')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/orders/:orderId', () => {
    beforeEach(async () => {
      // Create a test order
      const orderData = {
        userId: testUserId,
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            title: 'Test Product',
            price: 100,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      testOrderId = response.body.data.orderId;
    });

    it('should get order by orderId', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe(testOrderId);
      expect(response.body.data.userId).toBe(testUserId);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-order')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Order not found');
    });
  });

  describe('GET /api/orders/:orderId/status', () => {
    beforeEach(async () => {
      // Create a test order
      const orderData = {
        userId: testUserId,
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            title: 'Test Product',
            price: 100,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      testOrderId = response.body.data.orderId;
    });

    it('should get order status', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrderId}/status`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe(testOrderId);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data).toHaveProperty('statusHistory');
      expect(response.body.data.statusHistory.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/orders/:orderId/cancel', () => {
    beforeEach(async () => {
      // Create a test order
      const orderData = {
        userId: testUserId,
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            title: 'Test Product',
            price: 100,
            quantity: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      testOrderId = response.body.data.orderId;
    });

    it('should cancel an order', async () => {
      const response = await request(app)
        .put(`/api/orders/${testOrderId}/cancel`)
        .send({ reason: 'Customer request' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.statusHistory.some(h => h.status === 'cancelled')).toBe(true);
    });

    it('should fail to cancel non-existent order', async () => {
      const response = await request(app)
        .put('/api/orders/non-existent-order/cancel')
        .send({ reason: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Order not found');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/docs', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('orderStatusFlow');
    });
  });
});
