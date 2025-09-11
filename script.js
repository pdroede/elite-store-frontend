// Elite Store - Professional Dropshipping Website JavaScript
// Author: AI Assistant
// Description: Vanilla JavaScript for cart functionality, product management, and Stripe payment integration

class EliteStore {
    constructor() {
        this.cart = [];
        this.products = [];
        this.isCartOpen = false;
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.isProcessingPayment = false;
        this.API_BASE_URL = 'https://elite-store-backend.onrender.com/api';
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.updateCartUI();
        this.setupImageNavigation();
        
        // Initialize Stripe when page loads
        this.initializeStripe();
    }

    setupImageNavigation() {
        // Adiciona função global para trocar imagens
        window.changeMainImage = (imageSrc, productName) => {
            const mainImageContainer = document.getElementById('main-product-image');
            if (mainImageContainer) {
                mainImageContainer.innerHTML = `
                    <img src="${imageSrc}" alt="${productName}" class="w-full h-full object-cover rounded-2xl" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <span class="text-gray-400 text-lg hidden">Product Image Gallery</span>
                `;
            }
        };

        // Adiciona função global para toggle de reviews
        window.toggleAllReviews = (productId) => {
            const product = this.products.find(p => p.id === productId);
            const container = document.getElementById(`reviews-container-${productId}`);
            const toggleText = document.getElementById(`reviews-toggle-text-${productId}`);
            
            if (!product || !container || !toggleText) return;
            
            const isExpanded = container.dataset.expanded === 'true';
            
            if (isExpanded) {
                // Mostrar apenas 3 reviews
                const limitedReviews = product.customerReviews ? product.customerReviews.slice(0, 3) : [
                    { name: "Sarah M.", rating: 5, comment: "Amazing cleanser! My skin feels so clean yet gentle." },
                    { name: "Lisa R.", rating: 5, comment: "Love the BHA formula! Perfect for combination skin." },
                    { name: "Emma F.", rating: 5, comment: "Perfect for sensitive skin. No irritation at all!" }
                ];
                
                container.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${limitedReviews.map((review, index) => {
                            const colors = [
                                'from-pink-400 to-purple-500',
                                'from-orange-400 to-red-500', 
                                'from-indigo-400 to-purple-500',
                                'from-green-400 to-blue-500',
                                'from-yellow-400 to-orange-500'
                            ];
                            return `
                                <div class="border border-gray-200 rounded p-3 bg-gray-50">
                                    <div class="flex items-center mb-2">
                                        <div class="w-6 h-6 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
                                            ${review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div class="font-medium text-sm">${review.name}</div>
                                            <div class="flex text-gold text-xs">
                                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-700 leading-tight">${review.comment}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                
                toggleText.textContent = 'See all reviews';
                container.dataset.expanded = 'false';
            } else {
                // Mostrar todas as reviews
                const allReviews = product.customerReviews || [
                    { name: "Sarah M.", rating: 5, comment: "Amazing cleanser! My skin feels so clean yet gentle." },
                    { name: "Lisa R.", rating: 5, comment: "Love the BHA formula! Perfect for combination skin." },
                    { name: "Emma F.", rating: 5, comment: "Perfect for sensitive skin. No irritation at all!" },
                    { name: "Anna K.", rating: 5, comment: "I've been using this cleanser for 3 months now and the results are incredible. My blackheads have significantly reduced." },
                    { name: "Maria S.", rating: 4, comment: "Great product! My skin feels so fresh and clean. Highly recommend for oily skin types." },
                    { name: "Jessica T.", rating: 5, comment: "This cleanser is a game-changer! Gentle yet effective, perfect for my sensitive acne-prone skin." },
                    { name: "Carolina R.", rating: 5, comment: "Love how this removes all my makeup without leaving my skin feeling tight or dry." },
                    { name: "Sophie L.", rating: 4, comment: "Amazing texture and the heartleaf extract really helps with redness. Will definitely repurchase!" }
                ];
                
                container.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                        ${allReviews.map((review, index) => {
                            const colors = [
                                'from-pink-400 to-purple-500',
                                'from-orange-400 to-red-500', 
                                'from-indigo-400 to-purple-500',
                                'from-green-400 to-blue-500',
                                'from-yellow-400 to-orange-500',
                                'from-purple-400 to-pink-500',
                                'from-blue-400 to-indigo-500',
                                'from-red-400 to-pink-500'
                            ];
                            return `
                                <div class="border border-gray-200 rounded p-3 bg-gray-50">
                                    <div class="flex items-center mb-2">
                                        <div class="w-6 h-6 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
                                            ${review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div class="font-medium text-sm">${review.name}</div>
                                            <div class="flex text-gold text-xs">
                                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-700 leading-tight">${review.comment}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                
                toggleText.textContent = 'Show less';
                container.dataset.expanded = 'true';
            }
        };
    }

    // Initialize Stripe
    async initializeStripe() {
        try {
            // Check if Stripe is available
            if (typeof Stripe === 'undefined') {
                console.error('Stripe.js not loaded');
                return;
            }
            
            // Initialize Stripe with your publishable key (TEST MODE)
            this.stripe = Stripe('pk_test_51RhRw1KC1EgAKi0LV547I6dGQm7fmP8tIYnMUPiVCe7Kz8ZV1Bll4AXnL9QzP3mQ8OHRSTsVkyNc5mjeEfiY9F0s00XuHO5kQ8');
            
            // Create elements instance
            this.elements = this.stripe.elements();
            
            // Create card element immediately
            this.cardElement = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        fontFamily: '"Inter", sans-serif',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                    invalid: {
                        color: '#fa755a',
                        iconColor: '#fa755a'
                    }
                },
            });
            
            console.log('🧪 Stripe initialized successfully (TEST MODE)');
            console.log('💳 Use test card: 4242 4242 4242 4242');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
        }
    }

    setupStripeElements() {
        if (!this.elements) return;

        // Create card element
        this.cardElement = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
            },
        });

        // Add event listeners for Stripe
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }
    }

    // Product data - In a real application, this would come from an API
    loadProducts() {
        this.products = [
            {
                id: 1,
                name: "Anua Heartleaf Pore Deep Cleansing Foam",
                price: 16.99,
                originalPrice: 24.99,
                image: "assets/products/anua-cleanser-1.png",
                gallery: [
                    "assets/products/anua-cleanser-1.png",
                    "assets/products/anua-cleanser-2.png"
                ],
                rating: 4.8,
                reviews: 1847,
                category: "Cleansers",
                description: "Gentle yet effective pore deep cleansing foam with Heartleaf extract and BHA for clear, smooth skin. Perfect for daily use, this cleanser removes impurities while maintaining skin's natural moisture barrier.",
                features: ["Heartleaf Extract", "BHA Formula", "Deep Pore Cleansing", "Gentle on Skin", "pH Balanced", "Suitable for Sensitive Skin"],
                ingredients: "Houttuynia Cordata Flower/Leaf/Stem Water 33.32% + Quercetinol™ 10,000ppb, Glycerin, Water, Sodium Cocoyl Isethionate, Glycol Distearate, Disodium Laureth Sulfosuccinate",
                size: "150ml / 5.07 fl. oz",
                brand: "Anua",
                howToUse: "Apply a small amount to wet hands and work into a rich lather. Gently massage onto face, avoiding eye area. Rinse thoroughly with lukewarm water. Use morning and evening.",
                benefits: ["Removes blackheads and whiteheads", "Controls excess oil", "Soothes irritated skin", "Prevents breakouts"],
                skinType: "All skin types, especially oily and acne-prone",
                reviews_data: [
                    {
                        name: "Sarah M.",
                        rating: 5,
                        text: "Amazing cleanser! My skin feels so clean yet gentle. I've been using this for 3 months now and the results are incredible. My blackheads have significantly reduced.",
                        verified: true,
                        date: "2024-08-15"
                    },
                    {
                        name: "Maria S.",
                        rating: 5,
                        text: "Great product! My skin feels so fresh and clean. Highly recommend for oily skin types. The packaging is also beautiful and premium.",
                        verified: true,
                        date: "2024-08-10"
                    },
                    {
                        name: "Emma R.",
                        rating: 5,
                        text: "Perfect for sensitive skin. No irritation at all! This cleanser is a game-changer. Gentle yet effective, perfect for my sensitive acne-prone skin.",
                        verified: true,
                        date: "2024-08-05"
                    }
                ]
            }
        ];
    }

    setupEventListeners() {
        // Cart toggle
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.toggleCart());
        }
        
        const closeCart = document.getElementById('close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }
        
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openCheckoutModal());
        }

        // Close mobile menu when clicking on links
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCartOpen) {
                this.closeCart();
            }
        });

        // Contact form submission
        const contactForm = document.querySelector('#contact form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e.target);
            });
        }

        // Payment modal close buttons
        const closePaymentModal = document.getElementById('close-payment-modal');
        if (closePaymentModal) {
            closePaymentModal.addEventListener('click', () => this.closeCheckoutModal());
        }

        const closeSuccessModal = document.getElementById('close-success-modal');
        if (closeSuccessModal) {
            closeSuccessModal.addEventListener('click', () => this.closeSuccessModal());
        }

        // Payment form submission
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer relative green-card-hover';
        
        // Add product badges
        const badges = this.getProductBadges(product);
        const badgeHTML = badges.length > 0 ? `
            <div class="absolute top-4 left-4 z-10 space-y-2">
                ${badges.map(badge => `
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${badge.class}">
                        ${badge.text}
                    </span>
                `).join('')}
            </div>
        ` : '';
        
        card.innerHTML = `
            ${badgeHTML}
            <div class="relative overflow-hidden">
                <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <span class="text-gray-400 text-sm hidden">Product Image</span>
                </div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-charcoal hover:bg-gold transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">${product.category}</span>
                    <div class="flex items-center">
                        <svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-xs text-green-600 font-medium">Verified</span>
                    </div>
                </div>
                <h3 class="text-xl font-semibold text-dark-gray mb-2 group-hover:text-forest transition-colors">
                    ${product.name}
                </h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                    ${product.description}
                </p>
                <div class="flex items-center mb-4">
                    <div class="flex text-gold mr-2">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span class="text-sm text-gray-500">${product.rating}</span>
                    <span class="text-sm text-gray-400 ml-1">(${product.reviews})</span>
                    <span class="ml-auto text-xs text-green-600 font-medium">✓ In Stock</span>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-2xl font-bold text-dark-gray">€${product.price}</span>
                        ${product.originalPrice ? `<span class="text-sm text-gray-500 line-through ml-2">€${product.originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn bg-sage-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-sage-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
                            data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span>🚚 Free shipping EU</span>
                        <span>📦 2-day delivery</span>
                        <span>🔄 Easy returns</span>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart-btn') && !e.target.closest('.add-to-cart-btn')) {
                this.showProductModal(product);
            }
        });

        card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addToCart(product);
            this.showNotification('Product added to cart!');
        });

        return card;
    }

    getProductBadges(product) {
        const badges = [];
        
        // Add badges based on product properties
        if (product.id === 1) {
            badges.push({ text: 'Best Seller', class: 'bg-red-500 text-white' });
        }
        if (product.rating >= 4.8) {
            badges.push({ text: 'Premium', class: 'bg-bronze text-cream' });
        }
        if (product.id === 3 || product.id === 5) {
            badges.push({ text: 'Limited', class: 'bg-purple-500 text-white' });
        }
        if (product.originalPrice) {
            const discount = Math.round((1 - product.price / product.originalPrice) * 100);
            badges.push({ text: `-${discount}%`, class: 'bg-green-500 text-white' });
        }
        
        return badges;
    }

    addToCart(product) {
        console.log('Adding to cart:', product.name, 'Current cart length:', this.cart.length);
        console.log('Product being added:', product);
        
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Updated existing item quantity:', existingItem.quantity);
        } else {
            this.cart.push({ ...product, quantity: 1 });
            console.log('Added new item to cart');
        }

        console.log('Cart after adding:', this.cart);
        console.log('Cart length after adding:', this.cart.length);
        
        this.updateCartUI();
        this.showCartAnimation();
        this.saveCartToStorage();
        
        // Verify cart was saved
        setTimeout(() => {
            console.log('Cart check after save:', this.cart.length, this.cart);
        }, 50);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartUI();
        this.saveCartToStorage();
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.updateCartUI();
                this.saveCartToStorage();
            }
        }
    }

    changeQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.updateCartUI();
                this.saveCartToStorage();
            }
        }
    }

    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartFooter = document.getElementById('cart-footer');
        const emptyCart = document.getElementById('empty-cart');
        const cartTotal = document.getElementById('cart-total');

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        console.log('updateCartUI called - Total items:', totalItems, 'Cart count element:', cartCount);

        // Update cart count badge
        if (cartCount) {
            cartCount.textContent = totalItems;
            console.log('Setting cart count to:', totalItems);
            if (totalItems > 0) {
                cartCount.classList.remove('hidden');
                console.log('Showing cart count badge');
            } else {
                cartCount.classList.add('hidden');
                console.log('Hiding cart count badge');
            }
        } else {
            console.log('Cart count element not found!');
        }

        if (this.cart.length === 0) {
            if (emptyCart) emptyCart.classList.remove('hidden');
            if (cartFooter) cartFooter.classList.add('hidden');
            cartItems.innerHTML = '<div id="empty-cart" class="text-center text-gray-500 mt-20"><svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12"/></svg><p>Your cart is empty</p></div>';
        } else {
            if (emptyCart) emptyCart.classList.add('hidden');
            if (cartFooter) cartFooter.classList.remove('hidden');
            if (cartTotal) cartTotal.textContent = `€${totalPrice.toFixed(2)}`;

            cartItems.innerHTML = this.cart.map((item, index) => `
                <div class="flex items-center space-x-4 py-4 border-b border-gray-100" id="cart-item-${item.id}">
                    <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-lg" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                        <span class="text-xs text-gray-400 hidden">IMG</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-dark-gray truncate">${item.name}</h4>
                        <p class="text-forest font-semibold">€${item.price}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors" 
                                onclick="window.eliteStore.changeQuantity(${item.id}, -1)">
                            -
                        </button>
                        <span class="w-8 text-center font-medium" id="qty-${item.id}">${item.quantity}</span>
                        <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                onclick="window.eliteStore.changeQuantity(${item.id}, 1)">
                            +
                        </button>
                    </div>
                    <button class="text-red-500 hover:text-red-700 transition-colors ml-2"
                            onclick="window.eliteStore.removeFromCart(${item.id})">
                        🗑️
                    </button>
                </div>
            `).join('');
        }
    }

    increaseQuantity(productId) {
        console.log('Increasing quantity for product:', productId);
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            this.updateCartUI();
            this.saveCartToStorage();
        }
    }

    decreaseQuantity(productId) {
        console.log('Decreasing quantity for product:', productId);
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.updateCartUI();
                this.saveCartToStorage();
            } else {
                this.removeFromCart(productId);
            }
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');

        if (this.isCartOpen) {
            this.closeCart();
        } else {
            cartSidebar.classList.remove('translate-x-full');
            cartOverlay.classList.remove('hidden');
            this.isCartOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');

        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
        this.isCartOpen = false;
        document.body.style.overflow = 'auto';
    }

    showCartAnimation() {
        const cartButton = document.getElementById('cart-btn');
        if (cartButton) {
            cartButton.classList.add('cart-bounce');
            setTimeout(() => {
                cartButton.classList.remove('cart-bounce');
            }, 300);
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    }

    showProductModal(product) {
        const modal = document.getElementById('product-modal');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="relative">
                <button id="close-modal-btn" class="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                
                <div class="p-4">
                    <!-- Layout Amazon-style: Imagem | Info Principal | Detalhes -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <!-- Imagens do produto - 5 colunas -->
                        <div class="lg:col-span-5">
                            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2" id="main-product-image">
                                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                                <span class="text-gray-400 text-sm hidden">Product Image</span>
                            </div>
                            <div class="grid grid-cols-4 gap-1">
                                ${(product.gallery || [product.image]).map((img, index) => `
                                    <div class="aspect-square bg-gray-100 rounded cursor-pointer hover:ring-1 hover:ring-forest overflow-hidden" onclick="changeMainImage('${img}', '${product.name}')">
                                        <img src="${img}" alt="${product.name} ${index + 1}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                                        <span class="text-gray-400 text-xs hidden">IMG</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Informações principais - 4 colunas -->
                        <div class="lg:col-span-4 space-y-3">
                            <div>
                                <h1 class="text-xl font-bold text-dark-gray mb-1">${product.name}</h1>
                                <div class="flex items-center mb-2">
                                    <div class="flex text-gold text-sm mr-2">
                                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                                    </div>
                                    <span class="text-xs text-blue-600 hover:underline cursor-pointer">${product.rating} (${product.reviews} reviews)</span>
                                </div>
                            </div>
                            
                            <div class="border-t pt-3">
                                <div class="text-2xl font-bold text-red-600 mb-1">€${product.price}</div>
                                <div class="text-xs text-gray-600 mb-3">FREE Returns</div>
                                <p class="text-sm text-gray-700 leading-tight">${product.description}</p>
                            </div>
                            
                            <!-- Benefits compactos -->
                            <div class="border-t pt-3">
                                <h4 class="font-semibold mb-2 text-sm">Key Benefits:</h4>
                                <ul class="space-y-1 text-xs text-gray-700">
                                    <li class="flex items-start"><span class="text-green-600 mr-2">✓</span>Deep pore cleansing with Heartleaf extract</li>
                                    <li class="flex items-start"><span class="text-green-600 mr-2">✓</span>Natural BHA formula (33.4% concentration)</li>
                                    <li class="flex items-start"><span class="text-green-600 mr-2">✓</span>Gentle on sensitive skin</li>
                                    <li class="flex items-start"><span class="text-green-600 mr-2">✓</span>Removes excess oil and impurities</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Painel de compra - 3 colunas -->
                        <div class="lg:col-span-3">
                            <div class="border border-gray-300 rounded-lg p-4 bg-white sticky top-4">
                                <div class="text-2xl font-bold text-red-600 mb-2">€${product.price}</div>
                                <div class="text-xs text-gray-600 mb-3">
                                    <div class="flex items-center mb-1">
                                        <span class="text-green-600 mr-1">✓</span>
                                        <span>FREE delivery across Europe</span>
                                    </div>
                                    <div class="flex items-center mb-1">
                                        <span class="text-green-600 mr-1">✓</span>
                                        <span>Usually ships within 24 hours</span>
                                    </div>
                                    <div class="flex items-center">
                                        <span class="text-green-600 mr-1">✓</span>
                                        <span>In Stock</span>
                                    </div>
                                </div>
                                
                                <div class="space-y-2">
                                    <button id="modal-add-cart-${product.id}" class="w-full bg-sage-green text-white py-2 px-4 text-sm font-semibold rounded hover:bg-sage-dark transition-colors">
                                        Add to Cart
                                    </button>
                                    <button id="modal-buy-now-${product.id}" class="w-full bg-sage-green text-white py-2 px-4 text-sm font-semibold rounded hover:bg-sage-dark transition-colors">
                                        Buy Now
                                    </button>
                                </div>
                                
                                <div class="mt-3 pt-3 border-t text-xs text-gray-600">
                                    <div class="mb-1"><strong>Secure transaction</strong></div>
                                    <div class="mb-1">Ships from: Netherlands</div>
                                    <div>Sold by: Elite Store</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Seção inferior: Reviews compactas -->
                    <div class="mt-4 pt-4 border-t">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-lg font-semibold">Customer reviews</h3>
                            <button class="text-blue-600 text-sm hover:underline" onclick="toggleAllReviews(${product.id})">
                                <span id="reviews-toggle-text-${product.id}">See all reviews</span>
                            </button>
                        </div>
                        
                        <div id="reviews-container-${product.id}">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                ${product.customerReviews ? product.customerReviews.slice(0, 3).map(review => `
                                    <div class="border border-gray-200 rounded p-3 bg-gray-50">
                                        <div class="flex items-center mb-2">
                                            <div class="w-6 h-6 bg-forest rounded-full flex items-center justify-center text-cream font-bold text-xs mr-2">
                                                ${review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div class="font-medium text-sm">${review.name}</div>
                                                <div class="flex text-gold text-xs">
                                                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                                </div>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-700 leading-tight">${review.comment}</p>
                                    </div>
                                `).join('') : `
                                    <div class="border border-gray-200 rounded p-3 bg-gray-50">
                                        <div class="flex items-center mb-2">
                                            <div class="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">S</div>
                                            <div>
                                                <div class="font-medium text-sm">Sarah M.</div>
                                                <div class="flex text-gold text-xs">★★★★★</div>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-700 leading-tight">"Amazing cleanser! My skin feels so clean yet gentle."</p>
                                    </div>
                                    <div class="border border-gray-200 rounded p-3 bg-gray-50">
                                        <div class="flex items-center mb-2">
                                            <div class="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">L</div>
                                            <div>
                                                <div class="font-medium text-sm">Lisa R.</div>
                                                <div class="flex text-gold text-xs">★★★★★</div>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-700 leading-tight">"Love the BHA formula! Perfect for combination skin."</p>
                                    </div>
                                    <div class="border border-gray-200 rounded p-3 bg-gray-50">
                                        <div class="flex items-center mb-2">
                                            <div class="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">E</div>
                                            <div>
                                                <div class="font-medium text-sm">Emma F.</div>
                                                <div class="flex text-gold text-xs">★★★★★</div>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-700 leading-tight">"Perfect for sensitive skin. No irritation at all!"</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Wait for DOM to update before adding event listeners
        setTimeout(() => {
            // Remove existing event listeners to prevent duplicates
            const addCartBtn = document.getElementById(`modal-add-cart-${product.id}`);
            const buyNowBtn = document.getElementById(`modal-buy-now-${product.id}`);
            const closeBtn = document.getElementById('close-modal-btn');

            console.log('Button elements found:');
            console.log('addCartBtn:', addCartBtn);
            console.log('buyNowBtn:', buyNowBtn);
            console.log('closeBtn:', closeBtn);

            // Clone elements to remove all event listeners
            if (addCartBtn) {
                const newAddCartBtn = addCartBtn.cloneNode(true);
                addCartBtn.parentNode.replaceChild(newAddCartBtn, addCartBtn);
                newAddCartBtn.addEventListener('click', () => {
                    console.log('Add to Cart clicked');
                    this.addToCart(product);
                    this.showNotification('Product added to cart!');
                    this.closeProductModal();
                });
            } else {
                console.error('Add Cart button not found!');
            }

            if (buyNowBtn) {
                const newBuyNowBtn = buyNowBtn.cloneNode(true);
                buyNowBtn.parentNode.replaceChild(newBuyNowBtn, buyNowBtn);
                newBuyNowBtn.addEventListener('click', () => {
                    console.log('Buy Now clicked for product:', product.name);
                    this.addToCart(product);
                    this.closeProductModal();
                    // Add small delay to ensure cart is updated
                    setTimeout(() => {
                        console.log('Opening checkout modal after Buy Now');
                        this.openCheckoutModal();
                    }, 100);
                });
            } else {
                console.error('Buy Now button not found!');
            }

            if (closeBtn) {
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                newCloseBtn.addEventListener('click', () => this.closeProductModal());
            }
        }, 50);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeProductModal();
            }
        });
    }

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-sage-green text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    async openCheckoutModal() {
        console.log('openCheckoutModal called', 'cart length:', this.cart.length);
        console.log('Current cart contents:', JSON.stringify(this.cart, null, 2));
        
        if (this.cart.length === 0) {
            console.log('Cart is empty, showing alert');
            alert('Your cart is empty!');
            return;
        }

        const modal = document.getElementById('payment-modal');
        console.log('Modal element found:', modal);
        
        if (!modal) {
            console.error('Payment modal not found!');
            return;
        }
        
        this.populateCheckoutSummary();
        
        // Show modal first
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.closeCart();
        console.log('Modal should be visible now');
        
        // Initialize Stripe if not already done
        if (!this.stripe) {
            console.log('Initializing Stripe...');
            await this.initializeStripe();
        }
        
        // Mount card element after modal is visible
        if (this.cardElement) {
            const cardElementContainer = document.getElementById('card-element');
            if (cardElementContainer) {
                // Clear any existing content
                cardElementContainer.innerHTML = '';
                console.log('Mounting card element...');
                this.cardElement.mount('#card-element');
                
                // Add event listeners for card changes
                this.cardElement.on('change', (event) => {
                    const displayError = document.getElementById('card-errors');
                    if (event.error) {
                        displayError.textContent = event.error.message;
                    } else {
                        displayError.textContent = '';
                    }
                });
            }
        }
        
        // Add payment button event listener
        const paymentButton = document.getElementById('submit-payment');
        if (paymentButton) {
            // Remove any existing listeners
            paymentButton.replaceWith(paymentButton.cloneNode(true));
            const newPaymentButton = document.getElementById('submit-payment');
            newPaymentButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handlePaymentSubmit(e);
            });
        }
        
        console.log('Modal should be visible now with card element');
    }

    closeCheckoutModal() {
        const modal = document.getElementById('payment-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Unmount Stripe elements
        if (this.cardElement) {
            this.cardElement.unmount();
        }
    }

    closeSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    populateCheckoutSummary() {
        const itemsContainer = document.getElementById('checkout-items');
        const totalElement = document.getElementById('checkout-total');
        const subtotalElement = document.getElementById('subtotal');
        
        console.log('populateCheckoutSummary called with cart:', this.cart);
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Amazon-style item display
        itemsContainer.innerHTML = this.cart.map(item => `
            <div class="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-b-0">
                <div class="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="w-full h-full flex items-center justify-center text-xs text-gray-400 hidden">IMG</div>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 line-clamp-2">${item.name}</h4>
                    <p class="text-xs text-gray-600 mt-1">Qty: ${item.quantity}</p>
                    <p class="text-sm font-medium text-gray-900 mt-1">€${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            </div>
        `).join('');
        
        // Update price elements (no tax)
        if (subtotalElement) subtotalElement.textContent = `€${total.toFixed(2)}`;
        totalElement.textContent = `€${total.toFixed(2)}`;
        
        console.log('Amazon-style checkout summary populated - total (no tax):', total);
    }

    async handlePaymentSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Payment form submitted - processing payment...');
        console.log('Current cart:', this.cart);
        
        // Check if cart has items
        if (!this.cart || this.cart.length === 0) {
            alert('Your cart is empty. Please add items before checkout.');
            return false;
        }
        
        // Collect all form data
        const formData = this.collectFormData();
        console.log('Form data collected:', formData);
        
        // Validate required fields
        const validation = this.validateFormData(formData);
        if (!validation.isValid) {
            alert(validation.message);
            return false;
        }
        
        if (!this.stripe || !this.cardElement) {
            alert('Payment system not available. Please try again.');
            return false;
        }

        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');
        
        // Show loading state
        submitButton.disabled = true;
        buttonText.textContent = 'Processing...';
        spinner.classList.remove('hidden');

        try {
            console.log('Creating payment method with billing details...');
            
            // Create payment method with the card element and billing details
            const {error, paymentMethod} = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
                billing_details: {
                    name: formData.fullName,
                    email: formData.email,
                    address: {
                        line1: formData.addressLine1,
                        line2: formData.addressLine2,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.postalCode,
                        country: formData.country,
                    },
                },
            });

            if (error) {
                console.error('Payment method creation failed:', error);
                this.showCardError(error.message);
                this.resetSubmitButton();
                return false;
            }

            console.log('Payment method created successfully:', paymentMethod.id);

            // Create payment intent on the server
            console.log('Creating payment intent...');
            const response = await fetch(`${this.API_BASE_URL}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems: this.cart, // Changed from 'cart' to 'cartItems'
                    customerInfo: { // Changed from 'customer' to 'customerInfo'
                        name: formData.fullName,
                        email: formData.email,
                        address: {
                            line1: formData.addressLine1,
                            line2: formData.addressLine2,
                            city: formData.city,
                            state: formData.state,
                            postal_code: formData.postalCode,
                            country: formData.country,
                        }
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const paymentData = await response.json();
            console.log('Payment intent created with client secret');

            // Confirm the payment with the payment method
            console.log('Confirming payment with client secret:', paymentData.clientSecret);
            const {error: confirmError, paymentIntent} = await this.stripe.confirmCardPayment(paymentData.clientSecret, {
                payment_method: paymentMethod.id
            });

            if (confirmError) {
                console.error('Payment confirmation failed:', confirmError);
                console.error('Error code:', confirmError.code);
                console.error('Error type:', confirmError.type);
                this.showCardError(`Payment failed: ${confirmError.message}`);
                this.resetSubmitButton();
                return false;
            }

            console.log('Payment confirmed successfully:', paymentIntent);
            
            if (paymentIntent.status === 'succeeded') {
                console.log('Payment successful!');
                
                // Extract card information from paymentIntent
                const cardInfo = {
                    last4: paymentIntent.payment_method?.card?.last4 || 'XXXX',
                    brand: paymentIntent.payment_method?.card?.brand || 'card'
                };
                
                this.handlePaymentSuccess(paymentIntent.amount / 100, cardInfo); // Convert from cents and pass card info
            } else {
                console.error('Payment not completed:', paymentIntent.status);
                this.showCardError(`Payment status: ${paymentIntent.status}. Please try again.`);
                this.resetSubmitButton();
            }

        } catch (error) {
            console.error('Payment processing error:', error);
            this.showCardError('Payment failed. Please try again.');
            this.resetSubmitButton();
        }
        
        return false;
    }

    collectFormData() {
        const firstName = document.getElementById('first-name')?.value.trim() || '';
        const lastName = document.getElementById('last-name')?.value.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        return {
            fullName: fullName,
            firstName: firstName,
            lastName: lastName,
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            addressLine1: document.getElementById('address-line1')?.value.trim() || '',
            addressLine2: document.getElementById('address-line2')?.value.trim() || '',
            city: document.getElementById('city')?.value.trim() || '',
            state: document.getElementById('state')?.value.trim() || '',
            postalCode: document.getElementById('postal-code')?.value.trim() || '',
            country: document.getElementById('country')?.value || '',
        };
    }

    validateFormData(data) {
        if (!data.fullName) {
            return { isValid: false, message: 'Please enter your full name.' };
        }
        if (!data.email) {
            return { isValid: false, message: 'Please enter your email address.' };
        }
        if (!data.addressLine1) {
            return { isValid: false, message: 'Please enter your address.' };
        }
        if (!data.city) {
            return { isValid: false, message: 'Please enter your city.' };
        }
        if (!data.postalCode) {
            return { isValid: false, message: 'Please enter your ZIP code.' };
        }
        if (!data.country) {
            return { isValid: false, message: 'Please select your country.' };
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }
        
        return { isValid: true };
    }

    async simulatePaymentProcess(paymentMethod, amount) {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful payment
            const mockCardInfo = { last4: '4242', brand: 'visa' };
            this.handlePaymentSuccess(amount, mockCardInfo);
            
        } catch (error) {
            this.showCardError('Payment failed. Please try again.');
            this.resetSubmitButton();
        }
    }

    handlePaymentSuccess(amount, cardInfo = null) {
        console.log('🎉 Payment success! Amount received:', amount);
        console.log('💳 Card info received:', cardInfo);
        console.log('📦 Cart contents before clearing:', this.cart);
        
        // Calculate cart total for verification
        const cartTotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        console.log('💰 Cart total calculated:', cartTotal);
        
        // Collect customer data from form
        const customerData = this.collectCustomerData();
        console.log('👤 Customer data collected:', customerData);
        
        // Create order data
        const orderData = this.createOrderData(customerData, amount, cardInfo);
        console.log('📋 Order data created:', orderData);
        
        // Save order data to localStorage
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        console.log('💾 Order saved to localStorage');
        
        // Clear cart
        this.cart = [];
        this.updateCartUI();
        this.saveCartToStorage();
        
        // Close modal
        this.closeCheckoutModal();
        
        // Redirect to confirmation page
        window.location.href = 'pages/order-confirmation.html';
    }

    collectCustomerData() {
        // Get data from checkout form using the correct IDs
        const firstName = document.getElementById('first-name')?.value.trim() || '';
        const lastName = document.getElementById('last-name')?.value.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const email = document.getElementById('email')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        
        // Complete address information
        const addressLine1 = document.getElementById('address-line1')?.value.trim() || '';
        const addressLine2 = document.getElementById('address-line2')?.value.trim() || '';
        const city = document.getElementById('city')?.value.trim() || '';
        const state = document.getElementById('state')?.value.trim() || '';
        const postalCode = document.getElementById('postal-code')?.value.trim() || '';
        const country = document.getElementById('country')?.value || '';

        console.log('🔍 Collecting customer data from form fields:');
        console.log('- Name:', fullName);
        console.log('- Email:', email);
        console.log('- Phone:', phone);
        console.log('- Address Line 1:', addressLine1);
        console.log('- Address Line 2:', addressLine2);
        console.log('- City:', city);
        console.log('- State:', state);
        console.log('- Postal Code:', postalCode);
        console.log('- Country:', country);

        // Validate required fields
        if (!fullName || !email || !phone || !addressLine1 || !city || !postalCode || !country) {
            throw new Error('Por favor, preencha todos os campos obrigatórios de entrega.');
        }

        return {
            name: fullName,
            email: email,
            phone: phone,
            address: {
                line1: addressLine1,
                line2: addressLine2,
                city: city,
                state: state,
                postal_code: postalCode,
                country: country
            }
        };
    }

    createOrderData(customerData, amount, cardInfo = null) {
        const orderNumber = 'ES-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const currentDate = new Date();
        const deliveryDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        // Calculate totals from cart items to ensure accuracy
        const cartTotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const finalAmount = amount || cartTotal; // Use amount if available, otherwise calculate from cart

        console.log('💰 Creating order data with amount:', finalAmount);
        console.log('🛒 Cart total calculated:', cartTotal);
        console.log('👤 Using customer data:', customerData);
        console.log('💳 Using card info:', cardInfo);

        return {
            orderNumber: orderNumber,
            customerInfo: {
                name: customerData?.name || 'Nome não informado',
                email: customerData?.email || 'email@nao-informado.com',
                phone: customerData?.phone || 'Telefone não informado'
            },
            shippingAddress: {
                street: customerData?.address?.street || 'Endereço não informado',
                city: customerData?.address?.city || 'Cidade não informada',
                postalCode: customerData?.address?.postalCode || 'CEP não informado',
                country: customerData?.address?.country || 'País não informado'
            },
            paymentInfo: {
                cardLast4: cardInfo?.last4 || 'XXXX',
                cardBrand: cardInfo?.brand || 'card'
            },
            items: this.cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            totals: {
                subtotal: finalAmount,
                shipping: 0.00,
                total: finalAmount
            },
            orderDate: currentDate.toISOString(),
            estimatedDelivery: deliveryDate.toISOString(),
            status: 'confirmed'
        };
    }

    showSuccessMessage(amount) {
        const successHTML = `
            <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-dark-gray mb-2">Payment Successful!</h3>
                    <p class="text-gray-600 mb-6">Your order of $${amount.toFixed(2)} has been processed successfully.</p>
                    <button onclick="this.parentElement.parentElement.remove()" class="bg-sage-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-dark transition-colors">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successHTML);
    }

    showCardError(message) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = message;
        setTimeout(() => {
            errorElement.textContent = '';
        }, 5000);
    }

    resetSubmitButton() {
        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');
        
        submitButton.disabled = false;
        buttonText.textContent = 'Pay Now';
        spinner.classList.add('hidden');
    }

    checkout() {
        // Legacy method - now opens the new checkout modal
        this.openCheckoutModal();
    }

    handleContactForm(form) {
        const formData = new FormData(form);
        const name = formData.get('name') || form.querySelector('input[type="text"]').value;
        const email = formData.get('email') || form.querySelector('input[type="email"]').value;
        const message = formData.get('message') || form.querySelector('textarea').value;

        // Simulate form submission
        if (name && email && message) {
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        } else {
            alert('Please fill in all fields.');
        }
    }

    saveCartToStorage() {
        localStorage.setItem('elitestore-cart', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
        const saved = localStorage.getItem('elitestore-cart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    }

    // Initialize on page load
    static init() {
        return new EliteStore();
    }
}

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.store = EliteStore.init();
});

