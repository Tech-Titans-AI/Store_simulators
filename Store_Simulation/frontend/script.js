// Configuration
const API_BASE_URL = 'http://localhost:3005';
const REFRESH_INTERVAL = 10000; // 10 seconds

// Global state
let allUsers = [];
let allOrders = [];
let selectedOrder = null;
let refreshTimer = null;
let currentStore = 'glowmark'; // Start with Glowmark instead of 'all'

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Set initial theme and store
    console.log('DOM loaded, initializing app...');
    
    // Set initial theme
    document.body.className = 'theme-glowmark';
    
    // Set initial store selection
    switchStore('glowmark');
    
    // Initialize the app
    await initializeApp();
});

async function initializeApp() {
    updateConnectionStatus('connecting');
    try {
        await checkAPIConnection();
        await loadData();
        updateConnectionStatus('connected');
        startAutoRefresh();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        updateConnectionStatus('disconnected');
        showError('Failed to connect to API');
    }
}

// API Connection and Data Loading
async function checkAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (!response.ok) throw new Error('API not responding');
        return true;
    } catch (error) {
        throw new Error('Cannot connect to API');
    }
}

async function loadData() {
    showLoading(true);
    try {
        await Promise.all([
            loadStatistics(),
            loadAllOrders()
        ]);
        updateUsersDisplay();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    } finally {
        showLoading(false);
    }
}

async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${currentStore}/stats/summary`);
        const data = await response.json();
        
        if (data.success) {
            updateStatistics(data.data);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

async function loadAllOrders() {
    try {
        // Get unique users by making requests for orders
        const userOrdersMap = new Map();
        
        // This is a simplified approach - in a real app, you'd have a users endpoint
        // For now, we'll fetch orders and group by userId
        await loadOrdersForDisplay(userOrdersMap);
        
        allUsers = Array.from(userOrdersMap.entries()).map(([userId, orders]) => ({
            userId,
            orders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }));
        
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadOrdersForDisplay(userOrdersMap) {
    try {
        const testUsers = ['user123', 'demo-user-001', 'demo-user-002', 'test-user-123'];
        
        for (const userId of testUsers) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/${currentStore}/user/${userId}`);
                const data = await response.json();
                
                if (data.success && data.data.length > 0) {
                    userOrdersMap.set(userId, data.data);
                    // Add all orders to global array
                    allOrders.push(...data.data);
                }
            } catch (error) {
                console.log(`No orders found for user ${userId} in store ${currentStore}`);
            }
        }
    } catch (error) {
        console.error('Error loading orders for display:', error);
    }
}

// UI Update Functions
function updateStatistics(stats) {
    const statCounts = {
        total: 0,
        pending: 0,
        in_transit: 0,
        store_pickup: 0,
        completed: 0,
        cancelled: 0
    };
    
    stats.forEach(stat => {
        if (stat.store === currentStore) {
            statCounts[stat.status] = (statCounts[stat.status] || 0) + stat.count;
            statCounts.total += stat.count;
        }
    });
    
    document.getElementById('totalOrders').textContent = statCounts.total;
    document.getElementById('pendingOrders').textContent = statCounts.pending;
    document.getElementById('transitOrders').textContent = statCounts.in_transit;
    document.getElementById('pickupOrders').textContent = statCounts.store_pickup;
    document.getElementById('completedOrders').textContent = statCounts.completed;
    document.getElementById('cancelledOrders').textContent = statCounts.cancelled;
}

