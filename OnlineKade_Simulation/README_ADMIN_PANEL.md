# OnlineKade Multi-Store Order Simulation System

A comprehensive order simulation system with automatic status progression and a beautiful admin panel for managing orders across multiple stores.

## 🚀 Features

### Backend API Features
- **Multi-Store Support**: OnlineKade, Kapuruka, Lassana Flora, OnlineKade
- **Automatic Status Progression**: Orders automatically move through statuses every minute
- **Store-Specific Order IDs**: GLW-, KPR-, LSF-, OLK- prefixes
- **Comprehensive Statistics**: Real-time order analytics
- **User Order Management**: Track orders by user across stores
- **Order Cancellation**: Cancel orders with reason tracking
- **Status History**: Complete audit trail of order progression
- **Rate Limiting**: API protection with configurable limits
- **Health Monitoring**: Built-in health check endpoints

### Frontend Admin Panel Features
- **Modern UI**: Glassmorphism design with beautiful gradients
- **Real-time Updates**: Auto-refresh every 10 seconds
- **User-Centric View**: Orders grouped by user with statistics
- **Order Management**: Create, view, and cancel orders
- **Detailed Order Views**: Complete order information with timeline
- **Status Filtering**: Filter orders by status
- **Search Functionality**: Find users and orders quickly
- **Responsive Design**: Works on desktop and mobile
- **Connection Status**: Real-time API connection monitoring

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd OnlineKade_Simulation
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/multistore_orders
DB_NAME=multistore_orders

# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Order Status Scheduler
STATUS_UPDATE_INTERVAL_MINUTES=1
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For macOS with Homebrew
brew services start mongodb-community

# For Ubuntu/Debian
sudo systemctl start mongod

# For Windows
net start MongoDB
```

### 4. Start the Server

```bash
node server.js
```

The server will start on `http://localhost:3000` and you'll see:
```
🚀 Multi-Store Order Simulator API running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
💚 Health Check: http://localhost:3000/api/health
🏪 Supported Stores: onlinekade, kapuruka, lassana_flora, onlinekade
Order status scheduler started - checking every minute
MongoDB Connected: localhost
```

### 5. Access the Admin Panel

Open your browser and navigate to: `http://localhost:3000/index.html`

## 🎯 Usage

### Admin Panel Interface

1. **Dashboard Overview**: View total orders, pending, in transit, pickup, completed, and cancelled counts
2. **User Cards**: Each user shows their orders with status breakdown
3. **Order Details**: Click any order to see complete information including items and status history
4. **Create Orders**: Use the floating action button (+) to create new orders
5. **Filter & Search**: Use the search bar and status filter to find specific orders
6. **Real-time Updates**: The panel automatically refreshes every 10 seconds

### API Endpoints

#### OnlineKade Store Endpoints
```bash
# Create Order
POST /api/orders/onlinekade
Content-Type: application/json
{
  "userId": "user123",
  "items": [
    {
      "productId": "66ab1e45c9aeeb2d95105140",
      "title": "Finch Dried Red Cherries 750G",
      "price": 990,
      "quantity": 2
    }
  ]
}

# Get User Orders
GET /api/orders/onlinekade/user/{userId}

# Get Specific Order
GET /api/orders/onlinekade/{orderId}

# Cancel Order
PUT /api/orders/onlinekade/{orderId}/cancel
Content-Type: application/json
{
  "reason": "Customer requested cancellation"
}

# Get Statistics
GET /api/orders/onlinekade/stats/summary
```

#### Generic Multi-Store Endpoints
```bash
# Create Order (specify store)
POST /api/orders
Content-Type: application/json
{
  "userId": "user123",
  "store": "onlinekade",
  "items": [...]
}

# Get All Statistics
GET /api/orders/stats/summary
```

#### System Endpoints
```bash
# Health Check
GET /api/health

# API Documentation
GET /api/docs

# Scheduler Status
GET /api/scheduler/status

# Manual Status Update
POST /api/scheduler/trigger
```

## 🔄 Order Status Flow

Orders automatically progress through the following statuses:

