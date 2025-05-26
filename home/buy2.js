// Dropdown toggle functionality
const toggleDropdown = document.getElementById('toggle-dropdown');
const orderSummaryDropdown = document.getElementById('order-summary-dropdown');

toggleDropdown.addEventListener('click', () => {
  orderSummaryDropdown.style.display =
    orderSummaryDropdown.style.display === 'block' ? 'none' : 'block';
});

function renderProductWithShipping() {
  const productCardSection = document.getElementById('product-card-section');
  const product = JSON.parse(localStorage.getItem('buyNowProduct'));

  if (product) {
    const newPrice = parseFloat(product.newPrice.replace(/KSh|,/g, '')) || 0;
    const quantity = product.quantity || 1;
    const productTotal = newPrice * quantity;

    // Get shipping fee text from the element with ID 'shipping-fee'
    const shippingFeeText = document.getElementById("shipping-fee")?.textContent || "KSh 0";
    const shippingFee = parseInt(shippingFeeText.replace(/KSh|,/g, '').trim()) || 0;

    // Calculate final total including shipping fee
    const finalTotal = productTotal + shippingFee;

    // Clear previous content before appending
    productCardSection.innerHTML = '';

    // Create the product card
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');

    productCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
        <img src="${product.image}" alt="${product.name}" style="width: 80px; height: auto; border-radius: 5px;">
        <div>
          <h4>${product.name}</h4>
          <p>Brand: ${product.brand}</p>
          <p><del>KSh${product.oldPrice || 'N/A'}</del> <strong>KSh${product.newPrice}</strong></p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Total (without shipping):</strong> KSh${productTotal.toFixed(2)}</p>
        </div>
      </div>
    `;

    productCardSection.appendChild(productCard);

    // Update Estimated Total section to include shipping fee
    const estimatedTotalSection = document.querySelector('.estimated-total');
    if (estimatedTotalSection) {
      estimatedTotalSection.innerHTML = `
        <h3>Estimated Total: KSh<span id="combined-price">${finalTotal.toFixed(2)}</span></h3>
      `;
    }
  } else {
    productCardSection.innerHTML = '<p>No product found. Please go back and select a product.</p>';
  }
}

// Run once when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderProductWithShipping();

  // Set up MutationObserver to watch shipping fee changes
  const shippingFeeElement = document.getElementById('shipping-fee');
  if (shippingFeeElement) {
    const observer = new MutationObserver(() => {
      renderProductWithShipping();
    });

    observer.observe(shippingFeeElement, {
      characterData: true,
      childList: true,
      subtree: true
    });
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

  const designChecked = document.getElementById('design-radio').checked;
  const sizeChecked = document.getElementById('size-radio').checked;
  const colorChecked = document.getElementById('color-radio').checked;

  if (designChecked || sizeChecked || colorChecked) {
    const interleavedFields = [];

    // Loop to create interleaved fields
    for (let i = 1; i <= count; i++) {
      if (designChecked) interleavedFields.push({ type: 'design', index: i });
      if (sizeChecked) interleavedFields.push({ type: 'size', index: i });
      if (colorChecked) interleavedFields.push({ type: 'color', index: i });
    }

    // Now generate the interleaved fields in the #fields-container
    generateInterleavedFields(interleavedFields);
  }
}

function generateInterleavedFields(fields) {
  const container = document.getElementById('fields-container');
  container.innerHTML = ''; // Clear the container

  let currentItem = 0;
  let itemGroup;

  fields.forEach((field, index) => {
    // If it's a new item, create a new section
    if (field.index !== currentItem) {
      currentItem = field.index;

      // Create and append a heading label for the item
      const itemLabel = document.createElement('h4');
      itemLabel.textContent = `Item ${currentItem}`;
      itemLabel.style.marginTop = '15px';
      itemLabel.style.color = '#222';
      container.appendChild(itemLabel);
    }

    // Create the input field
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `${capitalizeFirstLetter(field.type)} ${field.index}`;
    input.name = `${field.type}-${field.index}`; // Optional: useful if you're submitting this in a form

    // Append input field below the item label
    container.appendChild(input);
  });
}


// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


  document.getElementById("pay-now-btn").innerText = "Processing...";
// After form submission
document.getElementById("pay-now-btn").innerText = "Submit Details";


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
    Kisumu: 750,
    Mombasa: 800
  };

  const nairobiFees = {
    "Lang'ata": 150,
    "Karen": 200,
    "Westlands": 180,
    "Kilimani": 160
    // Add more areas and their fees here
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

  });
  