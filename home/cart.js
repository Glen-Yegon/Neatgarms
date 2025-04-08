document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const closeModalBtn = document.getElementById('close-btn');
    const buyNowButton = document.getElementById('buy-now-btn');
    
    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
// Function to render the cart
const renderCart = () => {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById("combined-price").textContent = "0.00"; // Reset combined price
  } else {
    cartItemsContainer.innerHTML = ''; // Clear previous content
    let combinedPrice = 0; // Initialize combined price

    cart.forEach((item, index) => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');

      // Clean and parse the newPrice
      const cleanedPrice = (item.newPrice || '0').replace(/KSh|,/g, '').trim(); 
      const newPrice = parseFloat(cleanedPrice) || 0; // Convert to a valid number
      const quantity = parseInt(item.quantity) || 1;  // Ensure quantity is an integer

      // Calculate total price for this item
      const totalPrice = newPrice * quantity;

      // Add to combined price
      combinedPrice += totalPrice;

      // Create the product card
      productCard.innerHTML = `
        <div>
          <!-- Product Image -->
          <img src="${item.image}" alt="${item.name}" style="width:100px; height:auto;">
          
          <!-- Product Details -->
          <h3>${item.brand}</h3>
          <p>${item.name}</p>
          <p>Old Price: <del>${item.oldPrice || 'N/A'}</del></p>
          <p>New Price (per item): KSh${newPrice.toFixed(2)}</p>
          <p>Total Price: KSh${totalPrice.toFixed(2)}</p>
          <p>Status: ${item.status || 'N/A'}</p>
          
          <!-- Display Size if available -->
          ${item.size ? `<p>Size: ${item.size}</p>` : ''}
          
          <!-- Display Color if available -->
          ${item.color ? `
            <p>Color: 
              <span style="background-color:${item.color}; padding:5px; border-radius:50%;">&nbsp;</span>
            </p>` : ''}
          
          <!-- Quantity -->
          <p>Quantity: ${quantity}</p>
        </div>
        <span class="remove-btn" data-index="${index}">Remove</span>
      `;

      // Append the product card to the container
      cartItemsContainer.appendChild(productCard);
    });

    // Update the combined price in the HTML
    document.getElementById("combined-price").textContent = combinedPrice.toFixed(2);
  }
};

    
    
    



// Render the cart items on page load
renderCart();




  
    // Remove Product from Cart
    cartItemsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-btn')) {
        const index = e.target.getAttribute('data-index');
        cart.splice(index, 1); // Remove item from cart array
        localStorage.setItem('cart', JSON.stringify(cart)); // Update localStorage
        renderCart(); // Re-render cart
      }
    });
  
    // Close Cart Modal
    closeModalBtn.addEventListener('click', () => {

      window.history.back(); // Goes back to the previous page

    });
  
    // Buy Now Button (for demo purpose, you can extend checkout logic)
    buyNowButton.addEventListener('click', () => {
  // Save cart items to localStorage
  localStorage.setItem('cartItems', JSON.stringify(cart));

  // Redirect to the "buy.html" page
  window.location.href = "buy.html";
    });
  
    // Render the cart on page load
    renderCart();
  });
  


