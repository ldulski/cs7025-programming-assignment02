import { auth } from "./firebase.js";
import { apiFetch, toQuery } from "./api.js";
import { syncCurrentUser } from "./userSync.js";

let currentTab = "inbox";

function postcardPreview(payload = {}) {
  const background = payload.background ? `style="background-image:url('${payload.background}');background-size:cover;background-position:center;"` : "";
  const image = payload.images?.[0] ? `<img src="${payload.images[0]}" alt="Postcard image" style="width:100%;border-radius:16px;margin-top:12px;">` : "";

  return `
    <div class="card cardFront" ${background}>
      <div class="card-content">
        <h3>${payload.template || "Postcard"}</h3>
        ${image}
      </div>
    </div>
  `;
}

function messageSlide(message, tab) {
  const payload = message.payload || {};
  const personName = tab === "inbox" ? message.senderName : message.recipientName;
  const line = tab === "inbox" ? `From: ${personName}` : `To: ${personName}`;
  const replyUrl = `/pages/message_drafter.html?to=${encodeURIComponent(tab === "inbox" ? message.senderUid : message.recipientUid)}&name=${encodeURIComponent(personName || "")}&email=${encodeURIComponent(tab === "inbox" ? message.senderEmail || "" : message.recipientEmail || "")}`;
  const chatUrl = `/pages/chat.html?uid=${encodeURIComponent(tab === "inbox" ? message.senderUid : message.recipientUid)}&name=${encodeURIComponent(personName || "")}&email=${encodeURIComponent(tab === "inbox" ? message.senderEmail || "" : message.recipientEmail || "")}`;

  return `
    <div class="swiper-slide">
      <div class="card cardBack-1">
        <div class="card-content">
          <h3>${message.subject || "Postcard Message"}</h3>
          <p>${message.body}</p>
          <small>${line}</small>
          <small>${new Date(message.createdAt).toLocaleString()}</small>
          <div class="like-save" style="margin-top:12px;">
            <button class="btn-secondary" onclick="toggleMessageLike(${message.id})">
              ${message.likedByMe ? "Unlike" : "Like"} (${message.likeCount})
            </button>
            <a class="btn-secondary" href="${chatUrl}">Open Chat</a>
            <a class="btn-secondary" href="${replyUrl}">Reply</a>
          </div>
          ${message.messageType === "postcard" ? postcardPreview(payload) : ""}
        </div>
      </div>
    </div>
  `;
}

function renderMessages(messages) {
  const wrapper = document.querySelector(".swiper-wrapper");

  if (!wrapper) {
    return;
  }

  if (!messages.length) {
    wrapper.innerHTML = `
      <div class="swiper-slide">
        <div class="card cardFront">
          <div class="card-content">
            <h3>No messages</h3>
            <p>Your ${currentTab} is empty.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  wrapper.innerHTML = messages.map((message) => messageSlide(message, currentTab)).join("");
}

function initSwiper() {
  if (!window.Swiper) {
    return;
  }

  if (window.postdSwiper) {
    window.postdSwiper.destroy(true, true);
  }

  window.postdSwiper = new window.Swiper(".message-swiper", {
    slidesPerView: 1,
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

async function loadMessages(tab) {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  currentTab = tab;

  document.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"));
  document.querySelector(`.menu-item[data-tab="${tab}"]`)?.classList.add("active");

  const messages = await apiFetch(`/api/messages/${tab}${toQuery({ uid: user.uid })}`);
  renderMessages(messages);
  initSwiper();
}

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    return;
  }

  try {
    await syncCurrentUser();
    await loadMessages("inbox");
  } catch (error) {
    window.showNotification?.(error.message, "error");
  }
});

window.showInbox = () => loadMessages("inbox");
window.showOutbox = () => loadMessages("outbox");

window.toggleMessageLike = async (messageId) => {
  try {
    await apiFetch(`/api/messages/${messageId}/like`, {
      method: "POST"
    });
    await loadMessages(currentTab);
  } catch (error) {
    window.showNotification?.(error.message, "error");
  }
};
