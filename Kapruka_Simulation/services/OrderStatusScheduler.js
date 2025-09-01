const cron = require('node-cron');
const OrderService = require('./OrderService');

class OrderStatusScheduler {
  constructor() {
    this.isRunning = false;
    this.job = null;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Order status scheduler is already running');
      return;
    }

    // Run every minute
    this.job = cron.schedule('* * * * *', async () => {
      await this.processOrderUpdates();
    }, {
      scheduled: false
    });

    this.job.start();
    this.isRunning = true;
    console.log('Order status scheduler started - checking every minute');
  }

  // Stop the scheduler
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('Order status scheduler stopped');
    }
  }

  // Process order status updates
  async processOrderUpdates() {
    try {
      const ordersToUpdate = await OrderService.getOrdersForStatusUpdate();
      
      if (ordersToUpdate.length === 0) {
        return;
      }

      console.log(`Processing ${ordersToUpdate.length} order(s) for status update`);

      const updatePromises = ordersToUpdate.map(async (order) => {
        try {
          const updatedOrder = await OrderService.updateOrderStatus(order.orderId);
          console.log(`Order ${order.orderId} updated from ${order.status} to ${updatedOrder.status}`);
          return updatedOrder;
        } catch (error) {
          console.error(`Failed to update order ${order.orderId}:`, error.message);
          return null;
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in order status scheduler:', error.message);
    }
  }

  // Manually trigger update process (for testing)
  async triggerUpdate() {
    console.log('Manually triggering order status update...');
    await this.processOrderUpdates();
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.job ? this.job.nextDate() : null
    };
  }
}

// Create singleton instance
const scheduler = new OrderStatusScheduler();

module.exports = scheduler;
