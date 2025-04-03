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




