// Preview uploaded images
function previewFile(input, previewId) {
  const preview = document.getElementById(previewId);
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" />`;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
    preview.style.display = "none";
  }
}

// Go back button
function goBack() {
  history.back();
}

// Reference the quantity input
const quantityInput = document.getElementById('quantity');
const productsContainer = document.getElementById('productsContainer');

// Buttons
const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');

// Generate product fields
function generateProductFields(qty) {
  productsContainer.innerHTML = ''; // reset

  for (let i = 1; i <= qty; i++) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-item';
    productDiv.innerHTML = `
      <h4>Product ${i}</h4>

      <label for="size-${i}">Size</label>
      <select id="size-${i}" name="size-${i}" required>
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
        <option value="XL">XL</option>
        <option value="XXL">XXL</option>
      </select>

      <label for="color-${i}">Color</label>
      <select id="color-${i}" name="color-${i}" required>
        <option value="Black">Black</option>
        <option value="White">White</option>
        <option value="Cream">Cream</option>
        <option value="Aqua Blue">Aqua Blue</option>
        <option value="Dark Blue">Dark Blue</option>
        <option value="Jungle Green">Jungle Green</option>
        <option value="Purple">Purple</option>
        <option value="Red">Red</option>
      </select>
    `;
    productsContainer.appendChild(productDiv);
  }
}

// Run once on load
generateProductFields(quantityInput.value);

// Update dynamically when quantity changes
quantityInput.addEventListener('input', (e) => {
  const qty = parseInt(e.target.value) || 1;
  generateProductFields(qty);
});

// Increase/decrease buttons
increaseBtn.addEventListener('click', () => {
  quantityInput.value = parseInt(quantityInput.value) + 1;
  generateProductFields(quantityInput.value);
});

decreaseBtn.addEventListener('click', () => {
  if (parseInt(quantityInput.value) > parseInt(quantityInput.min)) {
    quantityInput.value = parseInt(quantityInput.value) - 1;
    generateProductFields(quantityInput.value);
  }
});


const totalPriceEl = document.getElementById("totalPrice");

const pricePerItem = 2500; // base price

function updatePrice() {
  const qty = parseInt(quantityInput.value) || 1;
  totalPriceEl.textContent = qty * pricePerItem;
}

// run once on load
updatePrice();

// update dynamically when quantity changes
quantityInput.addEventListener("input", updatePrice);

window.addEventListener("error", function(e){
  console.error("Global error caught:", e.error);
});

window.addEventListener("unhandledrejection", function(e){
  console.error("Promise rejection:", e.reason);
});