1. **pending** (0 minutes) - Order created
2. **in_transit** (1 minute later) - Order shipped
3. **store_pickup** (2 minutes later) - Available for pickup
4. **completed** (3 minutes later) - Order completed
5. **cancelled** (manual only) - Order cancelled

## 🧪 Testing

### Run Test Suite
```bash
npm test
```

### Create Test Data
```bash
# Create sample orders for testing
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

### Monitor in Admin Panel
1. Open `http://localhost:3000/index.html`
2. Watch as orders automatically progress through statuses
3. Create new orders using the interface
4. View detailed order information

## 📁 Project Structure

```
OnlineKade_Simulation/
├── frontend/               # Admin Panel Frontend
│   ├── index.html         # Main HTML structure
│   ├── styles.css         # Complete styling
│   └── script.js          # JavaScript functionality
├── models/                # MongoDB Models
│   └── Order.js          # Order schema definition
├── routes/               # API Routes
│   ├── orders.js         # Order management endpoints
│   └── system.js         # System & health endpoints
├── services/             # Business Logic
│   ├── OrderService.js   # Core order operations
│   └── OrderStatusScheduler.js  # Automatic status updates
├── config/               # Configuration
│   └── database.js       # MongoDB connection
├── middleware/           # Express Middleware
│   └── index.js          # Custom middleware functions
├── tests/                # Test Suite
│   └── orders.test.js    # Comprehensive API tests
├── server.js             # Main application entry point
├── package.json          # Dependencies and scripts
└── README.md             # This documentation
```

## 🎨 Frontend Features Detail

### Modern UI Components
- **Glassmorphism Effects**: Beautiful translucent cards with backdrop blur
- **Gradient Backgrounds**: Animated gradient backgrounds
- **Status Indicators**: Color-coded order status badges
- **Interactive Modals**: Smooth animations for order details and creation
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Loading States**: Elegant loading indicators and states

### Real-time Functionality
- **Auto-refresh**: Automatically updates every 10 seconds
- **Connection Status**: Shows API connection state
- **Live Statistics**: Real-time order count updates
- **Status Progression**: Watch orders move through statuses automatically

## 🔧 Configuration Options

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window
- `STATUS_UPDATE_INTERVAL_MINUTES`: Status progression interval

### Frontend Configuration
Edit `frontend/script.js` to modify:
- `API_BASE_URL`: Backend API URL
- `REFRESH_INTERVAL`: Auto-refresh interval (default: 10 seconds)

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in environment
2. Configure production MongoDB URI
3. Set up proper CORS origins
4. Use PM2 or similar process manager
5. Set up reverse proxy (Nginx)
6. Enable HTTPS

### Frontend
1. Update API_BASE_URL to production backend
2. Optimize assets (minify CSS/JS)
3. Set up CDN for static assets
4. Configure proper caching headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the API documentation at `/api/docs`
2. Review the test suite for usage examples
3. Monitor server logs for debugging
4. Use the health check endpoint to verify system status

## 🎉 Quick Start Demo

1. Start the server: `node server.js`
2. Open admin panel: `http://localhost:3000/index.html`
3. Create test orders using the (+) button
4. Watch automatic status progression
5. Explore order details and management features

The system is now ready for use! The admin panel provides a complete interface for managing OnlineKade orders with real-time updates and beautiful visualizations.

## 🖼️ Screenshots

### Admin Panel Dashboard
The main dashboard shows:
- Real-time order statistics at the top
- User cards with order summaries
- Color-coded status indicators
- Search and filter functionality

### Order Details Modal
Clicking any order opens a detailed view showing:
- Complete order information
- Item details with pricing
- Status history timeline
- Action buttons for order management

### Create Order Interface
The floating action button opens a form to:
- Enter user ID
- Add multiple items with product details
- Calculate totals automatically
- Submit new orders to the system

## 🔍 Monitoring Features

### Real-time Status Updates
- Orders automatically progress through statuses
- Admin panel shows live updates every 10 seconds
- Connection status indicator shows API health
- Statistics update in real-time

### Order Management
- View all orders grouped by user
- Filter orders by status
- Search for specific users or orders
- Cancel orders with reason tracking
- Complete audit trail for all changes

The OnlineKade Multi-Store Order Simulation System is now complete with a full-featured admin panel for comprehensive order management!
