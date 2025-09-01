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

// Kapruka-specific create order
router.post('/kapruka', addStoreContext('kapruka'), async (req, res) => {
  try {
    const orderData = { ...req.body, store: 'kapruka' };
    const order = await OrderService.createOrder(orderData);
    res.status(201).json({
      success: true,
      message: 'Kapruka order created successfully',
      store: 'kapruka',
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

// Get all Kapruka orders for a specific user
router.get('/kapruka/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, skip, status } = req.query;
    
    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      store: 'kapruka'
    };
    
    if (status) {
      options.status = status;
    }

    const orders = await OrderService.getOrdersByUserId(userId, options);
    
    res.json({
      success: true,
      message: 'Kapruka orders retrieved successfully',
      store: 'kapruka',
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

// Get specific Kapruka order by order ID
router.get('/kapruka/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    // Verify it's a Kapruka order
    if (order.store && order.store !== 'kapruka') {
      return res.status(404).json({
        success: false,
        message: 'Kapruka order not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Kapruka order retrieved successfully',
      store: 'kapruka',
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

// Get Kapruka order status by order ID
router.get('/kapruka/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderService.getOrderById(orderId);
    
    // Verify it's a Kapruka order
    if (order.store && order.store !== 'kapruka') {
      return res.status(404).json({
        success: false,
        message: 'Kapruka order not found',
        data: null
      });
    }
    
    res.json({
      success: true,
      message: 'Kapruka order status retrieved successfully',
      store: 'kapruka',
      data: {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        store: order.store || 'kapruka'
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

// Cancel a Kapruka order
router.put('/kapruka/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    // First check if it's a Kapruka order
    const existingOrder = await OrderService.getOrderById(orderId);
    if (existingOrder.store && existingOrder.store !== 'kapruka') {
      return res.status(404).json({
        success: false,
        message: 'Kapruka order not found',
        data: null
      });
    }
    
    const order = await OrderService.cancelOrder(orderId, reason);
    
    res.json({
      success: true,
      message: 'Kapruka order cancelled successfully',
      store: 'kapruka',
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

// Get Kapruka order statistics
router.get('/kapruka/stats/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await OrderService.getOrderStats(userId, 'kapruka');
    
    res.json({
      success: true,
      message: 'Kapruka order statistics retrieved successfully',
      store: 'kapruka',
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

// Generic endpoints (maintain backward compatibility)
// Create a new order (defaults to kapruka for backward compatibility)
router.post('/', async (req, res) => {
  try {
    const orderData = { ...req.body, store: req.body.store || 'kapruka' };
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
