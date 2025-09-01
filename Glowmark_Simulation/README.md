# Glowmark Order Simulator API

A Node.js REST API that simulates order processing for the Glowmark store with automatic status progression.

## Features

- ✅ Create orders with multiple items
- ✅ Automatic order status progression (pending → in_transit → store_pickup → completed)
- ✅ Order cancellation functionality
- ✅ User-specific order retrieval
- ✅ Order status tracking with history
- ✅ Background scheduler for status updates
- ✅ RESTful API design
- ✅ MongoDB integration
- ✅ Comprehensive testing
- ✅ Error handling and validation
- ✅ Rate limiting and security

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Glowmark_Simulation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

4. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or use your local MongoDB installation
   mongod
   ```

5. **Run the application:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/user/:userId` | Get all orders for a user |
| GET | `/api/orders/:orderId` | Get specific order details |
| GET | `/api/orders/:orderId/status` | Get order status and history |
| PUT | `/api/orders/:orderId/cancel` | Cancel an order |
| GET | `/api/orders/stats/summary` | Get order statistics |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/docs` | API documentation |
| GET | `/api/scheduler/status` | Get scheduler status |
| POST | `/api/scheduler/trigger` | Manually trigger status updates |

## Order Status Flow

Orders automatically progress through the following statuses:

1. **pending** (0 minutes) - Order created
2. **in_transit** (1 minute) - Order shipped
3. **store_pickup** (2 minutes) - Available for pickup
4. **completed** (3 minutes) - Order completed
5. **cancelled** (any time) - Order cancelled by user

## Usage Examples

### Create an Order

```bash
curl -X POST http://localhost:3000/api/orders \
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

### Get User Orders

```bash
curl http://localhost:3000/api/orders/user/user123
```

### Get Order Status

```bash
curl http://localhost:3000/api/orders/ORD-1693574400000-A1B2C3D4/status
```

### Cancel an Order

```bash
curl -X PUT http://localhost:3000/api/orders/ORD-1693574400000-A1B2C3D4/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer request"}'
```

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ecommerce_db |
| `NODE_ENV` | Environment | development |
| `ORDER_UPDATE_INTERVAL` | Status update interval (minutes) | 1 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Database Schema

### Orders Collection

```javascript
{
  orderId: String (unique),
  userId: String,
  items: [{
    productId: String,
    title: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalAmount: Number,
  status: String,
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  estimatedDelivery: Date,
  nextStatusUpdate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Architecture

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Node-cron** - Background scheduler
- **Jest** - Testing framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate limiting** - API protection

## Development

### Project Structure

```
Glowmark_Simulation/
├── config/
│   └── database.js
├── middleware/
│   └── index.js
├── models/
│   └── Order.js
├── routes/
│   ├── orders.js
│   └── system.js
├── services/
│   ├── OrderService.js
│   └── OrderStatusScheduler.js
├── tests/
│   └── orders.test.js
├── .env
├── package.json
├── server.js
└── README.md
```

### Adding New Features

1. Create new service methods in `services/`
2. Add routes in `routes/`
3. Update models in `models/` if needed
4. Add tests in `tests/`
5. Update documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
