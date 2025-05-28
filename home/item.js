

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


