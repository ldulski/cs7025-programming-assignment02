//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
//import { getFirestore } from "firebase/firestore";
//import { getAuth } from "firebase/auth";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
//import { getStorage } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNQvib46jRfLKbgOiabi-Z515nOTEhaLI",
    authDomain: "cs7025-programming-postd.firebaseapp.com",
    projectId: "cs7025-programming-postd",
    storageBucket: "cs7025-programming-postd.firebasestorage.app",
    messagingSenderId: "951492731667",
    appId: "1:951492731667:web:e59f0d35421846c406b0e6",
    measurementId: "G-WK1FE767GN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
//Authentication
export const auth = getAuth(app);
//database
export const db = getFirestore(app);
//export const storage = getStorage(app);
console.log("firebase initialized",auth);