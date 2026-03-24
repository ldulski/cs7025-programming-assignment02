console.log("Signup script");
import { auth } from "./firebase.js";
//import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

document.getElementById("signupBtn").addEventListener("click", async() => {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if(!name || !email || !password){
        alert("Please fill all fields");
        return;
    }

    if(!document.getElementById("terms").checked){
        alert("You must agree to the terms and conditions");
        return;
    }

    if(!email.endsWith('@tcd.ie')){
        alert('You must use a TCD email.');
        return;
    }

    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Signed up", user.uid);

        //move to set up quiz page
        window.location.href = "/pages/setup_quiz.html";
    } catch (error){
        console.error(error);
        alert(error.message);
    }
});