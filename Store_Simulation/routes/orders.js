const express = require('express');
const OrderService = require('../services/OrderService');
const router = express.Router();

// Store-specific middleware to add store context
const addStoreContext = (storeName) => {
  return (req, res, next) => {
    req.store = storeName;
    next();
  };
};

// Glowmark-specific create order
router.post('/glowmark', addStoreContext('glowmark'), async (req, res) => {
  try {
    const orderData = { ...req.body, store: 'glowmark' };
    const order = await OrderService.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Glowmark order created successfully',
      store: 'glowmark',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Kapuruka-specific create order
router.post('/kapuruka', addStoreContext('kapuruka'), async (req, res) => {
  try {
    const orderData = { ...req.body, store: 'kapuruka' };
    const order = await OrderService.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Kapuruka order created successfully',
      store: 'kapuruka',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// OnlineKade-specific create order
router.post('/onlinekade', addStoreContext('onlinekade'), async (req, res) => {
  try {
    const orderData = { ...req.body, store: 'onlinekade' };
    const order = await OrderService.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'OnlineKade order created successfully',
      store: 'onlinekade',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get all Glowmark orders for a specific user
router.get('/glowmark/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, skip, status } = req.query;
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      store: 'glowmark'
    };
    
    if (status) {
      options.status = status;
    }

    const orders = await OrderService.getOrdersByUserId(userId, options);
    
    res.json({
      success: true,
      message: 'Glowmark orders retrieved successfully',
      store: 'glowmark',
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get specific Glowmark order by order ID
router.get('/glowmark/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    // Verify it's a Glowmark order
    if (order.store && order.store !== 'glowmark') {
      return res.status(404).json({
        success: false,
        message: 'Glowmark order not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Glowmark order retrieved successfully',
      store: 'glowmark',
      data: order
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get Glowmark order status by order ID
router.get('/glowmark/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    // Verify it's a Glowmark order
    if (order.store && order.store !== 'glowmark') {
      return res.status(404).json({
        success: false,
        message: 'Glowmark order not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Glowmark order status retrieved successfully',
      store: 'glowmark',
      data: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        store: order.store || 'glowmark'
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Cancel a Glowmark order
router.put('/glowmark/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // First check if it's a Glowmark order
    const existingOrder = await OrderService.getOrderById(orderId);
    if (existingOrder.store && existingOrder.store !== 'glowmark') {
      return res.status(404).json({
        success: false,
        message: 'Glowmark order not found',
        data: null
      });
    }
    
    const order = await OrderService.cancelOrder(orderId, reason);
    
    res.json({
      success: true,
      message: 'Glowmark order cancelled successfully',
      store: 'glowmark',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get Glowmark order statistics
router.get('/glowmark/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await OrderService.getOrderStats(userId, 'glowmark');
    
    res.json({
      success: true,
      message: 'Glowmark order statistics retrieved successfully',
      store: 'glowmark',
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// ==================== KAPURUKA STORE ENDPOINTS ====================

// Get all Kapuruka orders for a specific user
router.get('/kapuruka/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, skip, status } = req.query;
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      store: 'kapuruka'
    };
    
    if (status) {
      options.status = status;
    }

    const orders = await OrderService.getOrdersByUserId(userId, options);
    
    res.json({
      success: true,
      message: 'Kapuruka orders retrieved successfully',
      store: 'kapuruka',
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get specific Kapuruka order by order ID
router.get('/kapuruka/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    // Verify it's a Kapuruka order
    if (order.store && order.store !== 'kapuruka') {
      return res.status(404).json({
        success: false,
        message: 'Kapuruka order not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Kapuruka order retrieved successfully',
      store: 'kapuruka',
      data: order
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Cancel Kapuruka order
router.put('/kapuruka/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // First check if it's a Kapuruka order
    const existingOrder = await OrderService.getOrderById(orderId);
    if (existingOrder.store && existingOrder.store !== 'kapuruka') {
      return res.status(404).json({
        success: false,
        message: 'Kapuruka order not found',
        data: null
      });
    }
    
    const order = await OrderService.cancelOrder(orderId, reason);
    
    res.json({
      success: true,
      message: 'Kapuruka order cancelled successfully',
      store: 'kapuruka',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get Kapuruka order statistics
router.get('/kapuruka/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await OrderService.getOrderStats(userId, 'kapuruka');
    
    res.json({
      success: true,
      message: 'Kapuruka order statistics retrieved successfully',
      store: 'kapuruka',
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// ==================== ONLINEKADE STORE ENDPOINTS ====================

// Get all OnlineKade orders for a specific user
router.get('/onlinekade/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, skip, status } = req.query;
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      store: 'onlinekade'
    };
    
    if (status) {
      options.status = status;
    }

    const orders = await OrderService.getOrdersByUserId(userId, options);
    
    res.json({
      success: true,
      message: 'OnlineKade orders retrieved successfully',
      store: 'onlinekade',
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get specific OnlineKade order by order ID
router.get('/onlinekade/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    // Verify it's an OnlineKade order
    if (order.store && order.store !== 'onlinekade') {
      return res.status(404).json({
        success: false,
        message: 'OnlineKade order not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'OnlineKade order retrieved successfully',
      store: 'onlinekade',
      data: order
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Cancel OnlineKade order
router.put('/onlinekade/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // First check if it's an OnlineKade order
    const existingOrder = await OrderService.getOrderById(orderId);
    if (existingOrder.store && existingOrder.store !== 'onlinekade') {
      return res.status(404).json({
        success: false,
        message: 'OnlineKade order not found',
        data: null
      });
    }
    
    const order = await OrderService.cancelOrder(orderId, reason);
    
    res.json({
      success: true,
      message: 'OnlineKade order cancelled successfully',
      store: 'onlinekade',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get OnlineKade order statistics
router.get('/onlinekade/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await OrderService.getOrderStats(userId, 'onlinekade');
    
    res.json({
      success: true,
      message: 'OnlineKade order statistics retrieved successfully',
      store: 'onlinekade',
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// ==================== GENERIC ENDPOINTS ====================

// Generic endpoints (maintain backward compatibility)
// Create a new order (defaults to glowmark for backward compatibility)
router.post('/', async (req, res) => {
  try {
    const orderData = { ...req.body, store: req.body.store || 'glowmark' };
    const order = await OrderService.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get all orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, skip, status } = req.query;
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0
    };
    
    if (status) {
      options.status = status;
    }

    const orders = await OrderService.getOrdersByUserId(userId, options);
    
    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get specific order by order ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get order status by order ID
router.get('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    res.json({
      success: true,
      message: 'Order status retrieved successfully',
      data: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Cancel an order
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await OrderService.cancelOrder(orderId, reason);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

// Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await OrderService.getOrderStats(userId);
    
    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
});

module.exports = router;
