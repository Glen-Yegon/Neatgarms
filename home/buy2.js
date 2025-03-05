// Dropdown toggle functionality
const toggleDropdown = document.getElementById('toggle-dropdown');
const orderSummaryDropdown = document.getElementById('order-summary-dropdown');

toggleDropdown.addEventListener('click', () => {
  orderSummaryDropdown.style.display =
    orderSummaryDropdown.style.display === 'block' ? 'none' : 'block';
});


document.addEventListener('DOMContentLoaded', function () {
  const productCardSection = document.getElementById('product-card-section');

  // Retrieve the product details from localStorage
  const product = JSON.parse(localStorage.getItem('buyNowProduct'));

  // Check if product data exists
  if (product) {
    // Parse the new price as a number and calculate the total
    const newPrice = parseFloat(product.newPrice.replace(/KSh|,/g, '')) || 0; // Remove "KSh" or commas for accurate calculations
    const quantity = product.quantity || 1; // Default to 1 if no quantity is specified
    const total = newPrice * quantity; // Calculate the total

    // Create the product card
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');

    productCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <!-- Product Image -->
        <img src="${product.image}" alt="${product.name}" style="width: 80px; height: auto; border-radius: 5px;">
        
        <!-- Product Details -->
        <div>
          <h4>${product.name}</h4>
          <p>Brand: ${product.brand}</p>
          <p><del>KSh${product.oldPrice || 'N/A'}</del> <strong>KSh${product.newPrice}</strong></p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Total:</strong> KSh${total.toFixed(2)}</p>
        </div>
      </div>
    `;

    // Append the product card to the designated section
    productCardSection.appendChild(productCard);

    // Display the total in the Estimated Total section
    const estimatedTotalSection = document.querySelector('.estimated-total');
    if (estimatedTotalSection) {
      estimatedTotalSection.innerHTML = `
        <h3>Estimated Total: KSh<span id="combined-price">${total.toFixed(2)}</span></h3>
      `;
    }
  } else {
    // If no product data is found, display a message
    productCardSection.innerHTML = '<p>No product found. Please go back and select a product.</p>';
  }
});







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

// Retrieve the product data from localStorage
const product = JSON.parse(localStorage.getItem('buyNowProduct'));

// Check if the product exists and if discount code is valid
if (product && discountValue !== undefined) {
  // Calculate the total price from the product's new price and quantity
  const newPrice = parseFloat(product.newPrice.replace(/KSh|,/g, '')) || 0;
  const quantity = product.quantity || 1;
  const total = newPrice * quantity;

  // Calculate discounted price
  const discountedTotal = total - (total * discountValue / 100);

  // Update the total price in the Estimated Total section
  const combinedPriceElement = document.getElementById('combined-price');
  combinedPriceElement.textContent = discountedTotal.toFixed(2);

  // Notify the user
  alert(`Discount code applied! You saved ${discountValue}%.`);
} else {
  // If the discount code is invalid, show an alert
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


  document.getElementById("pay-now-btn").innerText = "Processing...";
// After form submission
document.getElementById("pay-now-btn").innerText = "Pay Now";


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
