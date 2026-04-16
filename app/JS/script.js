console.log('HELLO');

// =======================
// 🌙 LIGHT + DARK MODE
// =======================
const body = document.querySelector("body");
const toggle = document.querySelector(".toggle");

let getMode = localStorage.getItem("mode");

if (getMode && getMode === "dark") {
    body.classList.add("dark");
    toggle.classList.add("active");
}

toggle.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (!body.classList.contains("dark")) {
        localStorage.setItem("mode", "light");
    } else {
        localStorage.setItem("mode", "dark");
    }

    toggle.classList.toggle("active");
});

// =======================
// 📑 TABS
// =======================
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget);

        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active');
        });

        target.classList.add('active');
    });
});

// =======================
// 👤 PROFILE MENU
// =======================
let subMenu = document.getElementById("subMenu");

function toggleMenu() {
    subMenu.classList.toggle("open-menu");
}

// =======================
// 📢 NOTIFICATION HELPER (GLOBAL)
// =======================
function showNotification(message, type = "success") {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // If you later have a UI toast system, it will hook here
    const event = new CustomEvent("notify", {
        detail: { message, type }
    });

    window.dispatchEvent(event);
}

// expose globally so other files can use it
window.showNotification = showNotification;

// =======================
// 🚪 LOGOUT SYSTEM (NEW)
// =======================
function logoutUser() {
    try {
        // clear local storage data
        localStorage.removeItem("user");
        localStorage.removeItem("mode");
        localStorage.removeItem("messages");
        localStorage.removeItem("userProfile");

        // firebase safe logout (if exists)
        if (window.firebaseAuth && typeof window.firebaseAuth.signOut === "function") {
            window.firebaseAuth.signOut();
        }

        showNotification("Logged out successfully", "success");

        console.log("User logged out");

        setTimeout(() => {
            window.location.href = "/pages/sign-in.html";
        }, 800);

    } catch (error) {
        console.error("Logout failed:", error);
        showNotification("Logout failed", "error");
    }
}

// expose globally so HTML can call it
window.logoutUser = logoutUser;
