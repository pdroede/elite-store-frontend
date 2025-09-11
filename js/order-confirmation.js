// Order Confirmation Page JavaScript

class OrderConfirmation {
    constructor() {
        this.initializeConfirmation();
        this.initializeGoogleMaps();
        this.setupEventListeners();
    }

    initializeConfirmation() {
        // Get order data from URL parameters or localStorage
        const orderData = this.getOrderData();
        
        if (orderData) {
            this.populateOrderDetails(orderData);
        } else {
            console.error('No order data found');
            this.showError();
        }
    }

    getOrderData() {
        // Try to get data from URL parameters first (passed from Stripe success)
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        // If we have a session ID, we could fetch the data from our server
        // For now, we'll get it from localStorage
        
        const orderData = localStorage.getItem('lastOrder');
        console.log('📦 Raw order data from localStorage:', orderData);
        
        if (orderData) {
            try {
                const parsedData = JSON.parse(orderData);
                console.log('✅ Parsed order data:', parsedData);
                console.log('💰 Order totals:', parsedData.totals);
                console.log('🛍️ Order items:', parsedData.items);
                console.log('👤 Customer info:', parsedData.customerInfo);
                console.log('🏠 Shipping address:', parsedData.shippingAddress);
                console.log('💳 Payment info:', parsedData.paymentInfo);
                return parsedData;
            } catch (e) {
                console.error('❌ Error parsing order data:', e);
                return null;
            }
        }
        
        console.log('⚠️ No order data found in localStorage');
        return null;
    }

    populateOrderDetails(orderData) {
        // Populate order number
        document.getElementById('orderNumber').textContent = orderData.orderNumber;
        
        // Populate customer info
        document.getElementById('customerName').textContent = orderData.customerInfo.name;
        document.getElementById('customerEmail').textContent = orderData.customerInfo.email;
        document.getElementById('customerPhone').textContent = orderData.customerInfo.phone;
        
        // Populate order date
        const orderDate = new Date(orderData.orderDate);
        document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Populate estimated delivery
        const deliveryDate = new Date(orderData.estimatedDelivery);
        document.getElementById('estimatedDelivery').textContent = deliveryDate.toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Populate shipping address
        const addressContainer = document.getElementById('shippingAddress');
        addressContainer.innerHTML = `
            <p class="font-medium">${orderData.customerInfo.name}</p>
            <p>${orderData.shippingAddress.street}</p>
            <p>${orderData.shippingAddress.postalCode} ${orderData.shippingAddress.city}</p>
            <p>${orderData.shippingAddress.country}</p>
        `;
        
        // Populate order items
        this.populateOrderItems(orderData.items);
        
        // Populate totals
        document.getElementById('orderSubtotal').textContent = `€${orderData.totals.subtotal.toFixed(2)}`;
        document.getElementById('orderShipping').textContent = `€${orderData.totals.shipping.toFixed(2)}`;
        document.getElementById('orderTotal').textContent = `€${orderData.totals.total.toFixed(2)}`;
        
        // Populate payment information
        if (orderData.paymentInfo) {
            const cardLast4 = orderData.paymentInfo.cardLast4 || 'XXXX';
            const cardBrand = orderData.paymentInfo.cardBrand || 'card';
            
            document.getElementById('cardInfo').textContent = `Credit Card ending in ${cardLast4}`;
            document.getElementById('cardBrand').textContent = cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1);
        }
        
        // Store address for map
        this.shippingAddress = orderData.shippingAddress;
        
        // Update delivery address placeholder
        this.showDeliveryAddress();
    }

    populateOrderItems(items) {
        const itemsContainer = document.getElementById('orderItems');
        itemsContainer.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item flex items-center space-x-3 p-3 rounded-lg';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${item.name}</h4>
                    <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                </div>
                <div class="text-right">
                    <p class="font-semibold">€${(item.price * item.quantity).toFixed(2)}</p>
                    <p class="text-sm text-gray-600">€${item.price.toFixed(2)} each</p>
                </div>
            `;
            itemsContainer.appendChild(itemElement);
        });
    }

    initializeGoogleMaps() {
        // Instead of loading Google Maps, show delivery address in placeholder
        this.showDeliveryAddress();
    }

    showDeliveryAddress() {
        const deliveryAddressElement = document.getElementById('delivery-address');
        if (this.shippingAddress && deliveryAddressElement) {
            const fullAddress = `${this.shippingAddress.street}, ${this.shippingAddress.city}, ${this.shippingAddress.postalCode}, ${this.shippingAddress.country}`;
            deliveryAddressElement.textContent = fullAddress;
        }
    }

    showMapError() {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                <div class="text-center">
                    <div class="text-gray-400 mb-2">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600">Map not available</p>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Print order button
        const printBtn = document.getElementById('printOrder');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Email order button
        const emailBtn = document.getElementById('emailOrder');
        if (emailBtn) {
            emailBtn.addEventListener('click', () => {
                this.emailOrder();
            });
        }

        // Continue shopping button
        const continueBtn = document.getElementById('continueShopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = '../index.html';
            });
        }

        // Track order button
        const trackBtn = document.getElementById('trackOrder');
        if (trackBtn) {
            trackBtn.addEventListener('click', () => {
                this.showTrackingInfo();
            });
        }
    }

    emailOrder() {
        const orderNumber = document.getElementById('orderNumber').textContent;
        const customerEmail = document.getElementById('customerEmail').textContent;
        
        const subject = `Order Confirmation - ${orderNumber}`;
        const body = `Your order ${orderNumber} has been confirmed and will be processed shortly.`;
        
        window.location.href = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    showTrackingInfo() {
        alert('Tracking information will be sent to your email once your order is shipped.');
    }

    showError() {
        const container = document.querySelector('.max-w-4xl');
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-500 mb-4">
                    <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p class="text-gray-600 mb-6">We couldn't find your order information. Please check your email for the confirmation details.</p>
                <a href="../index.html" class="inline-flex items-center px-6 py-3 bg-sage-green text-white font-medium rounded-lg hover:bg-sage-dark transition-colors">
                    Return to Store
                </a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderConfirmation();
});

// Add fade-in animation to sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.bg-white');
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.classList.add('fade-in-up');
        }, index * 100);
    });
});
