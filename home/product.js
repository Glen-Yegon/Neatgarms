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

      let selectedSize = null;
let selectedColor = null;


/* ---- product.js ---- */
if (productData.sizes?.length) {
  const sizeSelection = document.querySelector('.size-selection');

  sizeSelection.innerHTML =
    `<h4>Available:</h4>` +
    productData.sizes.map(size => {
      const soldOut = productData.outOfStock?.includes(size);

      return `
        <button class="size-btn${soldOut ? ' unavailable' : ''}"
                data-size="${size}"
                ${soldOut ? 'aria-disabled="true" data-soldout="true"' : ''}>
          ${size}
        </button>`;
    }).join('');

  /* live sizes: select */
  document.querySelectorAll('.size-btn:not(.unavailable)')
    .forEach(btn => btn.addEventListener('click', function () {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      console.log('Selected Size:', this.dataset.size);
    }));

  /* sold‑out sizes: politely alert */
  document.querySelectorAll('.size-btn.unavailable')
    .forEach(btn => btn.addEventListener('click', () => {
      alert('Sorry, that size is currently sold out.');
      /* If you have a toast system, trigger it here instead of alert() */
    }));
}




document.getElementById('back-button').addEventListener('click', () => {
  window.history.back();
});


      // Inject content from productData
document.getElementById('product-description').innerText = productData.description;
document.getElementById('size-fit').innerText = productData.sizeFit;

// Inject features as a list
const featuresList = document.querySelector('#key-features ul');
if (Array.isArray(productData.features)) {
  productData.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    featuresList.appendChild(li);
  });
}


// Toggle functionality for dropdowns
document.querySelectorAll('.toggle-btn').forEach(button => {
  button.addEventListener('click', () => {
    const content = button.nextElementSibling;
    button.classList.toggle('active');
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  });
});


// Dynamically create color buttons (if colors exist in productData)
if (productData.colors && productData.colors.length > 0) {
  const colorSelection = document.querySelector('.color-selection');
  colorSelection.innerHTML = `<h4>Available Colors:</h4>` +
    productData.colors.map(color => 
      `<button class="color-btn" data-color="${color}" style="background-color:${color.toLowerCase()}">${color}</button>`
    ).join('');
      // Now add the click listeners AFTER rendering the buttons
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      const selectedColor = this.getAttribute('data-color');
      console.log('Selected Color:', selectedColor);
    });
  });

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


function validateSelections() {
  const selectedSize = document.querySelector('.size-btn.selected');
  const selectedColor = document.querySelector('.color-btn.selected');

  const sizeBtn = document.querySelector('.size-btn');
  const colorBtn = document.querySelector('.color-btn');

  const sizeExists = sizeBtn && sizeBtn.offsetParent !== null;
  const colorExists = colorBtn && colorBtn.offsetParent !== null;

  if (sizeExists && !selectedSize) {
    alert("Please select a size before proceeding.");
    return false;
  }

  if (colorExists && !selectedColor) {
    alert("Please select a color before proceeding.");
    return false;
  }

  return true;
}



document.getElementById('add-to-cart').addEventListener('click', () => {
if (!validateSelections()) return;

  // Retrieve product details
  const productImage = document.getElementById('main-image').src;
  const productBrand = document.getElementById('product-brand').innerText;
  const productName = document.getElementById('product-name').innerText;
  const oldPrice = document.querySelector('.old-price')?.innerText || null;
  const newPrice = document.querySelector('.new-price')?.innerText || null;

  const selectedSize = document.querySelector('.size-btn.selected')?.dataset.size || null;
  const selectedColor = document.querySelector('.color-btn.selected')?.dataset.color || null;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;

  const productData = {
    image: productImage,
    brand: productBrand,
    name: productName,
    oldPrice: oldPrice,
    newPrice: newPrice,
    size: selectedSize,
    color: selectedColor,
    quantity: quantity
  };

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(productData);
  localStorage.setItem('cart', JSON.stringify(cart));

  window.location.href = 'cart.html';
});



document.getElementById('buy-now').addEventListener('click', function () {
 if (!validateSelections()) return;

  const mainImage = document.getElementById('main-image')?.src || '';
  const productBrand = document.getElementById('product-brand')?.textContent?.trim() || 'Unknown Brand';
  const productName = document.getElementById('product-name')?.textContent?.trim() || 'Unknown Product';
  const oldPrice = document.querySelector('.old-price')?.textContent?.trim() || 'N/A';
  const newPrice = document.querySelector('.new-price')?.textContent?.trim() || 'N/A';

  const selectedSize = document.querySelector('.size-btn.selected')?.dataset.size || null;
  const selectedColor = document.querySelector('.color-btn.selected')?.dataset.color || null;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;

  const product = {
    image: mainImage,
    brand: productBrand,
    name: productName,
    quantity: quantity,
    oldPrice,
    newPrice,
    size: selectedSize,
    color: selectedColor
  };

  localStorage.setItem('buyNowProduct', JSON.stringify(product));
  window.location.href = 'buy2.html';
});







