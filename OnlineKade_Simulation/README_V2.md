# 🏪 Multi-Store Order Simulator API - Version 2.0

A Node.js REST API that simulates order processing for multiple stores with automatic status progression and store-specific endpoints.

## 🎯 New Features (v2.0)

- ✅ **Multi-Store Support** - Supports OnlineKade, Kapuruka, Lassana Flora, and OnlineKade
- ✅ **Store-Specific Endpoints** - Dedicated endpoints for each store
- ✅ **Store-Specific Order IDs** - Unique prefixes for each store (GLW-, KPR-, LSF-, OLK-)
- ✅ **Store Isolation** - Orders are isolated between stores
- ✅ **Enhanced Statistics** - Statistics broken down by store and status
- ✅ **Backward Compatibility** - All existing endpoints still work

## 🏪 Supported Stores

| Store | Prefix | Endpoint Base |
|-------|--------|---------------|
| OnlineKade | `GLW-` | `/api/orders/onlinekade` |
| Kapuruka | `KPR-` | `/api/orders/kapuruka` * |
| Lassana Flora | `LSF-` | `/api/orders/lassana_flora` * |
| OnlineKade | `OLK-` | `/api/orders/onlinekade` * |

*Note: Currently only OnlineKade endpoints are implemented. Other stores use the generic endpoints with store parameter.*

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Test multi-store functionality:**
   ```bash
   ./demo-multistore.sh
   ```

## 📡 API Endpoints

### OnlineKade-Specific Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/onlinekade` | Create a new OnlineKade order |
| GET | `/api/orders/onlinekade/user/:userId` | Get all OnlineKade orders for a user |
| GET | `/api/orders/onlinekade/:orderId` | Get specific OnlineKade order details |
| GET | `/api/orders/onlinekade/:orderId/status` | Get OnlineKade order status and history |
| PUT | `/api/orders/onlinekade/:orderId/cancel` | Cancel a OnlineKade order |
| GET | `/api/orders/onlinekade/stats/summary` | Get OnlineKade order statistics |

### Generic Endpoints (Multi-Store)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (specify store in body) |
| GET | `/api/orders/user/:userId` | Get all orders for user (all stores) |
| GET | `/api/orders/:orderId` | Get order details (any store) |
| GET | `/api/orders/:orderId/status` | Get order status (any store) |
| PUT | `/api/orders/:orderId/cancel` | Cancel order (any store) |
| GET | `/api/orders/stats/summary` | Get statistics (all stores) |

## 🎯 Usage Examples

### Create OnlineKade Order (Store-Specific)

```bash
curl -X POST http://localhost:3000/api/orders/onlinekade \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "items": [
      {
        "productId": "66ab1e45c9aeeb2d95105140",
        "title": "Finch Dried Red Cherries 750G",
        "price": 990,
        "quantity": 2
      }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "message": "OnlineKade order created successfully",
  "store": "onlinekade",
  "data": {
    "orderId": "GLW-1756709926236-6D16B6C8",
    "userId": "user123",
    "store": "onlinekade",
    "status": "pending",
    "totalAmount": 1980
  }
}
```

### Create Order for Any Store (Generic)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user456",
    "store": "kapuruka",
    "items": [
      {
        "productId": "KPR001",
        "title": "Kapuruka Special Tea 100G",
        "price": 450,
        "quantity": 3
      }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "KPR-1756709934834-2CA61406",
    "userId": "user456",
    "store": "kapuruka",
    "status": "pending",
    "totalAmount": 1350
  }
}
```

### Get Store-Specific Orders

```bash
# Get only OnlineKade orders for a user
curl http://localhost:3000/api/orders/onlinekade/user/user123

# Get all orders for a user (all stores)
curl http://localhost:3000/api/orders/user/user123
```

### Get Enhanced Statistics

```bash
curl http://localhost:3000/api/orders/stats/summary
```

Response:
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": [
    {
      "status": "pending",
      "store": "onlinekade",
      "count": 5,
      "totalAmount": 12450
    },
    {
      "status": "completed",
      "store": "kapuruka",
      "count": 2,
      "totalAmount": 2700
    }
  ]
}
```

## 🔒 Store Isolation

Orders are completely isolated between stores:

- OnlineKade orders can only be accessed via OnlineKade endpoints
- Attempting to access a Kapuruka order via OnlineKade endpoint returns 404
- Each store has its own order ID format for easy identification
- Statistics can be viewed per store or aggregated across all stores

## 🆔 Order ID Formats

| Store | Format | Example |
|-------|--------|---------|
| OnlineKade | `GLW-{timestamp}-{hash}` | `GLW-1756709926236-6D16B6C8` |
| Kapuruka | `KPR-{timestamp}-{hash}` | `KPR-1756709934834-2CA61406` |
| Lassana Flora | `LSF-{timestamp}-{hash}` | `LSF-1756709945123-A1B2C3D4` |
| OnlineKade | `OLK-{timestamp}-{hash}` | `OLK-1756709955789-E5F6G7H8` |

## 🎨 Migration Guide

### From v1.0 to v2.0

**Existing endpoints still work!** No breaking changes.

**New features:**
1. Add `store` field to order creation requests
2. Use store-specific endpoints for better organization
3. Enhanced statistics with store breakdown

**Example migration:**

**Old (v1.0):**
```javascript
// Create order
POST /api/orders
{
  "userId": "user123",
  "items": [...]
}
```

**New (v2.0) - Option 1:**
```javascript
// Use generic endpoint with store
POST /api/orders
{
  "userId": "user123",
  "store": "onlinekade",
  "items": [...]
}
```

**New (v2.0) - Option 2:**
```javascript
// Use store-specific endpoint
POST /api/orders/onlinekade
{
  "userId": "user123",
  "items": [...]
}
```

## 🏗️ Extending to Other Stores

To add dedicated endpoints for other stores (Kapuruka, Lassana Flora, OnlineKade):

1. **Copy the OnlineKade route pattern:**
   ```javascript
   // Add to routes/orders.js
   router.post('/kapuruka', async (req, res) => {
     // Similar to OnlineKade implementation
   });
   ```

2. **Update the supported stores list in models/Order.js**

3. **Add new store-specific logic if needed**

4. **Test with the existing demo scripts**

## 🧪 Testing

```bash
# Run all tests
npm test

# Test multi-store functionality
./demo-multistore.sh

# Test specific store endpoints
curl http://localhost:3000/api/orders/onlinekade/user/user123
```

## 📊 Database Schema

Orders now include a `store` field:

```javascript
{
  orderId: "GLW-1756709926236-6D16B6C8",
  userId: "user123",
  store: "onlinekade",  // NEW FIELD
  items: [...],
  status: "pending",
  // ... other fields
}
```

## 🎯 Future Enhancements

- [ ] Dedicated endpoints for all stores (currently only OnlineKade)
- [ ] Store-specific configuration (different delivery times, etc.)
- [ ] Store-specific product catalogs
- [ ] Cross-store order management
- [ ] Store performance analytics

## 📝 License

MIT License

---

**Ready for multi-store order simulation!** 🚀

Each store can now operate independently while maintaining unified order processing and monitoring capabilities.
