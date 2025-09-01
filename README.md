# Multi-Store Order Management System

A comprehensive multi-store order management system with dedicated admin panels for each store. The system supports multiple stores with individual theming, order management, and real-time status updates.

## 🏪 Supported Stores

- **Glowmark** - Premium jewelry and accessories store
- **Kapuruka** - Fashion and lifestyle store  
- **OnlineKade** - Electronics and digital products store

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tech-Titans-AI/Store_simulators.git
   cd Store_simulators/Store_simulators/Store_Simulation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string and other settings
   ```

4. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

5. **Access the application**
   - Main API: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api/docs`
   - Health Check: `http://localhost:3000/api/health`

## 🌐 Store Admin Panels

### Individual Store Access

Each store has its dedicated admin panel with store-specific theming and functionality:

- **Glowmark Store**: `http://localhost:3000/glowmark.html`
- **Kapuruka Store**: `http://localhost:3000/kapuruka.html`
- **OnlineKade Store**: `http://localhost:3000/onlinekade.html`

### Multi-Store Dashboard

Access all stores from a single interface:
- **Main Dashboard**: `http://localhost:3000/index.html`

## � API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently, the API operates without authentication for development purposes. In production, implement proper API key or JWT authentication.

## 🛍️ Order Management APIs

### 1. Create Order

**POST** `/api/orders/{store}`

Create a new order for a specific store.

```bash
curl -X POST http://localhost:3000/api/orders/glowmark 
  -H "Content-Type: application/json" 
  -d '{
    "userId": "user123",
    "items": [
      {
        "productId": "GLW001",
        "title": "Diamond Ring",
        "price": 25000,
        "quantity": 1
      }
    ]
  }'
```

**Request Body:**
```json
{
  "userId": "string",
  "items": [
    {
      "productId": "string",
      "title": "string", 
      "price": "number",
      "quantity": "number"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "GLW-1693564800000-ABC123",
    "userId": "user123",
    "store": "glowmark",
    "status": "pending",
    "totalAmount": 25000,
    "items": [...],
    "createdAt": "2025-09-01T10:00:00.000Z"
  }
}
```

### 2. Get Orders by User

**GET** `/api/orders/{store}/user/{userId}`

Retrieve all orders for a specific user in a store.

```bash
curl http://localhost:3000/api/orders/glowmark/user/user123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "GLW-1693564800000-ABC123",
      "userId": "user123",
      "store": "glowmark",
      "status": "pending",
      "totalAmount": 25000,
      "items": [...],
      "createdAt": "2025-09-01T10:00:00.000Z",
      "statusHistory": [...]
    }
  ]
}
```

### 3. Get Order Details

**GET** `/api/orders/{store}/{orderId}`

Get detailed information about a specific order.

```bash
curl http://localhost:3000/api/orders/glowmark/GLW-1693564800000-ABC123
```

### 4. Update Order Status

**PUT** `/api/orders/{store}/{orderId}/status`

Update the status of an order.

```bash
curl -X PUT http://localhost:3000/api/orders/glowmark/GLW-1693564800000-ABC123/status 
  -H "Content-Type: application/json" 
  -d '{
    "status": "in_transit",
    "note": "Package shipped via courier"
  }'
```

**Request Body:**
```json
{
  "status": "pending|in_transit|store_pickup|completed|cancelled",
  "note": "string (optional)"
}
```

### 5. Cancel Order

**PUT** `/api/orders/{store}/{orderId}/cancel`

Cancel an existing order.

```bash
curl -X PUT http://localhost:3000/api/orders/glowmark/GLW-1693564800000-ABC123/cancel 
  -H "Content-Type: application/json" 
  -d '{
    "reason": "Customer requested cancellation"
  }'
```

## 📊 Statistics APIs

### 1. Order Statistics Summary

**GET** `/api/orders/{store}/stats/summary`

Get order statistics summary for a store.

```bash
curl http://localhost:3000/api/orders/glowmark/stats/summary
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "store": "glowmark",
      "status": "pending",
      "count": 15
    },
    {
      "store": "glowmark", 
      "status": "completed",
      "count": 48
    }
  ]
}
```

### 2. Revenue Statistics

**GET** `/api/orders/{store}/stats/revenue`

Get revenue statistics for a store.

```bash
curl http://localhost:3000/api/orders/glowmark/stats/revenue
```

## 🔧 System APIs

### 1. Health Check

**GET** `/api/health`

Check if the API is running and healthy.

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2025-09-01T10:00:00.000Z",
  "uptime": "2 hours, 30 minutes",
  "stores": ["glowmark", "kapuruka", "onlinekade"]
}
```

### 2. API Documentation

**GET** `/api/docs`

Access interactive API documentation (Swagger/OpenAPI).

```bash
curl http://localhost:3000/api/docs
```

## 🎨 Store Themes

Each store has its unique visual theme:

### Glowmark (Purple Theme)
- Primary Color: `#4f46e5` to `#7c3aed`
- Icon: Diamond/Gem
- Focus: Premium jewelry and luxury items

### Kapuruka (Green Theme)  
- Primary Color: `#059669` to `#047857`
- Icon: Shopping bag
- Focus: Fashion and lifestyle products

### OnlineKade (Red Theme)
- Primary Color: `#dc2626` to `#b91c1c` 
- Icon: Laptop
- Focus: Electronics and digital products

## 📱 Frontend Features

### Store-Specific Admin Panels
- **Real-time order monitoring**
- **Order status management**
- **User order filtering and search**
- **Order creation interface**
- **Statistics dashboard**
- **Responsive design for mobile/desktop**

### Navigation
- **Store switching buttons** - Navigate between different store admin panels
- **Breadcrumb navigation** - Always know which store you're managing
- **Theme consistency** - Each store maintains its visual identity

## 🔄 Real-time Features

### Automatic Order Status Updates
The system includes an automated order status scheduler that:
- Progresses orders through realistic status transitions
- Updates orders every minute (configurable)
- Maintains proper status history
- Simulates real-world order processing

### Auto-refresh
- Frontend automatically refreshes data every 10 seconds
- Real-time connection status indicator
- Automatic retry on connection failures

## 🧪 Development & Testing

### Running Tests
```bash
npm test
```

### Demo Scripts
Generate sample data for testing:

```bash
# Single store demo
./demo.sh

# Multi-store demo  
./demo-multistore.sh
```

### Development Mode
```bash
npm run dev
# Enables hot reload and detailed logging
```

## 📝 Order Status Flow

Orders follow this status progression:

1. **pending** - Order created, awaiting processing
2. **in_transit** - Order shipped, in delivery
3. **store_pickup** - Order ready for store pickup
4. **completed** - Order successfully delivered/picked up
5. **cancelled** - Order cancelled (can happen at any stage)

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/multistore_orders

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Order Processing
ORDER_STATUS_CHECK_INTERVAL=60000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the API health endpoint: `http://localhost:3000/api/health`
- Review server logs for detailed error information

---

**Built with ❤️ by Tech-Titans-AI**