// Ensure the correct ID is targeted
document.getElementById('share-btn').addEventListener('click', async () => {
  // Get product details
  const productBrand = document.getElementById('product-brand')?.textContent || 'Unknown Brand';
  const productName = document.getElementById('product-name')?.textContent || 'Unnamed Product';
  const newPrice = document.querySelector('.new-price')?.textContent || 'No New Price';
  const shareUrl = window.location.href; // This page should already have <meta property="og:image" ...>

  // Create the share text
  const shareText = `
Check out this product from NeatGarms!
🧵 Brand: ${productBrand}
👕 Name: ${productName}
🔥 New Price: ${newPrice}
👇 View it here:
`;

  // Check if the Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${productBrand} - ${productName} | NeatGarms`,
        text: shareText,
        url: shareUrl, // The link shared should contain proper <meta> tags to show thumbnail on platforms
      });
    } catch (error) {
      console.error('Sharing failed', error);
    }
  } else {
    // Fallback: Copy details to clipboard
    const clipboardText = `${shareText}\n${shareUrl}`;
    navigator.clipboard.writeText(clipboardText).then(() => {
      alert('Product details copied to clipboard! Share it with friends.');
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




document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', () => {

    /* ---------- unchanged fields ---------- */
    const images    = Array.from(card.querySelectorAll('.image-wrapper img')).map(i => i.src);
    const status    = card.querySelector('.status')?.innerText ?? null;
    const name      = card.querySelector('.product-name').innerText;
    const oldPrice  = card.querySelector('.old-price')?.innerText ?? null;
    const newPrice  = card.querySelector('.new-price')?.innerText ?? null;
    const colors    = Array.from(card.querySelectorAll('.color-buttons .color-btn'))
                           .map(btn => btn.dataset.color);

    /* ---------- ⭐ NEW logic for sizes ---------- */
    const rawSizes   = Array.from(card.querySelectorAll('.size-buttons .size-btn'))
                            .map(btn => btn.dataset.size);        // e.g. ["S*", "L", "2 XL*"]

    const sizes      = rawSizes.map(s => s.replace('*', '').trim());         // → ["S", "L", "2 XL"]
    const outOfStock = rawSizes.filter(s => s.includes('*'))
                               .map(s => s.replace('*', '').trim());         // → ["S", "2 XL"]

    /* ---------- extra descriptive info (unchanged) ---------- */
    const description = card.dataset.description || '';
    const features    = card.dataset.features ? JSON.parse(card.dataset.features) : [];
    const sizeFit     = card.dataset.sizefit || '';

    /* ---------- package & ship ---------- */
    const productData = {
      images,
      name,
      oldPrice,
      newPrice,
      sizes,          // now “clean” sizes
      outOfStock,     // ✖ sold‑out sizes
      colors,
      description,
      features,
      sizeFit
    };

    console.log('🛈 productData about to store →', productData);

    localStorage.setItem('selectedProduct', JSON.stringify(productData));
    window.location.href = 'product.html';
  });
});



 const productData = JSON.parse(localStorage.getItem('selectedProduct'));
  const mainImage = document.getElementById('main-image');
  const thumbnailList = document.getElementById('thumbnail-list');
  const prevButton = document.getElementById('prev-image');
  const nextButton = document.getElementById('next-image');

  let currentImageIndex = 0;
  let thumbnails = [];

  function updateMainImage(index) {
    if (!productData.images || !productData.images[index]) return;
    mainImage.src = productData.images[index];
    thumbnails.forEach(img => img.classList.remove('active'));
    if (thumbnails[index]) {
      thumbnails[index].classList.add('active');
    }
  }

  if (productData && productData.images.length > 0) {
    thumbnails = productData.images.map((src, index) => {
      const thumb = document.createElement('img');
      thumb.src = src;
      thumb.addEventListener('click', () => {
        currentImageIndex = index;
        updateMainImage(index);
      });
      thumbnailList.appendChild(thumb);
      return thumb;
    });

    updateMainImage(0);

    prevButton.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + productData.images.length) % productData.images.length;
      updateMainImage(currentImageIndex);
    });

    nextButton.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % productData.images.length;
      updateMainImage(currentImageIndex);
    });

    const observer = new MutationObserver(() => {
      const newIndex = productData.images.indexOf(mainImage.src);
      if (newIndex !== -1 && newIndex !== currentImageIndex) {
        currentImageIndex = newIndex;
        updateMainImage(currentImageIndex);
      }
    });

    observer.observe(mainImage, { attributes: true, attributeFilter: ['src'] });
  }