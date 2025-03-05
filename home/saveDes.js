
 // Import Firebase SDKs
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
 import {
   getAuth,
 } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
 import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

 
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

 const saveButton = document.getElementById("saveDesign");
 

 console.log("Current user:", auth.currentUser);


 
 saveButton.addEventListener('click', async function() {


    // Retrieve the designs from localStorage using the last saved design ID
    const lastSavedDesignId = localStorage.getItem('lastSavedDesignId');
    if (!lastSavedDesignId) {
      alert('No design found in localStorage!');
      return;
    }
  
      // Retrieve the saved design data from localStorage using the lastSavedDesignId.
  const savedDesignData = localStorage.getItem(lastSavedDesignId);
  if (!savedDesignData) {
    alert('No design data found in localStorage!');
    return;
  }


    // Parse the design data from JSON
    const designData = JSON.parse(savedDesignData);

      // Now use designData for your Firestore operations.
  console.log("Design Data:", designData);
  
    // Prompt the user to enter a name for the design
    const designName = prompt('Enter a name for your design:');
    if (!designName) {
      alert('Design name is required!');
      return;
    }
  
    // Log the design data for debugging
    console.log('Design Data to Save:', designData);
  
    // Get the user ID from localStorage
    const userId = localStorage.getItem("loggedInUserId");
  
    if (!userId) {
      alert("Please log in to save your design.");
      return;
    }
  
    // Format the design data to save to Firestore
    const firestoreDesignData = {
      name: designName,
      canvas1Objects: designData.canvas1, // Objects for canvas 1
      canvas2Objects: designData.canvas2, // Objects for canvas 2
      canvas3Objects: designData.canvas3, // Objects for canvas 3
      canvas4Objects: designData.canvas4, // Objects for canvas 4
    };
  
    try {
      // Save the design to Firestore under the user's ID
      const docRef = doc(db, "designs", userId); // Access the user's design document
  
      // Add the new design to the user's "userDesigns" collection in Firestore
      await updateDoc(docRef, {
        userDesigns: arrayUnion(firestoreDesignData), // Add the design object to an array
      });
  
      alert("Design saved successfully to Firestore!");
    } catch (error) {
      console.error("Error saving design to Firestore: ", error);
      alert("There was an error saving your design.");
    }
  });



  
// Function to load a design from Firestore and update the canvases.
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
      
      // Build a list of saved design names with their indexes.
      const designList = designData.userDesigns
        .map((design, index) => `${index}: ${design.name}`)
        .join("\n");
      
      // Prompt user to select which design to load.
      const selectedIndex = prompt(`Enter the index of the design to load:\n${designList}`);
      if (selectedIndex === null || selectedIndex.trim() === "") {
        return; // Cancelled.
      }
      
      const index = parseInt(selectedIndex, 10); // Use base 10.
      if (isNaN(index) || index < 0 || index >= designData.userDesigns.length) {
        alert("Invalid design selection.");
        return;
      }
      
      const chosenDesign = designData.userDesigns[index];
      
      // Now load each canvas from the chosen design's JSON.
      // Make sure that the keys below match how you saved your design.
      window.canvases[0].loadFromJSON(chosenDesign.canvas1Objects, () => {
        window.canvases[0].renderAll();
      });
      window.canvases[1].loadFromJSON(chosenDesign.canvas2Objects, () => {
        window.canvases[1].renderAll();
      });
      window.canvases[2].loadFromJSON(chosenDesign.canvas3Objects, () => {
        window.canvases[2].renderAll();
      });
      window.canvases[3].loadFromJSON(chosenDesign.canvas4Objects, () => {
        window.canvases[3].renderAll();
      });
      
      alert("Design loaded successfully.");
    } else {
      alert("No design document found for this user.");
    }
  } catch (error) {
    console.error("Error loading design from Firestore: ", error);
    alert("Error loading design.");
  }
}


// Attach this function to a "Load Design" button on your page.
document.getElementById("loadDesignButton").addEventListener("click", loadDesignFromFirestore);