
gsap.fromTo(
  ".logo-name",
  {
    y: 50,
    opacity: 0,
  },
  {
    y: 0,
    opacity: 1,
    duration: 3,
    delay: 0.5,
  }
);



window.addEventListener("load", function () {
  setTimeout(function () {
    // Make sure fade-cover is interactable during transition
    document.querySelector(".fade-cover").style.pointerEvents = "auto";

    // Animate to full opacity before redirect
    gsap.to(".fade-cover", {
      opacity: 1,
      duration: 1.2, // Smooth fade duration
      ease: "power2.out", // Smoother easing
      onComplete: function () {
        window.location.href = "home.html";
      }
    });
  }, 3000);
});
