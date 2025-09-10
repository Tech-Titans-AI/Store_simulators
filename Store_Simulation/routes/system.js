const express = require('express');
const orderStatusScheduler = require('../services/OrderStatusScheduler');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Multi-Store Order Simulator API is running',
    stores: ['glowmark', 'kapruka', 'lassana_flora', 'onlinekade'],
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
    title: 'Multi-Store Order Simulator API',
    version: '2.0.0',
    description: 'API for simulating order processing across multiple stores with automatic status progression',
    supportedStores: ['glowmark', 'kapruka', 'lassana_flora', 'onlinekade'],
    endpoints: {
      glowmarkOrders: {
        'POST /api/orders/glowmark': 'Create a new Glowmark order',
        'GET /api/orders/glowmark/user/:userId': 'Get all Glowmark orders for a user',
        'GET /api/orders/glowmark/:orderId': 'Get specific Glowmark order details',
        'GET /api/orders/glowmark/:orderId/status': 'Get Glowmark order status and history',
        'PUT /api/orders/glowmark/:orderId/cancel': 'Cancel a Glowmark order',
        'GET /api/orders/glowmark/stats/summary': 'Get Glowmark order statistics'
      },
      genericOrders: {
        'POST /api/orders': 'Create a new order (defaults to glowmark)',
        'GET /api/orders/user/:userId': 'Get all orders for a user (all stores)',
        'GET /api/orders/:orderId': 'Get specific order details',
        'GET /api/orders/:orderId/status': 'Get order status and history',
        'PUT /api/orders/:orderId/cancel': 'Cancel an order',
        'GET /api/orders/stats/summary': 'Get order statistics (all stores)'
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
    storeExamples: {
      glowmark: {
        url: 'POST /api/orders/glowmark',
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
      },
      generic: {
        url: 'POST /api/orders',
        body: {
          userId: 'user123',
          store: 'glowmark',
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
    },
    orderIdFormats: {
      glowmark: 'GLW-timestamp-hash',
      kapruka: 'KPR-timestamp-hash',
      lassana_flora: 'LSF-timestamp-hash',
      onlinekade: 'OLK-timestamp-hash'
    }
  };

  res.json(apiDocs);
});

module.exports = router;
