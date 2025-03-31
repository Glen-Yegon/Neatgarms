  
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
  






  
