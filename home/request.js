function previewFile(input, previewId) {
  const preview = document.getElementById(previewId);
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" />`;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = "";
    preview.style.display = "none";
  }
}
function goBack() {
  history.back();
}
  




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
