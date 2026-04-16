import { auth, db } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

    if (!user) {
        console.log("No user logged in");
        return;
    }

    console.log("User ready:", user.uid);

    const form = document.getElementById("profileForm");
    const imageUpload = document.getElementById("imageUpload");
    const profileImage = document.getElementById("profileImage");

    //upload image
    profileImage.addEventListener("click", () => {
        imageUpload.click();
    });

    //preview the image
    imageUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        profileImage.src = URL.createObjectURL(file);
    });

    //save info to firebase
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const pronouns = document.getElementById("pronouns").value.trim();
        const bio = document.getElementById("bio").value.trim();

        try {
            // Upload image
            /*if (file) {
                const storageRef = ref(storage, `profile_images/${user.uid}/profile.jpg`);

                await uploadBytes(storageRef, file);

                imageURL = await getDownloadURL(storageRef);
            }*/

            //save bio and pronouns
            await setDoc(doc(db, "users", user.uid), {
                pronouns: pronouns,
                bio: bio,
                //profileImage: imageURL
            }, { merge: true });

            alert("Profile saved!");
            window.location.href = "/pages/account_external.html";

        } catch (error) {
            console.error("Error saving profile:", error);
        }
    });

});



