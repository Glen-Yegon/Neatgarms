document.addEventListener("DOMContentLoaded", function () {
    const itemSection = document.getElementById("item-section");
    const displayName = document.getElementById("display-name");
    const displayPrice = document.getElementById("display-price");
  
    // Retrieve images from localStorage
    let storedImages = JSON.parse(localStorage.getItem("checkoutImages")) || [];
  
    // Display images
    if (storedImages.length === 0) {
      itemSection.innerHTML = "<p>No items added yet.</p>";
    } else {
      itemSection.innerHTML = ""; // Clear previous content
      storedImages.forEach((imgUrl) => {
        const imgElement = document.createElement("img");
        imgElement.src = imgUrl;
        imgElement.classList.add("order-image");
        imgElement.style.width = "150px";
        imgElement.style.margin = "10px";
        itemSection.appendChild(imgElement);
      });
    }
  
    // Retrieve and display name & price
    const itemName = localStorage.getItem("nameID") || "Unknown Item";
    const itemPrice = localStorage.getItem("priceID") || "0";
  
    displayName.textContent = `Item: ${itemName}`;
    displayPrice.textContent = `Price: Kshs. ${itemPrice}`;
  });


  document.getElementById('item-count').addEventListener('input', updateDropdowns);

  document.querySelectorAll('.radio-input').forEach(radio => {
    radio.addEventListener('change', updateDropdowns);
  });
  
  function updateDropdowns() {
    const count = parseInt(document.getElementById('item-count').value);
    if (isNaN(count) || count < 1) return;
  
  
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
  

  // Example of valid discount codes and their corresponding discounts
const validDiscountCodes = {
    'DISCOUNT10': 0.1,  // 10% discount
    'DISCOUNT20': 0.2,  // 20% discount
  };
  
  // Get the elements
  const applyDiscountButton = document.getElementById('apply-discount-btn');
  const discountCodeInput = document.getElementById('discount-code');
  const displayName = document.getElementById('display-name');
  const displayPrice = document.getElementById('display-price');
  
  // Retrieve the item name and price from localStorage
  const itemName = localStorage.getItem('nameID');
  const itemPrice = parseFloat(localStorage.getItem('priceID')); // Ensure it's a number
  
  // Display the retrieved name and price
  if (itemName && itemPrice) {
    displayName.textContent = itemName;
    displayPrice.textContent = `Price: Kshs. ${itemPrice.toFixed(2)}`;
  } else {
    displayName.textContent = "Item not found!";
    displayPrice.textContent = "Price not available";
  }
  
  // Function to apply discount
  applyDiscountButton.addEventListener('click', () => {
    const discountCode = discountCodeInput.value.trim(); // Get the discount code entered by the user
    let discountedPrice = itemPrice; // Default discounted price is the original price
  
    // Check if the entered discount code is valid
    if (validDiscountCodes[discountCode]) {
      const discountPercentage = validDiscountCodes[discountCode]; // Get the discount percentage
      discountedPrice = itemPrice * (1 - discountPercentage); // Apply the discount
  
      // Update the price display with the discounted price
      displayPrice.textContent = `Price: Kshs. ${discountedPrice.toFixed(2)}`; // Show the discounted price
    } else {
      alert('Invalid Discount Code!'); // Alert user if discount code is invalid
    }
  });

  // Define available designs for each item
const designs = {
    "Black T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "White T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Aqua Blue T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Navy Blue T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Dark brown T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Jungle Green  T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Pink T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Purple T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Red T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Maroon T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    " T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
    "Black T shirt": ["Classic Fit", "Slim Fit", "V-Neck", "Round Neck"],
  };
  
  // Function to generate design options
  function generateDesignOptions(itemName) {
    const designOptionsContainer = document.getElementById("design-options");
    designOptionsContainer.innerHTML = ""; // Clear previous options
  
    if (designs[itemName]) {
      designs[itemName].forEach((design) => {
        const radioWrapper = document.createElement("div");
        radioWrapper.classList.add("radio-container");
  
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "design";
        radio.value = design;
        radio.id = design;
  
        const label = document.createElement("label");
        label.htmlFor = design;
        label.textContent = design;
  
        radioWrapper.appendChild(radio);
        radioWrapper.appendChild(label);
        designOptionsContainer.appendChild(radioWrapper);
      });
    } else {
      designOptionsContainer.innerHTML = "<p>No designs available for this item.</p>";
    }
  }
  
  // Function to display item details and trigger design selection
  function updateDisplay() {
    const displayName = document.getElementById("display-name");
    const displayPrice = document.getElementById("display-price");
  
    // Retrieve item details from localStorage
    const itemName = localStorage.getItem("nameID");
    const itemPrice = parseFloat(localStorage.getItem("priceID"));
  
    // Display the item name and price
    if (itemName && itemPrice) {
      displayName.textContent = itemName;
      displayPrice.textContent = `Price: Kshs. ${itemPrice.toFixed(2)}`;
  
      // Generate design options based on the displayed item name
      generateDesignOptions(itemName);
    } else {
      displayName.textContent = "Item not found!";
      displayPrice.textContent = "Price not available";
    }
  }
  
  // Run updateDisplay when the page loads
  window.onload = updateDisplay;
  
  
  

  
  




  
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
  
  // Get the displayed price from the element with id "display-price"
  const displayPriceElem = document.getElementById('display-price');
  const displayPriceText = displayPriceElem ? displayPriceElem.innerText.trim() : "";
  
  // Use regex to extract the first valid number from the displayed price text
  const match = displayPriceText.match(/(\d+(?:\.\d+)?)/);
  const numericDisplayPrice = match ? parseFloat(match[0]) : 0;
  
  const numericAmount = parseFloat(amount);
  
  console.log("Entered amount:", numericAmount);
  console.log("Displayed price:", numericDisplayPrice, "Raw text:", displayPriceText);
  
  if (!phone || !amount) {
    alert("Please enter your phone number and ensure the amount is available.");
    return;
  }
  
  // Check if the entered amount matches the displayed price with a tolerance (if needed)
  const tolerance = 0.01;
  if (Math.abs(numericAmount - numericDisplayPrice) > tolerance) {
    alert("The amount entered does not match the displayed price. Please check the amount.");
    return;
  }
  
  try {
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
