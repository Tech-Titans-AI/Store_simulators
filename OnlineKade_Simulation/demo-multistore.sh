#!/bin/bash

# Multi-Store Order Simulator API - Example Usage
# This script demonstrates the new store-specific endpoints

echo "🏪 Multi-Store Order Simulator API Example Usage"
echo "=============================================="

API_BASE="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo "----------------------------------------"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if server is running
print_section "1. Health Check"
HEALTH_RESPONSE=$(curl -s "$API_BASE/api/health")
if [[ $? -eq 0 ]]; then
    print_success "Multi-Store API is running"
    echo $HEALTH_RESPONSE | jq '.message, .stores'
else
    print_error "Server is not running. Please start it with: npm start"
    exit 1
fi

# Get API Documentation
print_section "2. API Documentation"
curl -s "$API_BASE/api/docs" | jq '.title, .supportedStores, .orderIdFormats'

# Create OnlineKade-specific order
print_section "3. Creating OnlineKade Order"
GLOWMARK_ORDER_RESPONSE=$(curl -s -X POST "$API_BASE/api/orders/onlinekade" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-001",
    "items": [
      {
        "productId": "66ab1e45c9aeeb2d95105140",
        "title": "Finch Dried Red Cherries 750G",
        "price": 990,
        "quantity": 2
      }
    ]
  }')

GLOWMARK_ORDER_ID=$(echo $GLOWMARK_ORDER_RESPONSE | jq -r '.data.orderId')
print_success "Created OnlineKade order: $GLOWMARK_ORDER_ID"
echo $GLOWMARK_ORDER_RESPONSE | jq '.store, .data | {orderId, userId, status, totalAmount, store}'

# Create generic order with store specification
print_section "4. Creating Generic Order (with store specification)"
GENERIC_ORDER_RESPONSE=$(curl -s -X POST "$API_BASE/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-002",
    "store": "kapuruka",
    "items": [
      {
        "productId": "KPR001",
        "title": "Kapuruka Special Tea 100G",
        "price": 450,
        "quantity": 3
      }
    ]
  }')

GENERIC_ORDER_ID=$(echo $GENERIC_ORDER_RESPONSE | jq -r '.data.orderId')
print_success "Created Kapuruka order via generic endpoint: $GENERIC_ORDER_ID"
echo $GENERIC_ORDER_RESPONSE | jq '.data | {orderId, userId, status, totalAmount, store}'

# Get OnlineKade-specific user orders
print_section "5. Getting OnlineKade Orders for User"
curl -s "$API_BASE/api/orders/onlinekade/user/demo-user-001" | jq '.store, .data | map({orderId, status, totalAmount, store})'

# Get all orders for user (across all stores)
print_section "6. Getting All Orders for User (All Stores)"
curl -s "$API_BASE/api/orders/user/demo-user-001" | jq '.data | map({orderId, status, totalAmount, store})'

# Get OnlineKade-specific order details
print_section "7. Getting OnlineKade Order Details"
curl -s "$API_BASE/api/orders/onlinekade/$GLOWMARK_ORDER_ID" | jq '.store, .data | {orderId, userId, status, totalAmount, store}'

# Get OnlineKade order status
print_section "8. Getting OnlineKade Order Status"
curl -s "$API_BASE/api/orders/onlinekade/$GLOWMARK_ORDER_ID/status" | jq '.store, .data | {orderId, status, store, statusHistory: .statusHistory | map(.status)}'

# Try to access Kapuruka order via OnlineKade endpoint (should fail)
print_section "9. Testing Store Isolation"
print_info "Attempting to access Kapuruka order via OnlineKade endpoint (should fail):"
curl -s "$API_BASE/api/orders/onlinekade/$GENERIC_ORDER_ID" | jq '.success, .message'

# Cancel OnlineKade order
print_section "10. Cancelling OnlineKade Order"
CANCEL_RESPONSE=$(curl -s -X PUT "$API_BASE/api/orders/onlinekade/$GLOWMARK_ORDER_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Demo cancellation for OnlineKade"}')

print_success "Cancelled OnlineKade order: $GLOWMARK_ORDER_ID"
echo $CANCEL_RESPONSE | jq '.store, .data | {orderId, status, store}'

# Get OnlineKade-specific statistics
print_section "11. OnlineKade Order Statistics"
curl -s "$API_BASE/api/orders/onlinekade/stats/summary" | jq '.store, .data'

# Get overall statistics (all stores)
print_section "12. Overall Order Statistics (All Stores)"
curl -s "$API_BASE/api/orders/stats/summary" | jq '.data'

# Monitor status progression
print_section "13. Monitoring Status Progression"
echo "The remaining orders will automatically progress through statuses every minute:"
echo "pending → in_transit → store_pickup → completed"
echo ""
echo "Current Kapuruka order status:"
curl -s "$API_BASE/api/orders/$GENERIC_ORDER_ID/status" | jq '.data.status, .data.store'

print_section "14. New Endpoint Summary"
echo "🎯 New OnlineKade-specific endpoints:"
echo "   POST   /api/orders/onlinekade"
echo "   GET    /api/orders/onlinekade/user/:userId"
echo "   GET    /api/orders/onlinekade/:orderId"
echo "   GET    /api/orders/onlinekade/:orderId/status"
echo "   PUT    /api/orders/onlinekade/:orderId/cancel"
echo "   GET    /api/orders/onlinekade/stats/summary"
echo ""
echo "🔄 Enhanced generic endpoints (now support store parameter):"
echo "   POST   /api/orders (with store field in body)"
echo "   GET    /api/orders/stats/summary (aggregated by store)"
echo ""
echo "🆔 Order ID Formats:"
echo "   OnlineKade:     GLW-timestamp-hash"
echo "   Kapuruka:     KPR-timestamp-hash"
echo "   Lassana Flora: LSF-timestamp-hash"
echo "   OnlineKade:   OLK-timestamp-hash"

print_section "Demo Complete!"
echo "🎉 Multi-store functionality tested successfully!"
echo ""
echo "Next steps for other stores:"
echo "1. Copy this structure for other stores (Kapuruka, Lassana Flora, OnlineKade)"
echo "2. Create store-specific endpoints: /api/orders/kapuruka, /api/orders/lassana_flora, etc."
echo "3. Each store will have isolated order management"
echo "4. Generic endpoints work across all stores"
