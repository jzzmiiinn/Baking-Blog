// ============================================================================
// NAVIGATION MENU TOGGLE FUNCTIONALITY
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Get navigation elements
    const menuToggle = document.getElementById('menu-toggle');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Toggle menu when hamburger is clicked
    hamburger.addEventListener('click', function() {
        const isOpen = menuToggle.checked;
        menuToggle.checked = !isOpen;
        
        // Show/hide navigation links based on toggle state
        if (!isOpen) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });
    
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.checked = false;
                navLinks.style.display = 'none'; 
            }
        });
    });
    
    // Handle window resize to maintain proper menu display
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navLinks.style.display = 'flex';
        } else if (!menuToggle.checked) {
            navLinks.style.display = 'none';
        }
    });
});

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Get search form elements
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    // Set up search form event listeners
    if (searchForm) {
        // Handle form submission
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch(searchInput.value.trim());
        });
        
        // Handle real-time search as user types
        searchInput.addEventListener('input', function() {
            performSearch(this.value.trim());
        });
    }
    
    // Check URL for existing search query and perform search if present
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        searchInput.value = searchQuery;
        performSearch(searchQuery);
    }
    
    /**
     * Perform search across all recipe cards
     * @param {string} searchTerm - The term to search for
     */
    function performSearch(searchTerm) {
        const cards = document.querySelectorAll('.cards');
        let hasResults = false;
        const searchTermLower = searchTerm.toLowerCase();
        
        // Loop through all cards and check for matches
        cards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const cardTitle = card.querySelector('h2')?.textContent.toLowerCase() || '';
            const cardSubtitle = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const cardText = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            // Check if card matches search term in any field
            if (searchTerm === '' || 
                title.includes(searchTermLower) || 
                cardTitle.includes(searchTermLower) ||
                cardSubtitle.includes(searchTermLower) ||
                cardText.includes(searchTermLower)) {
                card.style.display = 'block';
                hasResults = true;
                highlightText(card, searchTermLower);
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show appropriate message based on search results
        showNoResultsMessage(hasResults, searchTerm);
        updateURL(searchTerm);
    }
    
    /**
     * Highlight search term in card text
     * @param {Element} element - The card element to highlight text in
     * @param {string} searchTerm - The term to highlight
     */
    function highlightText(element, searchTerm) {
        if (!searchTerm) return;
        
        const elementsToHighlight = element.querySelectorAll('h2, h3, p');
        
        // Apply highlighting to all text elements
        elementsToHighlight.forEach(el => {
            const text = el.textContent;
            const regex = new RegExp(searchTerm, 'gi');
            el.innerHTML = text.replace(regex, match => 
                `<span class="search-highlight">${match}</span>`
            );
        });
    }
    
    /**
     * Show no results message when search returns empty
     * @param {boolean} hasResults - Whether search returned results
     * @param {string} searchTerm - The search term that was used
     */
    function showNoResultsMessage(hasResults, searchTerm) {
        const container = document.querySelector('.container');
        let message = document.getElementById('no-results-message');
        
        if (!hasResults && searchTerm) {
            if (!message) {
                // Create and display no results message
                message = document.createElement('div');
                message.id = 'no-results-message';
                message.className = 'no-results';
                message.innerHTML = `
                    <p>No recipes found for "<strong>${searchTerm}</strong>"</p>
                    <button id="clear-search">Show All Recipes</button>
                `;
                container.appendChild(message);
                
                // Add event listener to clear search button
                document.getElementById('clear-search').addEventListener('click', function() {
                    searchInput.value = '';
                    performSearch('');
                    message.remove();
                });
            }
        } else if (message) {
            message.remove();
        }
    }
    
    /**
     * Update URL with search parameters for shareable links
     * @param {string} searchTerm - The search term to add to URL
     */
    function updateURL(searchTerm) {
        const url = new URL(window.location);
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }
        window.history.pushState({}, '', url);
    }
});

