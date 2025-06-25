// Dropdown toggle functionality
const toggleDropdown = document.getElementById('toggle-dropdown');
const orderSummaryDropdown = document.getElementById('order-summary-dropdown');

toggleDropdown.addEventListener('click', () => {
  orderSummaryDropdown.style.display =
    orderSummaryDropdown.style.display === 'block' ? 'none' : 'block';
});





const renderCartFromLocalStorage = () => {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const combinedPriceElement = document.getElementById("combined-price");

  // Retrieve cart items from localStorage
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    combinedPriceElement.textContent = "0.00"; // Reset combined price
  } else {
    cartItemsContainer.innerHTML = ''; // Clear previous content
    let combinedPrice = 0; // Initialize combined price

    cart.forEach((item) => {
      const productCard = document.createElement('div');
      productCard.classList.add('cart-item');

      // Clean and parse the newPrice
      const cleanedPrice = (item.newPrice || '0').replace(/KSh|,/g, '').trim();
      const newPrice = parseFloat(cleanedPrice) || 0; // Convert to a valid number
      const quantity = parseInt(item.quantity) || 1;  // Ensure quantity is an integer

      // Calculate total price for this item 
      const totalPrice = newPrice * quantity;

      // Add to combined price (items only)
      combinedPrice += totalPrice;

      // Create the product card
      productCard.innerHTML = `
        <div style="display: grid;">
          <!-- Product Image -->
          <img src="${item.image}" alt="${item.name}" style="width:70px; height:auto;">
          
          <!-- Product Details -->
          <h4>${item.name}</h4>
          <p>Brand: ${item.brand}</p>
          <p>Price: KSh${newPrice.toFixed(2)}</p>
          <p>Qty: ${quantity}</p>
          
          <!-- Display Size if available -->
          ${item.size ? `<p>Size: ${item.size}</p>` : ''}

          <!-- Display Color if available -->
          ${item.color ? `
            <p>Color: 
              <span style="background-color:${item.color}; padding:5px; border-radius:50%;">&nbsp;</span>
            </p>` : ''}

          <p>Total Price: KSh${totalPrice.toFixed(2)}</p>
        </div>
      `;

      // Append the product card to the container
      cartItemsContainer.appendChild(productCard);
    });
  


// No longer including shipping fee in final price
const finalPrice = combinedPrice;

// Show the total in combinedPriceElement
combinedPriceElement.textContent = finalPrice.toFixed(2);
  }}
  


  // Call renderCartFromLocalStorage on page load to render the items from localStorage
  window.onload = renderCartFromLocalStorage;

  
  
// Discount Codes (Example)
const discountCodes = {
  "SAVE10": 10, // 10% off
  "FREESHIP": 0, // Free shipping (no cost here as shipping is already free)
  "BIGSALE": 20 // 20% off
};

// Event Listener for Apply Button
document.getElementById('apply-discount-btn').addEventListener('click', function () {
  const discountInput = document.getElementById('discount-code').value.trim();
  const discountValue = discountCodes[discountInput];
  const combinedPriceElement = document.getElementById('combined-price');

  if (discountValue !== undefined) {
    // Fetch current total price
    const currentTotal = parseFloat(combinedPriceElement.textContent) || 0;

    // Calculate discounted price
    const newTotal = currentTotal - (currentTotal * discountValue / 100);

    // Update total price
    combinedPriceElement.textContent = newTotal.toFixed(2);

    // Notify the user
    alert(`Discount code applied! You saved ${discountValue}%.`);
  } else {
    // Notify the user of invalid code
    alert('Invalid discount code. Please try again.');
  }
});


// Handle payment method selection using images
const paymentMethods = document.querySelectorAll('.payment-method');

paymentMethods.forEach(method => {
  method.addEventListener('click', function() {
    // Remove selected class from all payment methods
    paymentMethods.forEach(m => m.classList.remove('selected'));

    // Add selected class to the clicked method
    method.classList.add('selected');
  });
});


// Select the radio buttons and address containers
const sameAsShippingRadio = document.getElementById('same-as-shipping');
const differentBillingRadio = document.getElementById('different-billing');
const sameAddressContainer = document.getElementById('same-address-container');
const differentAddressContainer = document.getElementById('different-address-container');

// Add event listeners to toggle the visibility of address forms
sameAsShippingRadio.addEventListener('change', function() {
  if (this.checked) {
    sameAddressContainer.style.display = 'block';
    differentAddressContainer.style.display = 'none';
  }
});

differentBillingRadio.addEventListener('change', function() {
  if (this.checked) {
    sameAddressContainer.style.display = 'none';
    differentAddressContainer.style.display = 'block';
  }
});

// Initial check for default behavior (Same as shipping address)
if (sameAsShippingRadio.checked) {
  sameAddressContainer.style.display = 'block';
  differentAddressContainer.style.display = 'none';
}




// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}




function goBack() {
  history.back();
}

