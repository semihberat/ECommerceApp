// Main JavaScript file for the e-commerce site

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the shopping cart from localStorage
    initCart();

    // Add event listeners to all "Add to Cart" buttons
    setupAddToCartButtons();

    // Set up product quantity controls
    setupQuantityControls();

    // Set up product image gallery on product details page
    setupProductGallery();

    // Set up rating selection on product review form
    setupRatingSelection();

    // Set up product sorting on products page
    setupProductSorting();

    // Set up checkout form validation
    setupCheckoutForm();
});

// Initialize the shopping cart
function initCart() {
    // If cart doesn't exist in localStorage, create an empty one
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Update the cart count in the navbar
    updateCartCount();
}

// Update the cart item count in the navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Update all cart count elements
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
    });
}

// Set up event listeners for all "Add to Cart" buttons
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');

            // Get quantity if on product details page, otherwise default to 1
            let quantity = 1;
            const quantityInput = document.getElementById('product-qty');
            if (quantityInput) {
                quantity = parseInt(quantityInput.value);
            }

            addToCart(productId, quantity);
        });
    });

    // Main "Add to Cart" button on product details page
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const quantity = parseInt(document.getElementById('product-qty').value);

            addToCart(productId, quantity);
        });
    }
}

// Add a product to the cart
function addToCart(productId, quantity) {
    // Get the current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product is already in the cart
    const existingItemIndex = cart.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
        // Product already exists, update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Product doesn't exist, add it
        // In a real app, you would fetch product details from the server
        // For now, we'll just store the ID and quantity
        cart.push({
            productId,
            quantity
        });
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update the cart count
    updateCartCount();

    // Show a success message
    showToast('Ürün sepete eklendi!');
}

// Set up quantity control buttons on product details page
function setupQuantityControls() {
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('product-qty');

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        increaseBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value);
            let max = parseInt(quantityInput.getAttribute('max'));

            if (!max || value < max) {
                quantityInput.value = value + 1;
            }
        });
    }
}

// Set up product image gallery on product details page
function setupProductGallery() {
    const thumbnails = document.querySelectorAll('.small-images img');
    const mainImage = document.querySelector('.card-img-top');

    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function () {
                // Update main image
                mainImage.src = this.src;

                // Update active thumbnail
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// Set up rating selection in product review form
function setupRatingSelection() {
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingInput = document.getElementById('review-rating');

    if (ratingStars.length && ratingInput) {
        ratingStars.forEach(star => {
            star.addEventListener('mouseover', function () {
                const rating = parseInt(this.getAttribute('data-rating'));

                // Highlight stars up to the hovered one
                ratingStars.forEach(s => {
                    const starRating = parseInt(s.getAttribute('data-rating'));
                    if (starRating <= rating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'text-warning');
                    } else {
                        s.classList.remove('fas', 'text-warning');
                        s.classList.add('far');
                    }
                });
            });

            star.addEventListener('click', function () {
                const rating = parseInt(this.getAttribute('data-rating'));
                ratingInput.value = rating;
            });
        });

        // Reset stars when mouse leaves the rating area
        const ratingSelect = document.querySelector('.rating-select');
        if (ratingSelect) {
            ratingSelect.addEventListener('mouseleave', function () {
                const currentRating = parseInt(ratingInput.value) || 0;

                ratingStars.forEach(s => {
                    const starRating = parseInt(s.getAttribute('data-rating'));
                    if (starRating <= currentRating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'text-warning');
                    } else {
                        s.classList.remove('fas', 'text-warning');
                        s.classList.add('far');
                    }
                });
            });
        }
    }
}

// Set up product sorting on products page
function setupProductSorting() {
    const sortOptions = document.getElementById('sortOptions');
    const productsContainer = document.getElementById('products-container');

    if (sortOptions && productsContainer) {
        sortOptions.addEventListener('change', function () {
            const sortValue = this.value;
            const products = Array.from(document.querySelectorAll('.product-item'));

            // Sort products based on selected option
            const sortedProducts = sortProducts(products, sortValue);

            // Clear products container
            productsContainer.innerHTML = '';

            // Add sorted products back to the container
            sortedProducts.forEach(product => {
                productsContainer.appendChild(product);
            });
        });
    }
}

// Sort products based on selected criteria
function sortProducts(products, criteria) {
    return products.sort((a, b) => {
        const aPrice = parseFloat(a.getAttribute('data-price'));
        const bPrice = parseFloat(b.getAttribute('data-price'));
        const aName = a.getAttribute('data-name');
        const bName = b.getAttribute('data-name');
        const aRating = parseFloat(a.getAttribute('data-rating'));
        const bRating = parseFloat(b.getAttribute('data-rating'));
        const aDate = new Date(a.getAttribute('data-date'));
        const bDate = new Date(b.getAttribute('data-date'));

        switch (criteria) {
            case 'price-asc':
                return aPrice - bPrice;
            case 'price-desc':
                return bPrice - aPrice;
            case 'name-asc':
                return aName.localeCompare(bName);
            case 'name-desc':
                return bName.localeCompare(aName);
            case 'rating-desc':
                return bRating - aRating;
            case 'newest':
                return bDate - aDate;
            default:
                return 0;
        }
    });
}

// Set up checkout form validation
function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function (event) {
            const isValid = validateCheckoutForm();

            if (!isValid) {
                event.preventDefault();
            }
        });
    }
}

// Validate checkout form fields
function validateCheckoutForm() {
    // Add your validation logic here
    return true;
}

// Show a toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;

    // Add to document
    document.body.appendChild(toast);

    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}