// Payment processing functions
async function createPaymentIntent(cartItems, customerInfo) {
    try {
        const response = await fetch('https://elite-store-backend.onrender.com/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cartItems: cartItems,
                customerInfo: customerInfo
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

async function processStripePayment() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    const customerInfo = {
        name: formData.get('name'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        postalCode: formData.get('postal_code'),
        country: formData.get('country')
    };

    try {
        // Show processing state
        const submitButton = document.getElementById('submit-payment');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        // Create payment intent
        const paymentData = await createPaymentIntent(window.store.cart, customerInfo);

        // Initialize Stripe elements (TEST MODE)
        const stripe = Stripe('pk_test_51RhRw1KC1EgAKi0LV547I6dGQm7fmP8tIYnMUPiVCe7Kz8ZV1Bll4AXnL9QzP3mQ8OHRSTsVkyNc5mjeEfiY9F0s00XuHO5kQ8');
        const elements = stripe.elements({
            clientSecret: paymentData.clientSecret
        });

        // Create payment element
        const paymentElement = elements.create('payment');
        
        // Mount to container (create if doesn't exist)
        let paymentContainer = document.getElementById('stripe-payment-element');
        if (!paymentContainer) {
            paymentContainer = document.createElement('div');
            paymentContainer.id = 'stripe-payment-element';
            paymentContainer.className = 'mb-6';
            document.getElementById('checkout-form').appendChild(paymentContainer);
        }
        
        paymentContainer.innerHTML = '';
        paymentElement.mount('#stripe-payment-element');

        // Confirm payment
        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                    }
                }
            },
            redirect: 'if_required'
        });

        if (confirmError) {
            throw new Error(confirmError.message);
        }

        // Payment succeeded
        alert(`Payment successful! Amount: €${(paymentData.amount / 100).toFixed(2)}`);
        
        // Clear cart and close modal
        window.store.cart = [];
        window.store.updateCartUI();
        window.store.saveCartToStorage();
        window.store.closeCheckout();

    } catch (error) {
        console.error('Payment failed:', error);
        alert(`Payment failed: ${error.message}`);
    } finally {
        // Reset button
        const submitButton = document.getElementById('submit-payment');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Complete Payment';
        }
    }
}

// Additional utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.product-card, section > div');
    animateElements.forEach(el => observer.observe(el));
});

// Performance optimization: Lazy loading
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eliteStore = new EliteStore();
});