/**
 * Initialize basic search functionality
 */
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Simple search by title only
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const allCards = document.querySelectorAll('.cards');
        
        allCards.forEach(card => {
            const title = card.querySelector('h2').textContent.toLowerCase();
            card.style.display = title.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initSearch);

// ============================================================================
// COMMENTS SYSTEM FUNCTIONALITY
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    /**
     * Initialize comments with hardcoded data if none exists
     */
    const initializeComments = () => {
        const existing = JSON.parse(localStorage.getItem('comments') || '[]');
        if (existing.length === 0) {
            // Create initial sample comments
            const hardcodedComments = [
                { id: 1, username: "🎂 Sara M.", text: "I tried the vanilla cupcake recipe and it was a hit at my niece's birthday!" },
                { id: 2, username: "🍪 Daniel K.", text: "Love your step-by-step guides. Makes baking less scary for beginners like me." },
                { id: 3, username: "🧁 Amina R.", text: "Just rated 5 stars! Your blog layout is cozy and beautiful." }
            ];
            localStorage.setItem('comments', JSON.stringify(hardcodedComments));
        }
    };

    /**
     * Load and display all comments from localStorage
     */
    const loadComments = () => {
        const comments = JSON.parse(localStorage.getItem('comments')) || [];
        const commentList = document.getElementById('comment-list');
        commentList.innerHTML = ''; 
        
        // Create and append comment elements
        comments.forEach(comment => {
            commentList.appendChild(createCommentElement(comment));
        });
    };

    /**
     * Create DOM element for a comment
     * @param {Object} comment - The comment object
     * @returns {Element} The created comment element
     */
    const createCommentElement = (comment) => {
        const div = document.createElement('div');
        div.className = 'comment';
        div.dataset.id = comment.id;
        div.innerHTML = `
            <div class="comment-header">
                <p class="user">${comment.username}</p>
                <div class="comment-actions">
                    <i class="fas fa-edit edit-comment"></i>
                    <i class="fas fa-trash-alt delete-comment"></i>
                </div>
            </div>
            <p class="text">${comment.text}</p>
        `;
        
        // Add event listeners for edit and delete actions
        div.querySelector('.edit-comment').addEventListener('click', () => openEditModal(comment.id));
        div.querySelector('.delete-comment').addEventListener('click', () => openDeleteModal(comment.id));
        
        return div;
    };

    // Utility functions for comment management
    const getComments = () => JSON.parse(localStorage.getItem('comments')) || [];
    const saveComments = (comments) => localStorage.setItem('comments', JSON.stringify(comments));

    /**
     * Add a new comment
     * @param {string} username - The comment author's username
     * @param {string} text - The comment text
     * @returns {Object} The newly created comment object
     */
    const addComment = (username, text) => {
        const comments = getComments();
        const newComment = { id: Date.now(), username, text };
        comments.unshift(newComment);
        saveComments(comments);
        return newComment;
    };

    /**
     * Update an existing comment
     * @param {number} id - The ID of the comment to update
     * @param {string} username - The updated username
     * @param {string} text - The updated comment text
     * @returns {boolean} Success status of the update operation
     */
    const updateComment = (id, username, text) => {
        const comments = getComments();
        const index = comments.findIndex(c => c.id == id);
        if (index !== -1) {
            comments[index] = { id, username, text };
            saveComments(comments);
            return true;
        }
        return false;
    };

    /**
     * Delete a comment
     * @param {number} id - The ID of the comment to delete
     */
    const deleteComment = (id) => {
        saveComments(getComments().filter(c => c.id != id));
    };

    // Track currently selected comment for modal operations
    let currentCommentId = null;
    
    /**
     * Open edit modal for a specific comment
     * @param {number} id - The ID of the comment to edit
     */
    const openEditModal = (id) => {
        const comment = getComments().find(c => c.id == id);
        if (comment) {
            currentCommentId = id;
            document.getElementById('edit-comment-id').value = id;
            document.getElementById('edit-username').value = comment.username;
            document.getElementById('edit-comment-text').value = comment.text;
            document.getElementById('edit-comment-modal').style.display = 'block';
        }
    };

    /**
     * Open delete confirmation modal
     * @param {number} id - The ID of the comment to delete
     */
    const openDeleteModal = (id) => {
        currentCommentId = id;
        document.getElementById('delete-comment-modal').style.display = 'block';
    };

    // Initialize comments system
    initializeComments();
    loadComments();

    // Add new comment form submission handler
    document.getElementById('comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = this.username.value.trim();
        const text = this.commentText.value.trim();
        
        if (username && text) {
            addComment(username, text);
            loadComments();
            this.reset();
        }
    });

    // Edit comment form submission handler
    document.getElementById('edit-comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = this['edit-username'].value.trim();
        const text = this['edit-comment-text'].value.trim();
        
        if (updateComment(currentCommentId, username, text)) {
            loadComments();
            document.getElementById('edit-comment-modal').style.display = 'none';
        }
    });

    // Delete confirmation handler
    document.getElementById('confirm-delete').addEventListener('click', function() {
        deleteComment(currentCommentId);
        loadComments();
        document.getElementById('delete-comment-modal').style.display = 'none';
    });

    // Delete cancellation handler
    document.getElementById('cancel-delete').addEventListener('click', function() {
        document.getElementById('delete-comment-modal').style.display = 'none';
    });

    // Modal close handlers
    document.querySelectorAll('.close-modal').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

