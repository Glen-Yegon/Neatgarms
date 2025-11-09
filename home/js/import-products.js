// js/import-products.js
async function loadProducts() {
  const response = await fetch('/partials/products.html');
  const html = await response.text();

  const temp = document.createElement('div');
  temp.innerHTML = html;

  document.querySelectorAll('.product-slot[data-product-id]').forEach(slot => {
    const id = slot.getAttribute('data-product-id');
    const product = temp.querySelector(`#${id}`);
    if (product) slot.appendChild(product.cloneNode(true));
  });

  // ✅ After insertion, re-run your existing UI behaviors
  requestAnimationFrame(() => {
    if (typeof window.initializeProductBehaviors === "function") {
      window.initializeProductBehaviors();
    }
  });
}

document.addEventListener('DOMContentLoaded', loadProducts);
