import { auth, db } from "/app/JS/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    console.log("No user logged in");
    return;
  }

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const name = data.name || "Anonymous";

      document.getElementById("username").innerText = name;

      console.log("Loaded name:", name);

    } else {
      console.log("No user document found");
    }

  } catch (error) {
    console.error("Error fetching user:", error);
  }

});