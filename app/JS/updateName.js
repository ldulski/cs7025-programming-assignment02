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

      //load name
      document.getElementById("username").innerText = data.name || "not set";

      //load pronouns
      document.getElementById("user-pronouns").innerText = data.pronouns || "not set";

      //load bio
      document.getElementById("user-bio").innerText = data.bio || "not set";

      console.log("Loaded data:", data);

    } else {
      console.log("No user document found");
    }

  } catch (error) {
    console.error("Error fetching user:", error);
  }

});