function updateUsersDisplay() {
    const container = document.getElementById('usersContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (allUsers.length === 0) {
        container.style.display = 'none';
        noDataMessage.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noDataMessage.style.display = 'none';
    
    container.innerHTML = allUsers.map(user => createUserCard(user)).join('');
}

function createUserCard(user) {
    const statusCounts = user.orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
    
    const totalAmount = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return `
        <div class="user-card">
            <div class="user-header">
                <div class="user-info">
                    <h3><i class="fas fa-user"></i> ${user.userId}</h3>
                    <p>${user.orders.length} orders • LKR ${totalAmount.toLocaleString()}</p>
                </div>
                <div class="user-stats">
                    ${Object.entries(statusCounts).map(([status, count]) => 
                        `<span class="user-stat status-${status}">${count} ${status.replace('_', ' ')}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="orders-list">
                ${user.orders.map(order => createOrderItem(order)).join('')}
            </div>
        </div>
    `;
}

function createOrderItem(order) {
    const createdDate = new Date(order.createdAt).toLocaleDateString();
    const itemsCount = order.items.length;
    
    return `
        <div class="order-item" onclick="showOrderDetails('${order.orderId}')">
            <div class="order-info">
                <div class="order-id">${order.orderId}</div>
                <div class="order-details">
                    ${itemsCount} items • LKR ${order.totalAmount.toLocaleString()} • ${createdDate}
                </div>
            </div>
            <span class="order-status status-${order.status}">
                ${order.status.replace('_', ' ')}
            </span>
        </div>
    `;
}

// Modal Functions
async function showOrderDetails(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${currentStore}/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            selectedOrder = data.data;
            displayOrderModal(selectedOrder);
        } else {
            showError('Failed to load order details');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Failed to load order details');
    }
}

function displayOrderModal(order) {
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('modalBody');
    
    const createdDate = new Date(order.createdAt).toLocaleString();
    const updatedDate = new Date(order.updatedAt).toLocaleString();
    
    modalBody.innerHTML = `
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Order ID</div>
                    <div class="detail-value">${order.orderId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">User ID</div>
                    <div class="detail-value">${order.userId}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="order-status status-${order.status}">
                            ${order.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Amount</div>
                    <div class="detail-value">LKR ${order.totalAmount.toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Created</div>
                    <div class="detail-value">${createdDate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Last Updated</div>
                    <div class="detail-value">${updatedDate}</div>
                </div>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3>Items (${order.items.length})</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.productId}</td>
                            <td>${item.title}</td>
                            <td>LKR ${item.price.toLocaleString()}</td>
                            <td>${item.quantity}</td>
                            <td>LKR ${item.subtotal.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="order-detail-section">
            <h3>Status History</h3>
            <div class="status-timeline">
                ${order.statusHistory.map(history => `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="timeline-status">${history.status.replace('_', ' ')}</div>
                            <div class="timeline-time">
                                ${new Date(history.timestamp).toLocaleString()}
                                ${history.note ? `• ${history.note}` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Show/hide cancel button based on order status
    const cancelBtn = document.getElementById('cancelOrderBtn');
    if (order.status === 'completed' || order.status === 'cancelled') {
        cancelBtn.style.display = 'none';
    } else {
        cancelBtn.style.display = 'inline-flex';
    }
    
    modal.style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    selectedOrder = null;
}

// Create Order Functions
function openCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'block';
    resetCreateOrderForm();
}

function closeCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'none';
    resetCreateOrderForm();
}

function resetCreateOrderForm() {
    document.getElementById('createOrderForm').reset();
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = `
        <div class="item-row">
            <input type="text" placeholder="Product ID" class="product-id" required>
            <input type="text" placeholder="Product Title" class="product-title" required>
            <input type="number" placeholder="Price" class="product-price" min="0" required>
            <input type="number" placeholder="Quantity" class="product-quantity" min="1" required>
            <button type="button" class="btn-remove-item" onclick="removeItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

function addItem() {
    const itemsList = document.getElementById('itemsList');
    const newItem = document.createElement('div');
    newItem.className = 'item-row';
    newItem.innerHTML = `
        <input type="text" placeholder="Product ID" class="product-id" required>
        <input type="text" placeholder="Product Title" class="product-title" required>
        <input type="number" placeholder="Price" class="product-price" min="0" required>
        <input type="number" placeholder="Quantity" class="product-quantity" min="1" required>
        <button type="button" class="btn-remove-item" onclick="removeItem(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    itemsList.appendChild(newItem);
}

function removeItem(button) {
    const itemsList = document.getElementById('itemsList');
    if (itemsList.children.length > 1) {
        button.parentElement.remove();
    }
}

async function createOrder() {
    const userId = document.getElementById('newUserId').value.trim();
    const store = document.getElementById('newOrderStore').value;
    const itemRows = document.querySelectorAll('.item-row');
    
    if (!userId) {
        showError('Please enter a User ID');
        return;
    }
    
    const items = [];
    for (const row of itemRows) {
        const productId = row.querySelector('.product-id').value.trim();
        const title = row.querySelector('.product-title').value.trim();
        const price = parseFloat(row.querySelector('.product-price').value);
        const quantity = parseInt(row.querySelector('.product-quantity').value);
        
        if (!productId || !title || !price || !quantity) {
            showError('Please fill in all item fields');
            return;
        }
        
        items.push({ productId, title, price, quantity });
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${store}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, items })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Order created successfully!');
            closeCreateOrderModal();
            // Only refresh if we're viewing the same store
            if (currentStore === store) {
                refreshData();
            }
        } else {
            showError(data.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showError('Failed to create order');
    }
}

// Order Actions
async function cancelOrder() {
    if (!selectedOrder) return;
    
    if (!confirm(`Are you sure you want to cancel order ${selectedOrder.orderId}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${currentStore}/${selectedOrder.orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: 'Cancelled by admin' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Order cancelled successfully!');
            closeOrderModal();
            refreshData();
        } else {
            showError(data.message || 'Failed to cancel order');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showError('Failed to cancel order');
    }
}

// Store switching function with navigation
function switchStore(store) {
    console.log('Navigating to store:', store);
    
    // Navigate to the store-specific page
    window.location.href = `${store}.html`;
}

// Legacy function for compatibility
function switchTab(store) {
    switchStore(store);
}

// Filter and Search Functions
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredUsers = allUsers;
    
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.userId.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filteredUsers = filteredUsers.map(user => ({
            ...user,
            orders: user.orders.filter(order => order.status === statusFilter)
        })).filter(user => user.orders.length > 0);
    }
    
    // Update display with filtered users
    const container = document.getElementById('usersContainer');
    container.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');
}

function filterByStatus() {
    filterUsers();
}

// View Toggle Functions
function toggleView(viewType) {
    const listBtn = document.getElementById('listViewBtn');
    const cardsBtn = document.getElementById('cardsViewBtn');
    
    if (viewType === 'list') {
        listBtn.classList.add('active');
        cardsBtn.classList.remove('active');
        // Implement list view if needed
    } else {
        cardsBtn.classList.add('active');
        listBtn.classList.remove('active');
        // Cards view is default
    }
}

// Utility Functions
function updateConnectionStatus(status) {
    const statusDot = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');
    
    switch (status) {
        case 'connected':
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connected';
            break;
        case 'connecting':
            statusDot.className = 'status-dot';
            statusText.textContent = 'Connecting...';
            break;
        case 'disconnected':
            statusDot.className = 'status-dot';
            statusText.textContent = 'Disconnected';
            break;
    }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const container = document.getElementById('usersContainer');
    
    if (show) {
        spinner.style.display = 'flex';
        container.style.display = 'none';
    } else {
        spinner.style.display = 'none';
        container.style.display = 'grid';
    }
}

function showError(message) {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Auto-refresh Functions
function startAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    
    refreshTimer = setInterval(() => {
        refreshData();
    }, REFRESH_INTERVAL);
}

async function refreshData() {
    try {
        await loadData();
        console.log('Data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

// Event Listeners
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeOrderModal();
        closeCreateOrderModal();
    }
});

// Click outside modal to close
document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeOrderModal();
    }
});

document.getElementById('createOrderModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCreateOrderModal();
    }
});

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