// ============================================================================
// FAVORITES MANAGEMENT SYSTEM
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Load favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    /**
     * Save favorites to localStorage
     */
    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    /**
     * Toggle favorite status for a recipe card
     * @param {Element} cardElement - The card element to toggle favorite status for
     */
    function toggleFavorite(cardElement) {
        const title = cardElement.querySelector('h2').textContent;
        const subtitle = cardElement.querySelector('h3').textContent;
        const description = cardElement.querySelector('p').textContent;
        const image = cardElement.querySelector('img').src;
        
        const existingIndex = favorites.findIndex(fav => fav.title === title);
        
        // Add or remove from favorites
        if (existingIndex === -1) {
            favorites.push({
                title,
                subtitle,
                description,
                image
            });
        } else {
            favorites.splice(existingIndex, 1);
        }
        
        saveFavorites();
        updateFavoriteButtons();
    }

    /**
     * Update all favorite buttons to reflect current favorite status
     */
    function updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const card = btn.closest('.cards');
            const title = card.querySelector('h2').textContent;
            const isFavorite = favorites.some(fav => fav.title === title);
            
            if (isFavorite) {
                btn.classList.add('favorited');
            } else {
                btn.classList.remove('favorited');
            }
        });
    }

    // Handle favorite button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const card = btn.closest('.cards');
            toggleFavorite(card);
        }
    });

    // Display favorites on favorites page
    if (document.getElementById('favorites-container')) {
        displayFavorites();
    }

    /**
     * Display all favorite posts in the favorites container
     */
    function displayFavorites() {
        const container = document.getElementById('favorites-container');
        if (!container) return;
        
        container.innerHTML = '';

        // Show message if no favorites
        if (favorites.length === 0) {
            container.innerHTML = '<p class="no-favorites">No favorite posts yet. Start adding some!</p>';
            return;
        }

        // Create and display favorite cards
        favorites.forEach(post => {
            const card = document.createElement('div');
            card.className = 'favorite-card';
            card.innerHTML = `
                <img src="${post.image}" alt="${post.title}" />
                <h2>${post.title}</h2>
                <h3>${post.subtitle}</h3>
                <p>${post.description}</p>
                <div class="post-controls">
                    <button class="favorite-btn favorited" aria-label="Remove from favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);

            // Add remove from favorites functionality
            card.querySelector('.favorite-btn').addEventListener('click', function() {
                favorites = favorites.filter(fav => fav.title !== post.title);
                saveFavorites();
                displayFavorites(); // Refresh display
            });
        });
    }

    // Initialize favorite buttons
    updateFavoriteButtons();
});

// Alternative favorites implementation for different page structure
document.addEventListener('DOMContentLoaded', function() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    function toggleFavorite(index) {
        const post = posts[index];
        const existingIndex = favorites.findIndex(fav => fav.title === post.title);
        
        if (existingIndex === -1) {
            favorites.push(post);
            post.isFavorite = true;
        } else {
            favorites.splice(existingIndex, 1);
            post.isFavorite = false;
        }
        
        savePosts(); 
        saveFavorites(); 
        renderPosts(); 
    }

    container.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            e.stopPropagation();
            const card = e.target.closest('.cards');
            const index = parseInt(card.dataset.index);
            toggleFavorite(index);
        }
    });

    // Display favorites on favorites page
    if (document.getElementById('favorites-container')) {
        displayFavorites();
    }

    function displayFavorites() {
        const container = document.getElementById('favorites-container');
        if (!container) return;
        
        container.innerHTML = '';

        const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (storedFavorites.length === 0) {
            container.innerHTML = '<p class="no-favorites">No favorite posts yet. Start adding some!</p>';
            return;
        }

        // Display each favorite post
        storedFavorites.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card'; 
            card.innerHTML = `
                <img src="${post.image}" alt="${post.title}" />
                <h2>${post.title}</h2>
                <h3>${post.subtitle}</h3>
                <p>${post.description}</p>
                <div class="post-controls">
                    <button class="favorite-btn favorited" aria-label="Remove from favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);

            // Add remove functionality
            card.querySelector('.favorite-btn').addEventListener('click', function() {
                const updatedFavorites = storedFavorites.filter(fav => fav.title !== post.title);
                localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                
                const postIndex = posts.findIndex(p => p.title === post.title);
                if (postIndex !== -1) {
                    posts[postIndex].isFavorite = false;
                    savePosts();
                }
                
                displayFavorites();
            });
        });
    }
});

