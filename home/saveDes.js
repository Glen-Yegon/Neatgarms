
 // Import Firebase SDKs
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
 import {
   getAuth,
 } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
 import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
 import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
 


 // Firebase Config
 const firebaseConfig = {
   apiKey: "AIzaSyCLC4Dz-qxNOPtRFhybiBA5SqCDJgvKqMY",
   authDomain: "neat-53fa9.firebaseapp.com",
   projectId: "neat-53fa9",
   storageBucket: "neat-53fa9.firebasestorage.app",
   messagingSenderId: "857317417173",
   appId: "1:857317417173:web:6b84a45c96ebe56fce425c",
   measurementId: "G-5MQNYZF3E2",
 };
 
 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const auth = getAuth();
 const db = getFirestore(app);
 const storage = getStorage(app);

 const saveButton = document.getElementById("saveDesign");
 

 console.log("Current user:", auth.currentUser);


 saveButton.addEventListener('click', async function () {
  const lastSavedDesignId = localStorage.getItem('lastSavedDesignId');
  if (!lastSavedDesignId) {
    alert('No design found in localStorage!');
    return;
  }

  const savedDesignData = localStorage.getItem(lastSavedDesignId);
  if (!savedDesignData) {
    alert('No design data found in localStorage!');
    return;
  }

  const designData = JSON.parse(savedDesignData);
  console.log("Design Data:", designData);

  const designName = prompt('Enter a name for your design:');
  if (!designName) {
    alert('Design name is required!');
    return;
  }

  const userId = localStorage.getItem("loggedInUserId");
  if (!userId) {
    alert("Please log in to save your design.");
    return;
  }

  try {
    // Get the first canvas as preview (reduce size)
    const canvas = document.getElementById('canvas1'); // Adjust if needed
    let previewImage = null;
    
    if (canvas) {
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width / 2; // Reduce size by 50%
      tempCanvas.height = canvas.height / 2;
      ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      previewImage = tempCanvas.toDataURL("image/jpeg", 0.6); // Convert to JPEG & compress
    }

    // Store large images separately in Firebase Storage
    let previewImageUrl = null;
    if (previewImage) {
      const storageRef = ref(storage, `design_previews/${userId}_${Date.now()}.jpg`);
      const response = await fetch(previewImage);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      previewImageUrl = await getDownloadURL(storageRef);
    }

    // Format design data for Firestore (remove extra properties if needed)
    const firestoreDesignData = {
      name: designName,
      previewImage: previewImageUrl, // Store compressed image URL
      canvas1Objects: designData.canvas1 || null,
      canvas2Objects: designData.canvas2 || null,
      canvas3Objects: designData.canvas3 || null,
      canvas4Objects: designData.canvas4 || null,
    };

    // Save design in Firestore
    const docRef = doc(db, "designs", userId);
    await updateDoc(docRef, {
      userDesigns: arrayUnion(firestoreDesignData),
    });

    alert("Design saved successfully to Firestore!");
  } catch (error) {
    console.error("Error saving design to Firestore: ", error);
    alert("There was an error saving your design.");
  }
});







  window.addEventListener("beforeunload", function (event) {
    const isDesignSaved = sessionStorage.getItem("isDesignSaved") === "true";

    if (!isDesignSaved) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome, Edge, Firefox
    }
});

// Mark design as saved (Call this function when the user saves their work)
function markDesignAsSaved() {
    sessionStorage.setItem("isDesignSaved", "true");
}

// Mark design as unsaved (Call this function when the user makes a change)
function markDesignAsUnsaved() {
    sessionStorage.setItem("isDesignSaved", "false");
}



async function loadDesignFromFirestore() {
  const userId = localStorage.getItem("loggedInUserId");
  if (!userId) {
    alert("User not logged in.");
    return;
  }
  
  const designDocRef = doc(db, "designs", userId);
  try {
    const docSnap = await getDoc(designDocRef);
    if (docSnap.exists()) {
      const designData = docSnap.data();
      
      if (!designData.userDesigns || designData.userDesigns.length === 0) {
        alert("No designs found for this user.");
        return;
      }

      // Get modal elements
      const modal = document.getElementById("loadDesignModal");
      const designListContainer = document.getElementById("designListContainer");

      // Clear previous list
      designListContainer.innerHTML = "";

      // Populate modal with designs
      designData.userDesigns.forEach((design, index) => {
        const designItem = document.createElement("div");
        designItem.classList.add("load-design-item");

        // Debug preview image URL
        console.log(`Design ${index + 1} preview image:`, design.previewImage);

        // Thumbnail image
        const img = document.createElement("img");
        img.src = design.previewImage ? design.previewImage : "default-preview.png";
        img.alt = design.name || "Design Preview";
        img.classList.add("design-preview"); // Add a class for styling

        // Add a fallback in case the image URL is broken
        img.onerror = function () {
          this.src = "default-preview.png";
        };

        // Design name
        const name = document.createElement("span");
        name.textContent = design.name || "Untitled Design";

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.classList.add("delete-design-btn");
        deleteBtn.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent modal from closing on click
          deleteDesign(userId, index, designItem);
        });

        // Click to load the design
        designItem.addEventListener("click", () => loadSelectedDesign(design));

        // Append elements
        designItem.appendChild(img);
        designItem.appendChild(name);
        designItem.appendChild(deleteBtn);
        designListContainer.appendChild(designItem);
      });

      // Show the modal
      modal.style.display = "flex";
    } else {
      alert("No design document found for this user.");
    }
  } catch (error) {
    console.error("Error loading design from Firestore: ", error);
    alert("Error loading design.");
  }
}

// Function to delete a design
async function deleteDesign(userId, index, designItem) {

  
  alert("Please wait... Deleting design.");


  const designDocRef = doc(db, "designs", userId);
  
  try {
    // Get current data
    const docSnap = await getDoc(designDocRef);
    if (!docSnap.exists()) {
      alert("No design document found.");
      return;
    }

    let designs = docSnap.data().userDesigns;
    designs.splice(index, 1); // Remove selected design

    // Update Firestore
    await updateDoc(designDocRef, { userDesigns: designs });

    // Remove from UI
    designItem.remove();
    alert("Design deleted successfully.");
  } catch (error) {
    console.error("Error deleting design: ", error);
    alert("Failed to delete design.");
  }
}



// Function to load selected design
function loadSelectedDesign(design) {
  // Close the modal
  document.getElementById("loadDesignModal").style.display = "none";

  // Load each canvas from the chosen design's JSON
  window.canvases[0].loadFromJSON(design.canvas1Objects, () => {
    window.canvases[0].renderAll();
  });
  window.canvases[1].loadFromJSON(design.canvas2Objects, () => {
    window.canvases[1].renderAll();
  });
  window.canvases[2].loadFromJSON(design.canvas3Objects, () => {
    window.canvases[2].renderAll();
  });
  window.canvases[3].loadFromJSON(design.canvas4Objects, () => {
    window.canvases[3].renderAll();
  });

  alert("Design loaded successfully.");
}

// Close modal when clicking the "X" button
document.querySelector(".load-design-close-modal").addEventListener("click", () => {
  document.getElementById("loadDesignModal").style.display = "none";
});

// Attach the function to the button
document.getElementById("loadDesignButton").addEventListener("click", loadDesignFromFirestore);



// Function to upload image to Firebase Storage
export async function uploadImage(file) {
  const storageRef = ref(storage, `uploads/${Date.now()}.png`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Function to get processed image
export async function getProcessedImage(imageName) {
  const processedRef = ref(storage, `processed/${imageName}`);
  return await getDownloadURL(processedRef);
}