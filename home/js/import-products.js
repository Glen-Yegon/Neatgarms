// js/import-products.js
async function loadProducts() {
  try {
    const response = await fetch('/partials/products.html');
    const html = await response.text();

    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Select all slots on the page that expect a product
    document.querySelectorAll('.product-slot[data-product-id]').forEach(slot => {
      const id = slot.getAttribute('data-product-id');

      // Find the product card in the partial by ID
      const productCard = temp.querySelector(`#${id}`);
      if (!productCard) return;

      // Deep clone the product card so we don't alter the template
      const clone = productCard.cloneNode(true);

      // Append the full card, badge included
      slot.appendChild(clone);
    });

    // Re-run your UI behaviors (hover swap, buttons, etc.)
    if (typeof window.initializeProductBehaviors === "function") {
      window.initializeProductBehaviors();
    }

  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

document.addEventListener('DOMContentLoaded', loadProducts);