// ============================================================================
// NEW POST CREATION FUNCTIONALITY
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const title = document.getElementById('title').value;
            const subTitle = document.getElementById('sub-title').value;
            const description = document.getElementById('description').value;
            
            const imageInput = document.getElementById('image');
            const imageFile = imageInput.files[0];
            
            // Process image and create new post
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageData = e.target.result;
                    
                    // Create new post object
                    const newPost = {
                        title: title,
                        subtitle: subTitle,
                        description: description,
                        image: imageData,
                        isFavorite: false,
                        timestamp: new Date().toISOString()
                    };
                    
                    saveNewPost(newPost);
                    
                    // Redirect to posts page
                    window.location.href = 'posts.html';
                };
                reader.readAsDataURL(imageFile);
            }
        });
    }
});

/**
 * Save a new post to localStorage
 * @param {Object} post - The post object to save
 */
function saveNewPost(post) {    
    const savedPosts = localStorage.getItem('bakingPosts');
    let posts = [];
    
    // Load existing posts or use default data
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [...postsData];
    }
    
    posts.unshift(post); // Add new post to beginning
    
    localStorage.setItem('bakingPosts', JSON.stringify(posts));
}

// ============================================================================
// LAYOUT AND DISPLAY MANAGEMENT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Move "View All" to categories section
    const viewAll = document.querySelector('.view-all-container');
    const categories = document.querySelector('.categories');

    if (viewAll && categories) {
        categories.appendChild(viewAll); 
        viewAll.style.display = 'block';
    }

    // Limit displayed featured posts to 3
    const container = document.querySelector('.featured-container');
    if (container) {
        const cards = container.querySelectorAll('.cards');
        const maxToShow = 3;
        cards.forEach((card, index) => {
            if (index >= maxToShow) {
                card.style.display = 'none';
            }
        });
    }
});

// ============================================================================
// POSTS DATA AND MANAGEMENT SYSTEM
// ============================================================================

// Default posts data
const postsData = [
    {
        title: "Cakes & Cupcakes",
        subtitle: "Layer cakes, birthday treats, cheesecakes",
        description: "This section is packed with stunning cakes and cupcakes for every celebration - think moist layers, creamy frostings, rich cheesecakes, and cute cupcakes perfect for parties or just because.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1089&q=80",
        isFavorite: false
    },
    {
        title: "Cookies",
        subtitle: "Soft, chewy, crispy, festive, and everything in between",
        description: "From classic chocolate chip to holiday cut-outs, this category includes all kinds of cookies - simple, indulgent, or decorative. Great for gifting, snacking, or dunking in milk.",
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1065&q=80",
        isFavorite: false
    },
    {
        title: "Breads and Rolls",
        subtitle: "From sourdough to sweet rolls",
        description: "Find step-by-step recipes for artisan-style breads, fluffy dinner rolls, and sweet breakfast buns. Perfect for bakers who love the smell of warm bread and the magic of dough rising.",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
        isFavorite: false
    },
    {
        title: "Pastries & Pies",
        subtitle: "Flaky crusts, fruity fillings, buttery bliss",
        description: "Explore sweet and savory pastries, buttery croissants, rustic galettes, and fruit-filled pies. Ideal for weekend baking or when you want something elegant and flaky.",
        image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
        isFavorite: false
    },
    {
        title: "Quick Bakes",
        subtitle: "Ready in under 30 minutes!",
        description: "Short on time? This section has simple, no-fuss recipes you can whip up fast—think one-bowl muffins, no-bake bars, and easy cookies that save the day.",
        image: "https://images.unsplash.com/photo-1608190003443-86ab6a0f1ac4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        isFavorite: false
    },
    {
        title: "Holiday Favorites",
        subtitle: "Christmas, Eid, Easter, and more",
        description: "Celebrate every season with festive bakes! From Christmas cookies to Eid sweets and Easter breads, you'll find themed treats that bring joy to every holiday table.",
        image: "https://images.unsplash.com/photo-1606914469631-bb0c2a296c6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
        isFavorite: false
    }
];

// Global variables for post management
const container = document.querySelector('.container');
const postModal = document.getElementById('postModal');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalDescription = document.getElementById('modalDescription');
const editTitle = document.getElementById('editTitle');
const editSubtitle = document.getElementById('editSubtitle');
const editDescription = document.getElementById('editDescription');
const editImage = document.getElementById('editImage');

let currentPostIndex = null;
let posts = [];

