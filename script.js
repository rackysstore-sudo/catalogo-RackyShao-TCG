
document.addEventListener('DOMContentLoaded', function() {
    // Cart state
    let cart = [];
    
    // Filter elements
    const searchInput = document.getElementById('header-search-input');
    const cardsSearchInput = document.getElementById('cards-search-input');
    const languageFilter = document.getElementById('language-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const priceRangeDisplay = document.getElementById('price-range-display');
    const viewBtns = document.querySelectorAll('.view-btn');
    const resultsCount = document.getElementById('results-count');
    const cards = document.querySelectorAll('#singles-catalog .card');
    const accessories = document.querySelectorAll('.accessory-card');
    
    // Checkbox filters
    const recommendedFilter = document.getElementById('recommended-filter');
    const typeCheckboxes = document.querySelectorAll('.type-checkbox');
    const rarityCheckboxes = document.querySelectorAll('.rarity-checkbox');
    const setCheckboxes = document.querySelectorAll('.set-checkbox');
    const expansionSearch = document.getElementById('expansion-search');
    const allFilterCheckboxes = document.querySelectorAll('.filter-checkbox');
    
    // Cart elements
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const closeCart = document.getElementById('close-cart');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Product modal elements
    const productModal = document.getElementById('product-modal');
    const productDetailContent = document.getElementById('product-detail-content');
    const closeProduct = document.getElementById('close-product');
    
    // Filter toggle
    const toggleFilters = document.getElementById('toggle-filters');
    const filtersContent = document.querySelector('.filters-content');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Initialize
    updateCartDisplay();
    updatePriceRange();
    filterCards();
    
    // Sort functionality
    const sortSelect = document.getElementById('sort-filter');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }
    
    function sortCards() {
        const sortValue = sortSelect.value;
        const catalog = document.getElementById('singles-catalog');
        const cardsArray = Array.from(cards);
        
        cardsArray.sort((a, b) => {
            switch(sortValue) {
                case 'price-low':
                    return parseInt(a.dataset.price) - parseInt(b.dataset.price);
                case 'price-high':
                    return parseInt(b.dataset.price) - parseInt(a.dataset.price);
                case 'name-az':
                    return a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent);
                case 'name-za':
                    return b.querySelector('h3').textContent.localeCompare(a.querySelector('h3').textContent);
                case 'rarity':
                    const rarityOrder = {'ultra-rara': 3, 'rara': 2, 'comun': 1};
                    return (rarityOrder[b.dataset.rarity] || 0) - (rarityOrder[a.dataset.rarity] || 0);
                default:
                    return 0;
            }
        });
        
        // Re-append sorted cards
        cardsArray.forEach(card => catalog.appendChild(card));
    }

    // Price range update
    function updatePriceRange() {
        const minPrice = minPriceInput ? minPriceInput.value || 0 : 0;
        const maxPrice = maxPriceInput ? maxPriceInput.value || '' : '';
        const maxText = maxPrice === '' ? 'Sin límite' : maxPrice;
        if (priceRangeDisplay) {
            priceRangeDisplay.textContent = `S/ ${minPrice} - ${maxText === 'Sin límite' ? maxText : 'S/ ' + maxText}`;
        }
        filterCards();
    }

    // Event listeners for filters
    if (searchInput) searchInput.addEventListener('input', filterCards);
    if (cardsSearchInput) cardsSearchInput.addEventListener('input', filterCards);
    if (languageFilter) languageFilter.addEventListener('change', filterCards);
    if (minPriceInput) minPriceInput.addEventListener('input', updatePriceRange);
    if (maxPriceInput) maxPriceInput.addEventListener('input', updatePriceRange);
    
    // Checkbox event listeners
    allFilterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterCards);
    });
    
    if (expansionSearch) {
        expansionSearch.addEventListener('input', filterExpansions);
    }
    
    // View buttons
    viewBtns.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });

    // Filter toggle
    if (toggleFilters) {
        toggleFilters.addEventListener('click', function() {
            filtersContent.classList.toggle('active');
        });
    }

    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Card filtering function
    function filterCards() {
        const headerSearchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const cardsSearchTerm = cardsSearchInput ? cardsSearchInput.value.toLowerCase() : '';
        const searchTerm = cardsSearchTerm || headerSearchTerm;
        const selectedLanguage = languageFilter ? languageFilter.value.toLowerCase() : '';
        const minPrice = minPriceInput ? parseInt(minPriceInput.value) || 0 : 0;
        const maxPrice = maxPriceInput ? parseInt(maxPriceInput.value) || Infinity : Infinity;

        // Get selected checkboxes
        const isRecommendedOnly = recommendedFilter ? recommendedFilter.checked : false;
        const selectedTypes = Array.from(typeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedRarities = Array.from(rarityCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedSets = Array.from(setCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        let visibleCount = 0;
        const totalCards = cards.length;

        cards.forEach(card => {
            const cardName = card.querySelector('h3').textContent.toLowerCase();
            const cardSet = card.dataset.set ? card.dataset.set.toLowerCase() : '';
            const cardRarity = card.dataset.rarity ? card.dataset.rarity.toLowerCase() : '';
            const cardLanguage = card.dataset.language ? card.dataset.language.toLowerCase() : '';
            const cardType = card.dataset.type ? card.dataset.type.toLowerCase() : '';
            const cardPrice = parseInt(card.dataset.price) || 0;
            const isRecommended = card.dataset.recommended === 'true';

            let showCard = true;

            // Check search term
            if (searchTerm && !cardName.includes(searchTerm)) {
                showCard = false;
            }

            // Check recommended filter
            if (isRecommendedOnly && !isRecommended) {
                showCard = false;
            }

            // Check type filters
            if (selectedTypes.length > 0 && !selectedTypes.includes(cardType)) {
                showCard = false;
            }

            // Check rarity filters
            if (selectedRarities.length > 0 && !selectedRarities.includes(cardRarity)) {
                showCard = false;
            }

            // Check set filters
            if (selectedSets.length > 0 && !selectedSets.includes(cardSet)) {
                showCard = false;
            }

            // Check language filter
            if (selectedLanguage && !cardLanguage.includes(selectedLanguage)) {
                showCard = false;
            }

            // Check price range
            if (cardPrice < minPrice || cardPrice > maxPrice) {
                showCard = false;
            }

            // Show or hide card
            if (showCard) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${visibleCount} de ${totalCards} cartas`;
        }
    }
    
    function resetAllFilters() {
        if (searchInput) searchInput.value = '';
        if (cardsSearchInput) cardsSearchInput.value = '';
        if (languageFilter) languageFilter.value = '';
        if (minPriceInput) minPriceInput.value = '0';
        if (maxPriceInput) maxPriceInput.value = '100';
        if (expansionSearch) expansionSearch.value = '';
        
        // Reset all checkboxes
        allFilterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Show all expansions
        filterExpansions();
        
        updatePriceRange();
        filterCards();
    }
    
    function filterExpansions() {
        const searchTerm = expansionSearch ? expansionSearch.value.toLowerCase() : '';
        const expansionItems = document.querySelectorAll('.set-checkbox');
        
        expansionItems.forEach(checkbox => {
            const label = checkbox.parentElement;
            const expansionName = label.textContent.toLowerCase().trim();
            
            if (searchTerm === '' || expansionName.includes(searchTerm)) {
                label.style.display = 'flex';
            } else {
                label.style.display = 'none';
            }
        });
    }
    
    
    
    function handleViewChange(e) {
        const view = e.target.closest('.view-btn').dataset.view;
        
        // Remove active class from all view buttons
        viewBtns.forEach(btn => btn.classList.remove('active'));
        e.target.closest('.view-btn').classList.add('active');
        
        // Apply view change
        const catalog = document.getElementById('singles-catalog');
        if (catalog) {
            if (view === 'list') {
                catalog.classList.add('list-view');
            } else {
                catalog.classList.remove('list-view');
            }
        }
    }

    // Cart functionality
    cartBtn.addEventListener('click', function() {
        cartModal.style.display = 'block';
    });

    closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    clearCartBtn.addEventListener('click', function() {
        cart = [];
        updateCartDisplay();
    });

    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        let message = 'Hola! Me interesa comprar:\n\n';
        let total = 0;
        
        cart.forEach(item => {
            message += `• ${item.name} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
            total += item.price * item.quantity;
        });
        
        message += `\nTotal: S/ ${total.toFixed(2)}`;
        
        const whatsappUrl = `https://wa.me/51938104637?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    function addToCart(productData) {
        const existingItem = cart.find(item => item.id === productData.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productData.id,
                name: productData.name,
                price: productData.price,
                image: productData.image,
                details: productData.details,
                quantity: 1
            });
        }
        
        updateCartDisplay();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartDisplay();
    }

    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                updateCartDisplay();
            }
        }
    }

    function updateCartDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartCount.textContent = totalItems;
        cartTotal.textContent = totalPrice.toFixed(2);
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-details">${item.details}</div>
                        <div class="cart-item-price">S/ ${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Make functions global for onclick handlers
    window.updateQuantity = updateQuantity;
    window.removeFromCart = removeFromCart;

    // Product detail modal
    function showProductDetail(element) {
        const isCard = element.classList.contains('card');
        const productId = element.dataset.id;
        const name = element.querySelector('h3').textContent;
        const price = parseFloat(element.dataset.price);
        const image = element.querySelector('img').src;
        const setName = isCard ? element.querySelector('.set-name').textContent : '';
        const language = isCard ? element.querySelector('.language').textContent : '';
        const condition = isCard ? element.querySelector('.condition').textContent : 'Nuevo';
        const stock = element.querySelector('.stock').textContent;
        const rarity = isCard ? element.querySelector('.rarity-badge').textContent : '';
        
        const details = isCard ? `${setName} - ${language}` : element.querySelector('.accessory-type').textContent;

        productDetailContent.innerHTML = `
            <div class="product-detail-content">
                <div class="product-image-large">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="product-info">
                    <h2 class="product-title">${name}</h2>
                    <div class="product-price">S/ ${price.toFixed(2)}</div>
                    
                    <div class="product-details-list">
                        <h4>Detalles del Producto</h4>
                        ${isCard ? `
                            <p><strong>Set:</strong> ${setName}</p>
                            <p><strong>Idioma:</strong> ${language}</p>
                            <p><strong>Rareza:</strong> ${rarity}</p>
                            <p><strong>Condición:</strong> ${condition}</p>
                        ` : `
                            <p><strong>Tipo:</strong> ${details}</p>
                            <p><strong>Condición:</strong> ${condition}</p>
                        `}
                        <p><strong>Stock:</strong> ${stock}</p>
                    </div>

                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="addToCartFromModal('${productId}', '${name}', ${price}, '${image}', '${details}')">
                            🛒 Agregar al Carrito
                        </button>
                        
                        <a href="https://wa.me/51938104637?text=Hola! Me interesa el producto: ${encodeURIComponent(name)} - S/ ${price.toFixed(2)}" 
                           target="_blank" class="whatsapp-contact">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        productModal.style.display = 'block';
    }

    window.addToCartFromModal = function(productId, name, price, image, details) {
        addToCart({
            id: productId,
            name: name,
            price: price,
            image: image,
            details: details
        });
        productModal.style.display = 'none';
    };

    // Close modals
    closeProduct.addEventListener('click', function() {
        productModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    // Add click handlers to all cards and accessories
    cards.forEach(card => {
        card.addEventListener('click', function() {
            showProductDetail(this);
        });
    });

    accessories.forEach(accessory => {
        accessory.addEventListener('click', function() {
            showProductDetail(this);
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add entrance animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    [...cards, ...accessories].forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Search on Enter key
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterCards();
            }
        });
    }

    if (cardsSearchInput) {
        cardsSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterCards();
            }
        });
    }
});
