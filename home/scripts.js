
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

document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("neatScrollSection");
  const content = document.getElementById("neatScrollContent");

  function updateScrollAnimation() {
    if (!section || !content) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportH = window.innerHeight;

    /* Start when section enters screen */
    const scrollProgressRaw = (viewportH - rect.top) / (sectionHeight + viewportH);
    const progress = Math.max(0, Math.min(scrollProgressRaw, 1));

    /* Content movement range */
    const contentHeight = content.offsetHeight;

    /* Starts near top, ends near bottom */
    const startY = 40;
    const endY = sectionHeight - contentHeight - 60;

    const moveY = startY + (endY - startY) * progress;

    content.style.transform = window.innerWidth >= 992
      ? `translateY(${moveY}px)`
      : `translateX(-50%) translateY(${moveY}px)`;
  }

  updateScrollAnimation();
  window.addEventListener("scroll", updateScrollAnimation, { passive: true });
  window.addEventListener("resize", updateScrollAnimation);
});