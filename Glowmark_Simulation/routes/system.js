const express = require('express');
const orderStatusScheduler = require('../services/OrderStatusScheduler');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Glowmark Order Simulator API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get scheduler status
router.get('/scheduler/status', (req, res) => {
  const status = orderStatusScheduler.getStatus();
  res.json({
    success: true,
    message: 'Scheduler status retrieved',
    data: status
  });
});

// Manually trigger order status updates (for testing)
router.post('/scheduler/trigger', async (req, res) => {
  try {
    await orderStatusScheduler.triggerUpdate();
    res.json({
      success: true,
      message: 'Order status update triggered manually'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to trigger update: ${error.message}`
    });
  }
});

// API documentation endpoint
router.get('/docs', (req, res) => {
  const apiDocs = {
    title: 'Glowmark Order Simulator API',
    version: '1.0.0',
    description: 'API for simulating order processing with automatic status progression',
    endpoints: {
      orders: {
        'POST /api/orders': 'Create a new order',
        'GET /api/orders/user/:userId': 'Get all orders for a user',
        'GET /api/orders/:orderId': 'Get specific order details',
        'GET /api/orders/:orderId/status': 'Get order status and history',
        'PUT /api/orders/:orderId/cancel': 'Cancel an order',
        'GET /api/orders/stats/summary': 'Get order statistics'
      },
      system: {
        'GET /api/health': 'Health check',
        'GET /api/scheduler/status': 'Get scheduler status',
        'POST /api/scheduler/trigger': 'Manually trigger status updates',
        'GET /api/docs': 'API documentation'
      }
    },
    orderStatusFlow: [
      'pending (0 min)',
      'in_transit (1 min)',
      'store_pickup (2 min)',
      'completed (3 min)',
      'cancelled (any time)'
    ],
    exampleRequest: {
      url: 'POST /api/orders',
      body: {
        userId: 'user123',
        items: [
          {
            productId: '66ab1e45c9aeeb2d95105140',
            title: 'Finch Dried Red Cherries 750G',
            price: 990,
            quantity: 2
          }
        ]
      }
    }
  };

  res.json(apiDocs);
});

module.exports = router;
