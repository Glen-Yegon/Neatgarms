document.addEventListener('DOMContentLoaded', () => {
  const productData = JSON.parse(localStorage.getItem('selectedProduct'));
  
  if (productData) {
    const mainImage = document.getElementById('main-image');
    let currentImageIndex = 0;

    // Set the initial image
    mainImage.src = productData.images[currentImageIndex];

    // Button navigation
    document.getElementById('next-image').addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % productData.images.length;
      mainImage.src = productData.images[currentImageIndex];
    });

    document.getElementById('prev-image').addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + productData.images.length) % productData.images.length;
      mainImage.src = productData.images[currentImageIndex];
    });

    // Swipe functionality without modifying HTML
    const slider = document.querySelector('.image-slider');
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, false);

    function handleGesture() {
      const swipeThreshold = 30; // Minimum distance for a valid swipe
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left: move to next image
        currentImageIndex = (currentImageIndex + 1) % productData.images.length;
        mainImage.src = productData.images[currentImageIndex];
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right: move to previous image
        currentImageIndex = (currentImageIndex - 1 + productData.images.length) % productData.images.length;
        mainImage.src = productData.images[currentImageIndex];
      }
    }
  




 

  
      // Populate product details
      document.getElementById('product-name').innerText = productData.name;
      document.querySelector('.old-price').innerText = productData.oldPrice;
      document.querySelector('.new-price').innerText = productData.newPrice;
      document.getElementById('product-status').innerText = productData.status;




// Dynamically create size buttons (if sizes exist in productData)
if (productData.sizes && productData.sizes.length > 0) {
  const sizeSelection = document.querySelector('.size-selection');
  sizeSelection.innerHTML = `<h4>Available Sizes / Designs / Style:</h4>` +
    productData.sizes.map(size => 
      `<button class="size-btn" data-size="${size}">${size}</button>`
    ).join('');
}


document.getElementById('back-button').addEventListener('click', () => {
  window.history.back();
});


// Dynamically create color buttons (if colors exist in productData)
if (productData.colors && productData.colors.length > 0) {
  const colorSelection = document.querySelector('.color-selection');
  colorSelection.innerHTML = `<h4>Available Colors:</h4>` +
    productData.colors.map(color => 
      `<button class="color-btn" data-color="${color}" style="background-color:${color.toLowerCase()}">${color}</button>`
    ).join('');
}
  }});

      // Quantity Selector
      const quantityInput = document.getElementById('quantity');
      document.getElementById('increase-quantity').addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      });
  
      document.getElementById('decrease-quantity').addEventListener('click', () => {
        if (quantityInput.value > 1) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
        }
      });


      


  
  // Handle Add to Cart Button
document.getElementById('add-to-cart').addEventListener('click', () => {
  // Retrieve product details
  const productImage = document.getElementById('main-image').src; // First image
  const productBrand = document.getElementById('product-brand').innerText; // Product Brand
  const productName = document.getElementById('product-name').innerText; // Product Name
  const oldPrice = document.querySelector('.old-price').innerText || null; // Old Price
  const newPrice = document.querySelector('.new-price').innerText || null; // New Price
  const status = document.getElementById('product-status').innerText || null; // Product Status
  
  // Retrieve size (if available)
  const sizeSelection = document.querySelector('.size-selection input:checked');
  const selectedSize = sizeSelection ? sizeSelection.value : null;

  // Retrieve color (if available)
  const colorSelection = document.querySelector('.color-selection input:checked');
  const selectedColor = colorSelection ? colorSelection.value : null;

  // Retrieve quantity
  const quantity = parseInt(document.getElementById('quantity').value) || 1;

  // Prepare product data
  const productData = {
    image: productImage,
    brand: productBrand,
    name: productName,
    oldPrice: oldPrice,
    newPrice: newPrice,
    status: status,
    size: selectedSize,
    color: selectedColor,
    quantity: quantity
  };

  // Save product data to cart (in localStorage)
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(productData);
  localStorage.setItem('cart', JSON.stringify(cart));

  // Redirect to cart page
  window.location.href = 'cart.html';
});