/**
 * Initialize the posts management system
 */
function init() {
    loadPosts();
    renderPosts();
    setupEventListeners();
}

/**
 * Load posts from localStorage or use default data
 */
function loadPosts() {
    const savedPosts = localStorage.getItem('bakingPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [...postsData];
        savePosts();
    }
}

/**
 * Save posts to localStorage
 */
function savePosts() {
    localStorage.setItem('bakingPosts', JSON.stringify(posts));
}

/**
 * Render all posts to the container
 */
function renderPosts() {
    if (!container) return; 
    
    container.innerHTML = '';
    posts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'cards';
        card.dataset.index = index;
        
        card.innerHTML = `
            <img src="${post.image}" alt="${post.title}">
            <h2>${post.title}</h2>
            <h3>${post.subtitle}</h3>
            <div class="post-controls">
                <button class="edit-btn" aria-label="Edit post"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" aria-label="Delete post"><i class="fas fa-trash-alt"></i></button>
                <button class="favorite-btn ${post.isFavorite ? 'favorited' : ''}" aria-label="Add to favorites">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Set up all event listeners for post interactions
 */
function setupEventListeners() {
    // Handle card clicks (open post modal)
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.cards');
        if (!card) return;
        
        if (e.target.closest('.post-controls')) {
            return;
        }
        
        currentPostIndex = parseInt(card.dataset.index);
        openPostModal(currentPostIndex);
    });

    // Handle favorite button clicks
    container.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            e.stopPropagation();
            const card = e.target.closest('.cards');
            const index = parseInt(card.dataset.index);
            toggleFavorite(index);
        }
    });

    // Handle edit button clicks
    container.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            e.stopPropagation();
            const card = e.target.closest('.cards');
            currentPostIndex = parseInt(card.dataset.index);
            openEditModal(currentPostIndex);
        }
    });

    // Handle delete button clicks
    container.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            e.stopPropagation();
            const card = e.target.closest('.cards');
            currentPostIndex = parseInt(card.dataset.index);
            openDeleteModal(currentPostIndex);
        }
    });

    // Modal close buttons
    document.querySelectorAll('.recipe-close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            postModal.style.display = 'none';
            editModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === postModal) postModal.style.display = 'none';
        if (e.target === editModal) editModal.style.display = 'none';
        if (e.target === deleteModal) deleteModal.style.display = 'none';
    });

    // Edit modal buttons
    editModal.querySelector('.recipe-cancel-btn').addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    editModal.querySelector('.recipe-save-btn').addEventListener('click', () => {
        saveEditedPost();
    });

    // Delete modal buttons
    deleteModal.querySelector('.recipe-cancel-btn').addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    deleteModal.querySelector('.recipe-delete-confirm-btn').addEventListener('click', () => {
        deletePost(currentPostIndex);
    });
}

/**
 * Open post detail modal
 * @param {number} index - Index of the post to display
 */
function openPostModal(index) {
    const post = posts[index];
    modalImage.src = post.image;
    modalImage.alt = post.title;
    modalTitle.textContent = post.title;
    modalSubtitle.textContent = post.subtitle;
    modalDescription.textContent = post.description;
    postModal.style.display = 'flex';
}

/**
 * Open edit modal for a post
 * @param {number} index - Index of the post to edit
 */
function openEditModal(index) {
    const post = posts[index];
    editTitle.value = post.title;
    editSubtitle.value = post.subtitle;
    editDescription.value = post.description;
    editImage.value = post.image;
    editModal.style.display = 'flex';
}

/**
 * Open delete confirmation modal
 * @param {number} index - Index of the post to delete
 */
function openDeleteModal(index) {
    deleteModal.style.display = 'flex';
}

/**
 * Toggle favorite status for a post
 * @param {number} index - Index of the post to toggle
 */
function toggleFavorite(index) {
    posts[index].isFavorite = !posts[index].isFavorite;
    savePosts();
    renderPosts();
}

/**
 * Save edited post data
 */
function saveEditedPost() {
    if (currentPostIndex === null) return;
    
    posts[currentPostIndex] = {
        ...posts[currentPostIndex], 
        title: editTitle.value,
        subtitle: editSubtitle.value,
        description: editDescription.value,
        image: editImage.value
    };
    
    savePosts();
    renderPosts();
    editModal.style.display = 'none';
}

/**
 * Delete a post
 * @param {number} index - Index of the post to delete
 */
function deletePost(index) {
    posts.splice(index, 1);
    savePosts();
    renderPosts();
    deleteModal.style.display = 'none';
}

// Initialize the posts system
init();