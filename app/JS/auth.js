import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

export async function logoutUser() {
    const confirmed = confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    try {
        await signOut(auth);
        window.location.href = "/pages/index.html";
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Failed to log out");
    }
}