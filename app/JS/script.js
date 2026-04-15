console.log('HELLO')

//light + dark mode toggle
const body = document.querySelector("body");
toggle = document.querySelector(".toggle");

//setting what color mode it's in
let getMode = localStorage.getItem("mode");
console.log(getMode);
if (getMode && getMode === "dark") {
    body.classList.toggle("dark");
    toggle.classList.toggle("active")
}

//toggling light vs dark mode
toggle.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (!body.classList.contains("dark")) {
        return localStorage.setItem("mode", "light");
    }
    localStorage.setItem("mode", "dark");
})

// activating toggle on click
toggle.addEventListener("click", () => toggle.classList.toggle("active"));




//tab script
const tabs = document.querySelectorAll('[data-tab-target')
const tabContents = document.querySelectorAll('[data-tab-content]')

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget)
        tabContents.forEach(tabContent => {
            tabContent.classList.remove('active')
        })
        target.classList.add('active');
    })
})

//profile in nav opening sub-menu 
let subMenu = document.getElementById("subMenu");

function toggleMenu(){
    subMenu.classList.toggle("open-menu");
}

//swiper js for messages

// Templates

//Hook up to message content
  const inboxSlides = [
    { subject: "Inbox", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { subject: "Inbox", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { subject: "Inbox", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { subject: "Inbox", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ];

  const outboxSlides = [
    { subject: "Outbox", body: "Outbox message this is a sent item. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." },
    { subject: "Outboxg", body: "Outbox message this is a sent item. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." },
    { subject: "Outbox", body: "Outbox message  this is a sent item. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." },
    { subject: "Outbox", body: "Outbox message  this is a sent item. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt." },
  ];

  const cardClasses = ['cardBack-3', 'cardBack-2', 'cardBack-1', 'cardFront'];

  let swiper = null;

  function initSwiper() {
    if (swiper) swiper.destroy(true, true);
    swiper = new Swiper('.message-swiper', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: false, // for the order, can look at this again later if we wanna change
      effect: 'cards', 
      grabCursor: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  function buildSlides(data) {
    const wrapper = document.querySelector('.swiper-wrapper');
    wrapper.innerHTML = data.map((msg, i) => `
      <div class="swiper-slide">
        <div class="card ${cardClasses[i] || ''}">
          <div class="card-content">
            <h3>Subject: ${msg.subject}</h3>
            <p>${msg.body}</p>
            <button class="btn-primary">Open Message</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function showInbox() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.menu-item:first-child').classList.add('active');
    buildSlides(inboxSlides);
    initSwiper();
  }

  function showOutbox() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelector('.menu-item:last-child').classList.add('active');
    buildSlides(outboxSlides);
    initSwiper();
  }

  // Initialize with inbox on page load
  initSwiper();