document.getElementById('buy-now').addEventListener('click', function () {
  // Retrieve product details from the page
  const mainImage = document.getElementById('main-image')?.src || '';
  const productBrand = document.getElementById('product-brand')?.textContent?.trim() || 'Unknown Brand';
  const productName = document.getElementById('product-name')?.textContent?.trim() || 'Unknown Product';
  const oldPrice = document.querySelector('.old-price')?.textContent?.trim() || 'N/A';
  const newPrice = document.querySelector('.new-price')?.textContent?.trim() || 'N/A';

    // Retrieve quantity
    const quantity = parseInt(document.getElementById('quantity').value) || 1;

  // Debugging: Log retrieved values
  console.log("Collected Product Details:", {
    mainImage,
    productBrand,
    productName,
    oldPrice,
    newPrice,
  });

  // Construct the product object
  const product = {
    image: mainImage,
    brand: productBrand,
    name: productName,
    quantity: quantity,
    oldPrice,
    newPrice,
  };

  // Save the product object to localStorage
  localStorage.setItem('buyNowProduct', JSON.stringify(product));
  console.log("Product successfully saved to localStorage");

  // Redirect to the buy2.html page
  window.location.href = 'buy2.html';
});






// Ensure the correct ID is targeted
document.getElementById('share-btn').addEventListener('click', async () => {
  // Get product details
  const productBrand = document.getElementById('product-brand')?.textContent || 'Unknown Brand';
  const productName = document.getElementById('product-name')?.textContent || 'Unnamed Product';
  const oldPrice = document.querySelector('.old-price')?.textContent || 'No Old Price';
  const newPrice = document.querySelector('.new-price')?.textContent || 'No New Price';
  const productStatus = document.getElementById('product-status')?.textContent || 'Status not available';
  const currentImageSrc = document.getElementById('main-image')?.src || 'No Image Available';
  const shareUrl = window.location.href;

  // Create the share text
  const shareText = `
    Check out this product!
    Brand: ${productBrand}
    Name: ${productName}
    Old Price: ${oldPrice}
    New Price: ${newPrice}
    Status: ${productStatus}
    Image: ${currentImageSrc}
  `;

  // Check if the Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${productBrand} - ${productName}`,
        text: shareText,
        url: shareUrl,
      });
      alert('Thanks for sharing!');
    } catch (error) {
      console.error('Sharing failed', error);
    }
  } else {
    // Fallback: Copy details to clipboard
    const clipboardText = `${shareText}\nProduct URL: ${shareUrl}`;
    navigator.clipboard.writeText(clipboardText).then(() => {
      alert('Product details copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy to clipboard', err);
    });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const ratingInputs = document.querySelectorAll(".rating input[type='radio']");
  const selectedRatingDisplay = document.getElementById("selected-rating");

  ratingInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      selectedRatingDisplay.textContent = `Selected Rating: ${selectedValue} Stars`;
    });
  });
  
   // Handle form submission
 reviewForm.addEventListener("submit", (e) => {
  // Before submission, add hidden input with selected rating
  const existingHiddenInput = document.getElementById("hidden-rating");
  if (existingHiddenInput) {
    existingHiddenInput.value = selectedRatingDisplay.textContent.replace("Selected Rating: ", "");
  } else {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "rating";
    hiddenInput.id = "hidden-rating";
    hiddenInput.value = selectedRatingDisplay.textContent.replace("Selected Rating: ", "");
    reviewForm.appendChild(hiddenInput);
  }
});
});






document.addEventListener("DOMContentLoaded", () => {
  const reviewBtn = document.getElementById("review-btn");
  const reviewFormContainer = document.getElementById("review-form-container");
  const cancelBtn = document.getElementById("cancel-btn");
  const reviewForm = document.getElementById("review-form");

  let reviewData = {};

  // Toggle the form visibility
  reviewBtn.addEventListener("click", () => {
    if (reviewFormContainer.style.display === "none") {
      reviewFormContainer.style.display = "block";
      // Restore previously written data (if any)
      if (Object.keys(reviewData).length) {
        document.getElementById("review-title").value = reviewData.title || "";
        document.getElementById("review-content").value = reviewData.content || "";
        document.getElementById("reviewer-name").value = reviewData.name || "";
        document.getElementById("reviewer-email").value = reviewData.email || "";
        document.getElementById("review-stars").value = reviewData.stars || "";
      }
    } else {
      reviewFormContainer.style.display = "none";
    }
  });

    // Cancel button functionality
    cancelBtn.addEventListener("click", () => {
      reviewFormContainer.style.display = "none";
    });
  
    // Submit button functionality
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Prevent form reload
  
      const formData = new FormData(reviewForm);
  
      const emailData = {
        title: formData.get("review-title"),
        content: formData.get("review-content"),
        name: formData.get("reviewer-name"),
        email: formData.get("reviewer-email"),
        stars: formData.get("review-stars"),
        rating: formData.get("selected-rating"),
      };
  
      // Send form data to your email (using a server-side solution like PHP or Node.js)
      console.log("Review Submitted:", emailData);
  
      alert("Review submitted successfully!");
      reviewForm.reset();
      reviewFormContainer.style.display = "none";
    });
  
});


  




        