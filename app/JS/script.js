import { logoutUser } from "./auth.js";

console.log("app loaded");

const body = document.querySelector("body");
const toggle = document.querySelector(".toggle");

const savedMode = localStorage.getItem("mode");

if (savedMode === "dark") {
    body.classList.add("dark");
    toggle.classList.add("active");
}

toggle.addEventListener("click", () => {
    body.classList.toggle("dark");

    const isDark = body.classList.contains("dark");
    localStorage.setItem("mode", isDark ? "dark" : "light");

    toggle.classList.toggle("active");
});

const tabs = document.querySelectorAll("[data-tab-target]");
const tabContents = document.querySelectorAll("[data-tab-content]");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.tabTarget);

        tabContents.forEach(section => section.classList.remove("active"));
        target.classList.add("active");
    });
});

const subMenu = document.getElementById("subMenu");

function toggleMenu() {
    subMenu.classList.toggle("open-menu");
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function getAllMessages() {
    return JSON.parse(localStorage.getItem("messages")) || [];
}

let swiper = null;

function initSwiper() {
    if(typeof Swiper == "undefined") return;
    if (swiper) swiper.destroy(true, true);

    swiper = new Swiper(".message-swiper", {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: false,
        effect: "cards",
        grabCursor: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true
        }
    });
}

function buildSlides(messages) {
    const wrapper = document.querySelector(".swiper-wrapper");

    if (!wrapper) return;

    if (!messages.length) {
        wrapper.innerHTML = `
            <div class="swiper-slide">
                <div class="card cardFront">
                    <div class="card-content">
                        <h3>No messages</h3>
                        <p>Nothing to show here yet.</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    wrapper.innerHTML = messages
        .map(msg => {
            return `
                <div class="swiper-slide">
                    <div class="card">
                        <div class="card-content">
                            <h3>Subject: ${msg.subject}</h3>
                            <p>${msg.body}</p>
                            <small>From: ${msg.from} → To: ${msg.to}</small>
                            <button class="btn-primary">Open Message</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function showInbox() {
    const user = getCurrentUser();
    if (!user) return;

    const messages = getAllMessages();
    const inbox = messages.filter(msg => msg.to === user.id);

    setActiveMenu(0);
    buildSlides(inbox);
    initSwiper();
}

function showOutbox() {
    const user = getCurrentUser();
    if (!user) return;

    const messages = getAllMessages();
    const outbox = messages.filter(msg => msg.from === user.id);

    setActiveMenu(1);
    buildSlides(outbox);
    initSwiper();
}

function setActiveMenu(index) {
    const items = document.querySelectorAll(".menu-item");

    items.forEach(item => item.classList.remove("active"));

    if (items[index]) {
        items[index].classList.add("active");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initSwiper();
    showInbox();
});

window.showNotification = (message, type = "success") => {
    const notif = document.createElement("div");

    notif.textContent = message;
    notif.className = `notification ${type}`;

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 3000);
};
window.toggleMenu = toggleMenu;

//logout functionality
//window.logoutUser = logoutUser;
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
});
