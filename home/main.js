
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

  const highToLowBtn = document.querySelectorAll('.prev-btn')[0];
  const lowToHighBtn = document.querySelectorAll('.prev-btn')[1];
  const productContainer = document.querySelector('.product-grid') || document.querySelector('#products'); // replace with your actual container

  // Convert NodeList to Array
  const getSortedCards = (descending = false) => {
    const cardsArray = Array.from(document.querySelectorAll('.product-card'));

    return cardsArray.sort((a, b) => {
      const priceA = parseInt(a.querySelector('.new-price').textContent.trim());
      const priceB = parseInt(b.querySelector('.new-price').textContent.trim());

      return descending ? priceB - priceA : priceA - priceB;
    });
  };

  // Function to reorder DOM elements
  const reorderCards = (sortedCards) => {
    sortedCards.forEach(card => productContainer.appendChild(card));
  };

  // Event listeners for buttons
  highToLowBtn.addEventListener('click', () => {
    const sorted = getSortedCards(true); // Descending
    reorderCards(sorted);
    closeFilterMenu();
  });

  lowToHighBtn.addEventListener('click', () => {
    const sorted = getSortedCards(false); // Ascending
    reorderCards(sorted);
    closeFilterMenu();
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


window.initializeProductBehaviors = function() {

  /* ----------------------------------------
     IMAGE HOVER SWAP FOR .product-card
  ---------------------------------------- */
  document.querySelectorAll('.product-card').forEach((card) => {
    const images = card.querySelectorAll('.image-wrapper img');

    // Show only the first image by default
    images.forEach((img, index) => {
      img.style.opacity = index === 0 ? '1' : '0';
      img.style.zIndex = index === 0 ? '1' : '0';
    });

    card.addEventListener('mouseenter', () => {
      if (images.length > 1) {
        images[0].style.opacity = '0';
        images[1].style.opacity = '1';
        images[0].style.zIndex = '0';
        images[1].style.zIndex = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      if (images.length > 1) {
        images[0].style.opacity = '1';
        images[1].style.opacity = '0';
        images[0].style.zIndex = '1';
        images[1].style.zIndex = '0';
      }
    });
  });


  /* ----------------------------------------
     PRODUCT CLICK → OPEN PRODUCT PAGE
  ---------------------------------------- */
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {

      const images      = Array.from(card.querySelectorAll('.image-wrapper img')).map(i => i.src);
      const status      = card.querySelector('.status')?.innerText ?? null;
      const name        = card.querySelector('.product-name').innerText;
      const oldPrice    = card.querySelector('.old-price')?.innerText ?? null;
      const newPrice    = card.querySelector('.new-price')?.innerText ?? null;
      const colors      = Array.from(card.querySelectorAll('.color-buttons .color-btn'))
                               .map(btn => btn.dataset.color);

      const rawSizes    = Array.from(card.querySelectorAll('.size-buttons .size-btn'))
                               .map(btn => btn.dataset.size);

      const sizes       = rawSizes.map(s => s.replace('*', '').trim());
      const outOfStock  = rawSizes.filter(s => s.includes('*')).map(s => s.replace('*', '').trim());

      const description = card.dataset.description || '';
      const features    = card.dataset.features ? JSON.parse(card.dataset.features) : [];
      const sizeFit     = card.dataset.sizefit || '';

      const productId   = card.id;

      const productData = {
        images,
        name,
        oldPrice,
        newPrice,
        sizes,
        outOfStock,
        colors,
        description,
        features,
        sizeFit
      };

      localStorage.setItem('selectedProduct', JSON.stringify(productData));
      window.location.href = `product.html?id=${productId}`;
    });
  });

}; // END initializeProductBehaviors()


/* ----------------------------------------
   RUN ON PAGE LOAD
---------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  window.initializeProductBehaviors();
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







function generateProductId(name) {
  return name
    .split(" ")                // split by spaces
    .map(word => word[0])      // take first letter of each word
    .join("")                  // join them
    .toLowerCase();            // make lowercase
}

// "Work Shirt" → "ws"
// "Casual Pants" → "cp"
