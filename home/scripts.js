  
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


// Script for Scroll Effects
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Check if scrolling down
    if (currentScroll > lastScrollTop) {
        navbar.style.backgroundColor = 'transparent'; // Make navbar transparent when scrolling down
        navbar.style.padding = '10px 40px'; // Shrink padding when scrolling down
    } else {
        navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Revert navbar color when scrolling up
        navbar.style.padding = '20px 40px'; // Reset padding when scrolling up
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative values
});

// Script for Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navbarLinks = document.querySelector('.navbar nav ul');
const mobileDropdown = document.querySelector('.mobile-dropdown');

hamburger.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
    mobileDropdown.classList.toggle('active'); // Toggle mobile dropdown visibility
});


// JavaScript for Scroll Effect on Navbar
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// JavaScript for Scroll Effect on Navbar
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled'); // Add class when scrolling
    } else {
        navbar.classList.remove('scrolled'); // Remove class when at top
    }
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
  

  // JavaScript to make navbar fully transparent on scroll
window.addEventListener("scroll", function() {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 0) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
  
