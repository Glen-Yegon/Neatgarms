

const cards = document.querySelectorAll('.card');

// Select modal and elements
const modal = document.getElementById('itemModal');
const modalSlide = document.querySelector('.modal-slide');
const backButton = document.getElementById('backButton');
const customizeButton = document.getElementById('customizeButton');
let currentSlideIndex = 0;
let currentSlides = [];

// Function to open modal and start slideshow
function openModal(itemSlides) {
  currentSlides = itemSlides;
  currentSlideIndex = 0;
  modal.style.display = 'flex'; // Show modal
  updateModalSlide(); // Set first slide
}


// Function to update modal slide
function updateModalSlide() {
  modalSlide.src = currentSlides[currentSlideIndex].src;
}

// Add event listeners to items
document.querySelectorAll('.item').forEach((item) => {

  const slides = item.querySelectorAll('.slideshow .slide');

  item.addEventListener('click', () => {
    const itemName = item.querySelector("#name").textContent; // Get text content
const itemPrice = item.querySelector("#price").textContent; // Get text content
    const slideImages = Array.from(slides);
    openModal(slideImages); // Open modal with item slides

    
        // Save item details to local storage using specific IDs
        localStorage.setItem('nameID', itemName);
        localStorage.setItem('priceID', itemPrice);
  });
});

// Close modal
backButton.addEventListener('click', () => {
  modal.style.display = 'none'; // Hide modal
});


// Navigate to customization page with selected images
customizeButton.addEventListener('click', () => {
  const selectedImages = currentSlides.map(slide => slide.src);
  localStorage.setItem('selectedImages', JSON.stringify(selectedImages));
  window.location.href = 'customization.html'; // Replace with your customization page URL
});

// Add slideshow navigation
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});


// Keyboard navigation for slideshow
document.addEventListener('keydown', (e) => {
  if (modal.style.display === 'flex') {
    if (e.key === 'ArrowRight') {
      currentSlideIndex = (currentSlideIndex + 1) % currentSlides.length;
      updateModalSlide();
    } else if (e.key === 'ArrowLeft') {
      currentSlideIndex =
        (currentSlideIndex - 1 + currentSlides.length) % currentSlides.length;
      updateModalSlide();
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


document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("ui-input");
  const items = document.querySelectorAll(".item");

  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();

    items.forEach((item) => {
      const itemName = item.querySelector("#name").textContent.toLowerCase();
      const itemPrice = item.querySelector("#price").textContent.toLowerCase();

      // Check if the search text is found in the item name or price
      if (itemName.includes(searchText) || itemPrice.includes(searchText)) {
        item.style.display = "block"; // Show matching items
      } else {
        item.style.display = "none"; // Hide non-matching items
      }
    });
  });

  // Close search button functionality
  document.getElementById("close-search").addEventListener("click", () => {
    searchInput.value = ""; // Clear input
    items.forEach((item) => (item.style.display = "block")); // Show all items again
  });
});



