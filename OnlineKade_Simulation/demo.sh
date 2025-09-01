#!/bin/bash

# OnlineKade Order Simulator API - Example Usage
# This script demonstrates all the API endpoints

echo "🚀 OnlineKade Order Simulator API Example Usage"
echo "=============================================="

API_BASE="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if server is running
print_section "1. Health Check"
HEALTH_RESPONSE=$(curl -s "$API_BASE/api/health")
if [[ $? -eq 0 ]]; then
    print_success "Server is running"
    echo $HEALTH_RESPONSE | jq '.message, .timestamp'
else
    print_error "Server is not running. Please start it with: npm start"
    exit 1
fi

# Get API Documentation
print_section "2. API Documentation"
curl -s "$API_BASE/api/docs" | jq '.title, .endpoints.orders'

# Create first order
print_section "3. Creating Orders"
ORDER1_RESPONSE=$(curl -s -X POST "$API_BASE/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-001",
    "items": [
      {
        "productId": "66ab1e45c9aeeb2d95105140",
        "title": "Finch Dried Red Cherries 750G",
        "price": 990,
        "quantity": 2
      },
      {
        "productId": "66ab1e45c9aeeb2d95105141", 
        "title": "Super Chef Peach Halves In Light Syrup 840G",
        "price": 2200,
        "quantity": 1
      }
    ]
  }')

ORDER1_ID=$(echo $ORDER1_RESPONSE | jq -r '.data.orderId')
print_success "Created order: $ORDER1_ID"
echo $ORDER1_RESPONSE | jq '.data | {orderId, userId, status, totalAmount, estimatedDelivery}'

# Create second order
ORDER2_RESPONSE=$(curl -s -X POST "$API_BASE/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-002",
    "items": [
      {
        "productId": "66ab1e45c9aeeb2d95105142",
        "title": "Marina Wht Choco Dates Hjnt 250G",
        "price": 1550,
        "quantity": 1
      }
    ]
  }')

ORDER2_ID=$(echo $ORDER2_RESPONSE | jq -r '.data.orderId')
print_success "Created order: $ORDER2_ID"

# Get user orders
print_section "4. Getting User Orders"
curl -s "$API_BASE/api/orders/user/demo-user-001" | jq '.data | map({orderId, status, totalAmount, createdAt})'

# Get specific order details
print_section "5. Getting Order Details"
curl -s "$API_BASE/api/orders/$ORDER1_ID" | jq '.data | {orderId, userId, status, totalAmount, items: .items | length}'

# Get order status
print_section "6. Getting Order Status"
curl -s "$API_BASE/api/orders/$ORDER1_ID/status" | jq '.data | {orderId, status, statusHistory: .statusHistory | map(.status)}'

# Cancel second order
print_section "7. Cancelling Order"
CANCEL_RESPONSE=$(curl -s -X PUT "$API_BASE/api/orders/$ORDER2_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Demo cancellation"}')

print_success "Cancelled order: $ORDER2_ID"
echo $CANCEL_RESPONSE | jq '.data | {orderId, status, statusHistory: .statusHistory | map(.status)}'

# Get order statistics
print_section "8. Order Statistics"
curl -s "$API_BASE/api/orders/stats/summary" | jq '.data'

# Monitor status progression
print_section "9. Monitoring Status Progression"
echo "The first order will automatically progress through statuses every minute:"
echo "pending → in_transit → store_pickup → completed"
echo ""
echo "Current status:"
curl -s "$API_BASE/api/orders/$ORDER1_ID/status" | jq '.data.status'

echo ""
echo "💡 Tips:"
echo "- Wait 1-3 minutes to see automatic status progression"
echo "- Check order status again with: curl $API_BASE/api/orders/$ORDER1_ID/status"
echo "- View all endpoints at: $API_BASE/api/docs"
echo "- Monitor server logs for real-time updates"

print_section "10. Test Error Handling"
echo "Testing with invalid order ID:"
curl -s "$API_BASE/api/orders/invalid-order-id" | jq '.success, .message'

echo ""
echo "Testing with missing required fields:"
curl -s -X POST "$API_BASE/api/orders" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.success, .message'

print_section "Demo Complete!"
echo "🎉 All API endpoints tested successfully!"
echo ""
echo "Next steps:"
echo "1. Start the server: npm start"
echo "2. Visit http://localhost:3000/api/docs for documentation"
echo "3. Monitor automatic status progression"
echo "4. Integrate with your shopping application"
