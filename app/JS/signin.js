import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

document.getElementById("signinBtn").addEventListener("click", async () =>{
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if(!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Logged in", user.uid);

        //MOVE TO BULLETIN BOARD PAGE????
        window.location.href = "/pages/bulletinboard.html";
    } catch (error){
        console.error(error);
        alert(error.message);
    }
});