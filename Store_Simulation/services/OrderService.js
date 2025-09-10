const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

class OrderService {
  // Generate unique order ID with store prefix
  static generateOrderId(store = 'glowmark') {
    const storePrefix = {
      'glowmark': 'GLW',
      'kapruka': 'KPR',
      'lassana_flora': 'LSF',
      'onlinekade': 'OLK'
    };
    
    const prefix = storePrefix[store] || 'GLW';
    return `${prefix}-${Date.now()}-${uuidv4().substr(0, 8).toUpperCase()}`;
  }

  // Calculate next status update time
  static calculateNextStatusUpdate(currentStatus) {
    const updateInterval = parseInt(process.env.ORDER_UPDATE_INTERVAL) || 1;
    const now = new Date();
    
    switch (currentStatus) {
      case 'pending':
        return new Date(now.getTime() + updateInterval * 60000); // 1 minute
      case 'in_transit':
        return new Date(now.getTime() + updateInterval * 60000); // 1 minute
      case 'store_pickup':
        return new Date(now.getTime() + updateInterval * 60000); // 1 minute
      default:
        return null; // No next update for completed/cancelled
    }
  }

  // Get next status in progression
  static getNextStatus(currentStatus) {
    const statusProgression = {
      'pending': 'in_transit',
      'in_transit': 'store_pickup',
      'store_pickup': 'completed'
    };
    return statusProgression[currentStatus] || null;
  }

  // Create a new order
  static async createOrder(orderData) {
    try {
      const { userId, items, store = 'glowmark' } = orderData;

      // Validate required fields
      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error('UserId and items are required');
      }

      // Validate store
      const validStores = ['glowmark', 'kapruka', 'lassana_flora', 'onlinekade'];
      if (!validStores.includes(store)) {
        throw new Error(`Invalid store. Must be one of: ${validStores.join(', ')}`);
      }

      // Calculate total amount and prepare items
      let totalAmount = 0;
      const processedItems = items.map(item => {
        if (!item.productId || !item.title || !item.price || !item.quantity) {
          throw new Error('Each item must have productId, title, price, and quantity');
        }
        
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;
        
        return {
          ...item,
          subtotal
        };
      });

      // Create order with store-specific ID
      const orderId = this.generateOrderId(store);
      const estimatedDelivery = new Date(Date.now() + 3 * 60000); // 3 minutes from now
      const nextStatusUpdate = this.calculateNextStatusUpdate('pending');

      const order = new Order({
        orderId,
        userId,
        store,
        items: processedItems,
        totalAmount,
        status: 'pending',
        estimatedDelivery,
        nextStatusUpdate
      });

      // Add initial status to history
      order.addStatusHistory('pending', `Order created successfully for ${store}`);

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Get orders by user ID with optional store filtering
  static async getOrdersByUserId(userId, options = {}) {
    try {
      const { limit = 50, skip = 0, status, store } = options;
      
      let query = { userId };
      if (status) {
        query.status = status;
      }
      if (store) {
        query.store = store;
      }

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      return orders;
    } catch (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  // Get order by order ID
  static async getOrderById(orderId) {
    try {
      const order = await Order.findOne({ orderId });
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  // Cancel an order
  static async cancelOrder(orderId, reason = 'Cancelled by user') {
    try {
      const order = await Order.findOne({ orderId });
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'completed') {
        throw new Error('Cannot cancel completed order');
      }

      if (order.status === 'cancelled') {
        throw new Error('Order is already cancelled');
      }

      order.updateStatus('cancelled', reason);
      order.nextStatusUpdate = null; // No more updates needed

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  // Update order status (used by background job)
  static async updateOrderStatus(orderId) {
    try {
      const order = await Order.findOne({ orderId });
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'completed' || order.status === 'cancelled') {
        return order; // No update needed
      }

      const nextStatus = this.getNextStatus(order.status);
      if (nextStatus) {
        order.updateStatus(nextStatus, `Status automatically updated to ${nextStatus}`);
        
        // Set next update time
        if (nextStatus !== 'completed') {
          order.nextStatusUpdate = this.calculateNextStatusUpdate(nextStatus);
        } else {
          order.nextStatusUpdate = null;
          
          // Send inventory update when order is completed
          await this.updateInventory(order);
        }

        await order.save();
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Get orders ready for status update with optional store filtering
  static async getOrdersForStatusUpdate(store = null) {
    try {
      return await Order.getOrdersForStatusUpdate(store);
    } catch (error) {
      throw new Error(`Failed to get orders for update: ${error.message}`);
    }
  }

  // Get order statistics with optional store and user filtering
  static async getOrderStats(userId = null, store = null) {
    try {
      let matchQuery = {};
      if (userId) {
        matchQuery.userId = userId;
      }
      if (store) {
        matchQuery.store = store;
      }

      const stats = await Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { status: '$status', store: '$store' },
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        {
          $project: {
            _id: 0,
            status: '$_id.status',
            store: '$_id.store',
            count: 1,
            totalAmount: 1
          }
        }
      ]);

      return stats;
    } catch (error) {
      throw new Error(`Failed to get order statistics: ${error.message}`);
    }
  }

  // Send inventory update to external API when order is completed
  static async updateInventory(order) {
    try {
      console.log(`Updating inventory for completed order: ${order.orderId}`);
      
      for (const item of order.items) {
        const inventoryData = {
          name: item.title,
          quantity: item.quantity,
          unit: "pieces", // Default unit, could be made configurable
          category: this.getCategoryByStore(order.store),
          expiry: this.calculateExpiryDate()
        };

        const response = await fetch('http://localhost:3001/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inventoryData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✓ Inventory updated for item: ${item.title}`, result);
        } else {
          console.error(`✗ Failed to update inventory for item: ${item.title}`, await response.text());
        }
      }
    } catch (error) {
      console.error(`Failed to update inventory for order ${order.orderId}:`, error.message);
      // Don't throw error - inventory update failure shouldn't block order completion
    }
  }

  // Helper function to determine category based on store
  static getCategoryByStore(store) {
    const storeCategories = {
      'glowmark': 'Grain',           // Beauty & Personal Care -> Dairy (closest valid category)
      'kapruka': 'Grains',           // Food & Beverages -> Fruits  
      'lassana_flora': 'Grains', // Health & Wellness -> Vegetables
      'onlinekade': 'Grains'           // Electronics & Technology -> Meat (general category)
    };
    return storeCategories[store] || 'Vegetables';
  }

  // Helper function to calculate expiry date (30 days from now)
  static calculateExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
}

module.exports = OrderService;
