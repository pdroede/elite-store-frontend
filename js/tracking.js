// Order Tracking System

class OrderTracking {
    constructor() {
        this.initializeTracking();
    }

    initializeTracking() {
        const form = document.getElementById('trackingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleTrackingSubmit(e));
        }
    }

    async handleTrackingSubmit(e) {
        e.preventDefault();
        
        const orderNumber = document.getElementById('orderNumber').value.trim();
        
        if (!orderNumber) {
            this.showError('Please enter an order number');
            return;
        }

        // Hide previous results
        this.hideAllSections();
        
        // Show loading state
        this.showLoading();
        
        // Simulate API call delay
        setTimeout(() => {
            this.hideLoading();
            this.trackOrder(orderNumber);
        }, 1000);
    }

    trackOrder(orderNumber) {
        // Mock order data - In production, this would come from your backend API
        const mockOrders = {
            'ES-2025-001234': {
                orderNumber: 'ES-2025-001234',
                orderDate: '2025-09-10',
                total: '€35.99',
                status: 'shipped',
                trackingNumber: 'DHL1234567890',
                carrier: 'DHL',
                carrierUrl: 'https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?lang=de&idc=',
                estimatedDelivery: '2025-09-13',
                currentStep: 3
            },
            'ES-2025-001235': {
                orderNumber: 'ES-2025-001235',
                orderDate: '2025-09-11',
                total: '€35.99',
                status: 'processing',
                trackingNumber: null,
                carrier: null,
                carrierUrl: null,
                estimatedDelivery: '2025-09-14',
                currentStep: 2
            },
            'ES-2025-001236': {
                orderNumber: 'ES-2025-001236',
                orderDate: '2025-09-09',
                total: '€35.99',
                status: 'delivered',
                trackingNumber: 'DHL0987654321',
                carrier: 'DHL',
                carrierUrl: 'https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?lang=de&idc=',
                estimatedDelivery: '2025-09-12',
                currentStep: 4
            }
        };

        const order = mockOrders[orderNumber.toUpperCase()];
        
        if (order) {
            this.displayOrderStatus(order);
        } else {
            this.showError('Order not found. Please check your order number and try again.');
        }
    }

    displayOrderStatus(order) {
        // Update order details
        document.getElementById('displayOrderNumber').textContent = order.orderNumber;
        document.getElementById('displayOrderDate').textContent = this.formatDate(order.orderDate);
        document.getElementById('displayOrderTotal').textContent = order.total;
        
        // Update shipping info
        document.getElementById('displayTrackingNumber').textContent = order.trackingNumber || 'Not yet assigned';
        document.getElementById('displayCarrier').textContent = order.carrier || 'Processing';
        document.getElementById('displayEstDelivery').textContent = this.formatDate(order.estimatedDelivery);
        
        // Update progress
        this.updateProgress(order.currentStep);
        
        // Show tracking link if available
        if (order.trackingNumber && order.carrierUrl) {
            this.showTrackingLink(order.trackingNumber, order.carrierUrl);
        } else {
            this.hideTrackingLink();
        }
        
        // Show the order status section
        document.getElementById('orderStatus').classList.remove('hidden');
    }

    updateProgress(currentStep) {
        const steps = ['step1', 'step2', 'step3', 'step4'];
        const progressLine = document.getElementById('progressLine');
        
        // Reset all steps
        steps.forEach((stepId, index) => {
            const step = document.getElementById(stepId);
            if (index + 1 <= currentStep) {
                // Completed steps
                step.className = 'w-8 h-8 bg-sage-green rounded-full flex items-center justify-center text-white text-sm font-medium z-10';
                step.textContent = '✓';
            } else if (index + 1 === currentStep + 1) {
                // Current step
                step.className = 'w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black text-sm font-medium z-10 animate-pulse';
                step.textContent = index + 1;
            } else {
                // Future steps
                step.className = 'w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium z-10';
                step.textContent = index + 1;
            }
        });
        
        // Update progress line
        const progressPercentage = ((currentStep - 1) / 3) * 100;
        progressLine.style.height = `${progressPercentage}%`;
    }

    showTrackingLink(trackingNumber, carrierUrl) {
        const trackingLink = document.getElementById('trackingLink');
        const carrierLink = document.getElementById('carrierLink');
        
        carrierLink.href = carrierUrl + trackingNumber;
        trackingLink.classList.remove('hidden');
    }

    hideTrackingLink() {
        document.getElementById('trackingLink').classList.add('hidden');
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.querySelector('p:last-child').textContent = message;
        errorDiv.classList.remove('hidden');
    }

    hideAllSections() {
        document.getElementById('orderStatus').classList.add('hidden');
        document.getElementById('errorMessage').classList.add('hidden');
    }

    showLoading() {
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Tracking...
            </div>
        `;
    }

    hideLoading() {
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Track Order';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize tracking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderTracking();
});

// Test orders for demonstration:
// ES-2025-001234 - Shipped order
// ES-2025-001235 - Processing order  
// ES-2025-001236 - Delivered order
