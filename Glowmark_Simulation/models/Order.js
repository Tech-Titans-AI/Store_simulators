const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_transit', 'store_pickup', 'completed', 'cancelled']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_transit', 'store_pickup', 'completed', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [statusHistorySchema],
  estimatedDelivery: {
    type: Date
  },
  nextStatusUpdate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, nextStatusUpdate: 1 });
orderSchema.index({ orderId: 1 });

// Pre-save middleware to update the updatedAt field
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add status history entry
orderSchema.methods.addStatusHistory = function(status, note = '') {
  this.statusHistory.push({
    status: status,
    timestamp: new Date(),
    note: note
  });
};

// Method to update status with history
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  if (this.status !== newStatus) {
    this.status = newStatus;
    this.addStatusHistory(newStatus, note);
  }
};

// Static method to get orders by user
orderSchema.statics.getOrdersByUser = function(userId, limit = 50, skip = 0) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get orders ready for status update
orderSchema.statics.getOrdersForStatusUpdate = function() {
  return this.find({
    status: { $in: ['pending', 'in_transit', 'store_pickup'] },
    nextStatusUpdate: { $lte: new Date() }
  });
};

module.exports = mongoose.model('Order', orderSchema);
