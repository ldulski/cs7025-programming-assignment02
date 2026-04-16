import { auth, db } from "/app/JS/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// safe notification helper (works even if script.js not loaded yet)
function notify(message, type = "success") {
  if (typeof window.showNotification === "function") {
    window.showNotification(message, type);
  } else {
    console.log(message);
  }
}

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    console.log("No user logged in");
    notify("No user logged in", "error");
    return;
  }

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("No user document found");
      notify("User profile not found", "error");
      return;
    }

    const data = docSnap.data();

    // =========================
    // Load user profile data
    // =========================
    document.getElementById("username").innerText = data.name || "not set";

    const pronounsEl = document.getElementById("user-pronouns");
    if (pronounsEl) pronounsEl.innerText = data.pronouns || "not set";

    const bioEl = document.getElementById("user-bio");
    if (bioEl) bioEl.innerText = data.bio || "not set";

    console.log("Loaded data:", data);

    notify("Profile loaded successfully", "success");

  } catch (error) {
    console.error("Error fetching user:", error);
    notify("Failed to load profile", "error");
  }

});
