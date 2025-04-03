  
// Interactive Navbar Hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("show");
  });
  
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.product-card').forEach(card => observer.observe(card));




// Script for Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navbarLinks = document.querySelector('.navbar nav ul');
const mobileDropdown = document.querySelector('.mobile-dropdown');

hamburger.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
    mobileDropdown.classList.toggle('active'); // Toggle mobile dropdown visibility
});




// Testimonials
// JavaScript is used to duplicate the cards for seamless looping
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".testimonial-slider");
    const cards = Array.from(slider.children);
    
    // Duplicate cards to ensure infinite scrolling effect
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      slider.appendChild(clone);
    });
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




  
