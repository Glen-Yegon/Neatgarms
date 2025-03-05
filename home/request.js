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
  

