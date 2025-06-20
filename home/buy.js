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



const shippingFeeText = document.getElementById("shipping-fee").textContent || "KSh 0";
const shippingFee = parseInt(shippingFeeText.replace(/KSh|,/g, '').trim()) || 0;

const finalPrice = combinedPrice + shippingFee;

// Show the total including shipping fee in combinedPriceElement
combinedPriceElement.textContent = finalPrice.toFixed(2);



  }
};

// Start observing shipping fee changes
const shippingFeeElement = document.getElementById("shipping-fee");

const observer = new MutationObserver(() => {
  renderCartFromLocalStorage(); // 👈 Re-run this every time shipping fee updates
});

// Observe changes in the shippingFee element
observer.observe(shippingFeeElement, {
  childList: true,
  characterData: true,
  subtree: true,
});






 const cityInput = document.getElementById('delivery-city');
  const nairobiAreasDiv = document.getElementById('nairobi-areas');
  const nairobiSubareaSelect = document.getElementById('nairobi-subarea');
  const shippingFeeDisplay = document.getElementById('shipping-fee');

  const cityFees = {
    Nakuru: 500,
    Kisumu: 800,
    Machakos: 400,
    Naivasha: 450,
    Nyeri: 500,
    Nanyuki: 500,
    Embu: 500,
    Narok: 500,
    Meru: 600,
    Kakamega: 800,
    Kitale: 800,
    Eldoret: 800,
    Kericho: 800,
    Mombasa: 800,
  };

  const nairobiFees = {
    "Lang'ata": 250,
    "Nairobi CBD": 250,
    "Westlands": 320,
    "Kilimani": 280,
    "Kileleshwa": 340,
    "South B": 250,
    "South C": 250,
    "Upper Hill": 250,
    "Karen": 1,
    "Rongai Tuskeys": 760,
    "JKIA": 660,
    "Syokimau": 720,
    "Ruaka (reference)": 700,
  };

  function updateShippingFee(fee) {
    shippingFeeDisplay.textContent = ` ${fee}`;
  }

  cityInput.addEventListener('input', function () {
    const city = cityInput.value.trim().toLowerCase();

    if (city === 'nairobi') {
      nairobiAreasDiv.style.display = 'block';
      updateShippingFee(0);
    } else {
      nairobiAreasDiv.style.display = 'none';
      const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
      const fee = cityFees[formattedCity] || 0;
      updateShippingFee(fee);
    }
  });

  nairobiSubareaSelect.addEventListener('change', function () {
    const selectedArea = nairobiSubareaSelect.value;
    const fee = nairobiFees[selectedArea] || 0;
    updateShippingFee(fee);

window.addEventListener('DOMContentLoaded', renderCartFromLocalStorage);

  });
  


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





/*
document.getElementById('mpesa-btn').addEventListener('click', () => {
  document.getElementById('payment-modal').style.display = 'block';
});

// When the user clicks "Cancel", hide the modal.
document.getElementById('cancel-payment').addEventListener('click', () => {
  document.getElementById('payment-modal').style.display = 'none';
});

document.getElementById('submit-payment').addEventListener('click', async () => {
  const phone = document.getElementById('phoneNo').value.trim();
  const amount = document.getElementById('amount').value.trim();
  
  // Get the estimated total from the order summary container.
  // Adjust the selector if needed.
  const estimatedTotalElem = document.querySelector('.estimated-total');
  const estimatedTotalText = estimatedTotalElem ? estimatedTotalElem.innerText.trim() : "";
  
  // Remove any non-numeric characters (like currency symbols) and convert to a float
  const numericAmount = parseFloat(amount);
  const numericEstimatedTotal = parseFloat(estimatedTotalText.replace(/[^\d.]/g, ''));
  
  if (!phone || !amount) {
    alert("Please enter your phone number and ensure the amount is available.");
    return;
  }
  
  // Check if the entered amount matches the displayed estimated total.
  if (numericAmount !== numericEstimatedTotal) {
    alert("The amount entered does not match the estimated total. Please check the amount.");
    return;
  }
  
  try {
    // Send a POST request to your backend endpoint
    const response = await fetch('https://neatgarms-risi.onrender.com/paynow4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount })
    });
    
    const data = await response.json();
    console.log("Payment Initiated:", data);
    
    if (data.ResponseCode === "0") {
      alert("Please check your phone to complete the payment by entering your MPesa PIN.");
    } else {
      alert("Payment initiation failed. Please try again.");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("An error occurred while submitting the form.");
  }
  
  // Hide the modal after submission
  document.getElementById('payment-modal').style.display = 'none';
});
*/