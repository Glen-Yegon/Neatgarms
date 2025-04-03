// Get the menu button, menu, and close button
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const closeBtn = document.getElementById('close-btn');

// Toggle the menu visibility when the menu button is clicked
menuBtn.addEventListener('click', () => {
  menu.style.display = 'block'; // Show the menu
});

// Close the menu when the close button is clicked
closeBtn.addEventListener('click', () => {
  menu.style.display = 'none'; // Hide the menu
});


// Close the menu if the user clicks anywhere outside of it
document.addEventListener('click', (event) => {
  if (!menu.contains(event.target) && event.target !== menuBtn) {
    menu.style.display = 'none'; // Hide the menu if click is outside
  }
});




document.addEventListener("DOMContentLoaded", () => {
  // Get all images on the page
  const images = document.querySelectorAll('img');

  images.forEach(img => {
      // Get the current image source
      let src = img.getAttribute('src');
      
      // Check if the image is already a WebP, if not, convert it
      if (!src.includes('.webp')) {
          // Replace the file extension with .webp
          let webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          img.setAttribute('src', webpSrc);
      }

      // Set loading="lazy" to images for lazy loading
      img.setAttribute('loading', 'lazy');

      // Optionally, resize images if you want to enforce smaller sizes (optional)
      // Example: If the image is wider than 800px, resize it
      img.onload = function() {
          if (img.width > 800) {
              img.width = 800;
          }
      };
  });
});
