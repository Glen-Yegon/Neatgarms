gsap.fromTo(
    ".loading-page",
    { opacity: 1 },
    {
      opacity: 0,
      display: "none",
      duration: 1.5,
      delay: 3.5,
    }
  );
  
  gsap.fromTo(
    ".logo-name",
    {
      y: 50,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 2,
      delay: 0.5,
    }
  );

// Wait until the page has fully loaded
window.addEventListener('load', function () {
    // Set a 6-second timeout before redirecting
    setTimeout(function() {
      // Redirect to home.html after 5 seconds
      window.location.href = 'home.html';
    }, 7000); // 6000ms = 6 seconds
  });
  