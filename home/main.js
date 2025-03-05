// Wait for the page to fully load
window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  const mainContent = document.getElementById("main-content");

  // Set timeout to hide the preloader and display main content
  setTimeout(() => {
    preloader.style.opacity = "0"; // Fade out effect
    setTimeout(() => {
      preloader.style.display = "none"; // Remove preloader from view
      mainContent.style.display = "block"; // Show main content
    }, 500); // Wait for fade-out to complete
  }, 3000); // 4 seconds delay
});



// Filter and sort
const filterBtn = document.getElementById('filter-btn');
const filterMenu = document.getElementById('filter-menu');
const closeMenu = document.getElementById('close-menu');
const menuOverlay = document.getElementById('menu-overlay');
const filterOptions = document.querySelectorAll('.filter-option');
const productCards = document.querySelectorAll('.product-card');

// Open Filter Menu
filterBtn.addEventListener('click', () => {
  filterMenu.classList.add('open');
  menuOverlay.classList.remove('hidden');
});

// Close Filter Menu
function closeFilterMenu() {
  filterMenu.classList.remove('open');
  menuOverlay.classList.add('hidden');
}
closeMenu.addEventListener('click', closeFilterMenu);
menuOverlay.addEventListener('click', closeFilterMenu);

// Filter Products
filterOptions.forEach((option) => {
  option.addEventListener('click', (e) => {
    const filter = e.target.getAttribute('data-filter'); // Get filter value

    productCards.forEach((card) => {
      const statusElement = card.querySelector('.status'); // Get the status span
      const status = statusElement ? statusElement.textContent.trim() : ''; // Extract the status text
      
      if (filter === "all" || status.toLowerCase() === filter.toLowerCase()) {
        card.classList.remove('hidden'); // Show matching cards
      } else {
        card.classList.add('hidden'); // Hide non-matching cards
      }
    });

    closeFilterMenu(); // Close the menu after filtering
  });
});

// Get the menu button, menu, and close button
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const closeBtn = document.getElementById('close-btn');

// Toggle the menu visibility when the menu button is clicked
menuBtn.addEventListener('click', () => {
  menu.style.display = 'block'; // Show the menu
});

// Close the menu when the close button is clicked
closeBtn.addEventListener('click', () => {
  menu.style.display = 'none'; // Hide the menu
});


// Close the menu if the user clicks anywhere outside of it
document.addEventListener('click', (event) => {
  if (!menu.contains(event.target) && event.target !== menuBtn) {
    menu.style.display = 'none'; // Hide the menu if click is outside
  }
});


//product cards
document.querySelectorAll('.product-card').forEach((card) => {
  const images = card.querySelectorAll('.image-wrapper img');
  images.forEach((img, index) => {
    img.style.display = index === 0 ? 'block' : 'none'; // Only the first image is displayed by default
  });
});

document.querySelectorAll('.product-card').forEach((card) => {
  card.addEventListener('click', () => {
    // Gather information about the clicked product
    const images = Array.from(card.querySelectorAll('.image-wrapper img')).map(img => img.src);
    const status = card.querySelector('.status') ? card.querySelector('.status').innerText : null;
    const name = card.querySelector('.product-name').innerText;
    const oldPrice = card.querySelector('.old-price') ? card.querySelector('.old-price').innerText : null;
    const newPrice = card.querySelector('.new-price') ? card.querySelector('.new-price').innerText : null;
        // Gather size button data (hidden buttons)
        const sizes = Array.from(card.querySelectorAll('.size-buttons .size-btn')).map(button => button.dataset.size);

            // Gather color button data (hidden buttons)
            const colors = Array.from(card.querySelectorAll('.color-buttons .color-btn')).map(button => button.dataset.color);

 
    // Create an object to store the product data
    const productData = {
      images: images,
      status: status,
      name: name,
      oldPrice: oldPrice,
      newPrice: newPrice,
      sizes: sizes, // Include the size buttons
      colors: colors, // Include the color buttons
    };

    // Save product data to localStorage
    localStorage.setItem('selectedProduct', JSON.stringify(productData));

    // Navigate to the product page
    window.location.href = 'product.html';
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Get the URL fragment (e.g., #product-1)
  const urlHash = window.location.hash;

  if (urlHash) {
    // Remove the "#" and find the element with the matching ID
    const targetProduct = document.querySelector(urlHash);

    if (targetProduct) {
      // Highlight the product card
      targetProduct.classList.add("highlight");

      // Scroll to the product card
      targetProduct.scrollIntoView({ behavior: "smooth", block: "center" });

      // Remove highlight after 3 seconds
      setTimeout(() => {
        targetProduct.classList.remove("highlight");
      }, 3000);
    }
  }
});



// DOM Elements
const searchBtn = document.querySelector('.search-btn');
const searchContainer = document.getElementById('ui-input-container');
const searchInput = document.getElementById('ui-input');
const closeSearchBtn = document.getElementById('close-search');


// Open the search bar
searchBtn.addEventListener('click', () => {
  searchContainer.classList.remove('hidden');
  searchInput.focus(); // Focus the input field for easy typing
});

// Close the search bar
closeSearchBtn.addEventListener('click', () => {
  searchContainer.classList.add('hidden');
  searchInput.value = ''; // Clear the search field
  filterProducts(''); // Reset the filter to show all products
});

// Search functionality (filter based on product name)
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim(); // Get the search term (case-insensitive)

  filterProducts(query);
});

// Function to filter product cards by name
function filterProducts(query) {
  productCards.forEach((card) => {
    const productName = card.querySelector('.product-name').textContent.toLowerCase();

    // If the product name includes the query, show it; otherwise, hide it
    if (productName.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}





