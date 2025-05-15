
document.querySelectorAll('.product-card').forEach(card => observer.observe(card));


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



  








  
