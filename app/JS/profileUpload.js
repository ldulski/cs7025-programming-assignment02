import { auth, db } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// safe notification helper
function notify(message, type = "success") {
    if (typeof window.showNotification === "function") {
        window.showNotification(message, type);
    } else {
        console.log(message);
    }
}

onAuthStateChanged(auth, (user) => {

    if (!user) {
        console.log("No user logged in");
        notify("You must be logged in to update profile", "error");
        return;
    }

    console.log("User ready:", user.uid);

    const form = document.getElementById("profileForm");
    const imageUpload = document.getElementById("imageUpload");
    const profileImage = document.getElementById("profileImage");

    if (!form || !imageUpload || !profileImage) {
        console.error("Missing profile elements in DOM");
        notify("Profile form not loaded correctly", "error");
        return;
    }

    let selectedFile = null;

    // =========================
    // click image to upload
    // =========================
    profileImage.addEventListener("click", () => {
        imageUpload.click();
    });

    // =========================
    // preview image
    // =========================
    imageUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        selectedFile = file;

        profileImage.src = URL.createObjectURL(file);
        notify("Image selected", "success");
    });

    // =========================
    // save profile
    // =========================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pronouns = document.getElementById("pronouns")?.value.trim() || "";
        const bio = document.getElementById("bio")?.value.trim() || "";

        try {

            let imageURL = null;

            // =========================
            // upload image if selected
            // =========================
            if (selectedFile) {
                const storageRef = ref(
                    auth.app._storage, 
                    `profile_images/${user.uid}/profile.jpg`
                );

                await uploadBytes(storageRef, selectedFile);
                imageURL = await getDownloadURL(storageRef);
            }

            // =========================
            // save Firestore data
            // =========================
            await setDoc(doc(db, "users", user.uid), {
                pronouns,
                bio,
                ...(imageURL && { profileImage: imageURL })
            }, { merge: true });

            notify("Profile updated successfully", "success");

            // redirect after short delay (so user sees message)
            setTimeout(() => {
                window.location.href = "/pages/account_external.html";
            }, 800);

        } catch (error) {
            console.error("Error saving profile:", error);
            notify("Failed to update profile", "error");
        }
    });

});
