
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target); // only animate once
    }
  });
});

document.querySelectorAll('.product-card').forEach(card => {
  observer.observe(card);
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


