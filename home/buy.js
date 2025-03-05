// Dropdown toggle functionality
const toggleDropdown = document.getElementById('toggle-dropdown');
const orderSummaryDropdown = document.getElementById('order-summary-dropdown');

toggleDropdown.addEventListener('click', () => {
  orderSummaryDropdown.style.display =
    orderSummaryDropdown.style.display === 'block' ? 'none' : 'block';
});





// Function to render cart from localStorage
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
  
        // Add to combined price
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
  
      // Update the combined price in the HTML
      combinedPriceElement.textContent = combinedPrice.toFixed(2);
    }
  };
  
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


document.getElementById('item-count').addEventListener('input', updateDropdowns);

document.querySelectorAll('.radio-input').forEach(radio => {
  radio.addEventListener('change', updateDropdowns);
});

function updateDropdowns() {
  const count = parseInt(document.getElementById('item-count').value);
  if (isNaN(count) || count < 1) return;

  if (document.getElementById('design-radio').checked) {
    generateFields('design-dropdown', count, 'Design');
  } else {
    document.getElementById('design-dropdown').innerHTML = '';
  }

  if (document.getElementById('size-radio').checked) {
    generateFields('size-dropdown', count, 'Size');
  } else {
    document.getElementById('size-dropdown').innerHTML = '';
  }

  if (document.getElementById('color-radio').checked) {
    generateFields('color-dropdown', count, 'Color');
  } else {
    document.getElementById('color-dropdown').innerHTML = '';
  }
}

function generateFields(containerId, count, placeholder) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous fields

  for (let i = 1; i <= count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `${placeholder} ${i}`;
    container.appendChild(input);
  }
}

function goBack() {
  history.back();
}



// When the user clicks the "Pay Now" button, display the modal.
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
    const response = await fetch('http://localhost:5000/paynow4', {
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





let paymentsClient;

function onGooglePayLoaded() {
  // Initialize the PaymentsClient in TEST mode
  paymentsClient = new google.payments.api.PaymentsClient({
    environment: 'TEST'
  });

  // Optionally, check if Google Pay is available on the device
  paymentsClient.isReadyToPay(getGooglePayConfiguration())
    .then(function(response) {
      if (response.result) {
        console.log('Google Pay is available');
      } else {
        console.error('Google Pay is not available');
      }
    })
    .catch(function(err) {
      console.error('Error determining readiness to pay:', err);
    });
}

// Payment configuration: defines allowed payment methods and tokenization settings
function getGooglePayConfiguration() {
  const allowedCardNetworks = ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"];
  const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      'gateway': 'example', // Replace with your gateway when ready for production
      'gatewayMerchantId': 'exampleGatewayMerchantId'
    }
  };

  const cardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks
    },
    tokenizationSpecification: tokenizationSpecification
  };

  return {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [cardPaymentMethod]
  };
}

// Attach event listener to your button with id 'googlepay-btn'
document.getElementById('googlepay-btn').addEventListener('click', onGooglePayButtonClicked);

// When the user clicks the button, create a payment request and launch the Google Pay modal
function onGooglePayButtonClicked() {
  // Build the PaymentDataRequest object
  const paymentDataRequest = Object.assign({}, getGooglePayConfiguration(), {
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: '10.00',   // Example amount; update as needed
      currencyCode: 'USD'
    },
    merchantInfo: {
      merchantName: 'Neat'
      // Optionally, include your merchant ID here when going live
    }
  });
  
  // Launch the Google Pay modal
  paymentsClient.loadPaymentData(paymentDataRequest)
    .then(function(paymentData) {
      // Payment data returned by Google Pay
      console.log('Payment Data:', paymentData);
      
      // You can now send this payment token to your backend for processing:
      // e.g., processPayment(paymentData);
      
      // Optionally, if you wish to simulate a redirect after successful payment:
      // window.location.href = 'https://your-confirmation-page.com';
    })
    .catch(function(err) {
      console.error('Error loading payment data:', err);
    });
}
