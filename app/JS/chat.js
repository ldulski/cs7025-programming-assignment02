import { auth } from "./firebase.js";
import { apiFetch, toQuery } from "./api.js";
import { syncCurrentUser } from "./userSync.js";

let currentUser = null;
let currentContact = null;
let socket = null;
let contactsCache = [];

function queryValue(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setHeader(contact) {
  const title = document.getElementById("chatTitle");
  const meta = document.getElementById("chatMeta");
  const input = document.getElementById("chatMessage");
  const button = document.getElementById("chatSend");

  if (!contact) {
    title.textContent = "Choose a pen pal";
    meta.textContent = "Open chat from Bulletin Board, Activity, or Inbox.";
    input.disabled = true;
    button.disabled = true;
    return;
  }

  title.textContent = contact.name || "Pen pal";
  meta.textContent = contact.colorGroup
    ? `${contact.colorGroup} group · ${contact.email || ""}`
    : contact.email || "Live chat";
  input.disabled = false;
  button.disabled = false;
}

function renderContacts() {
  const root = document.getElementById("chatContacts");

  if (!root) {
    return;
  }

  if (!contactsCache.length) {
    root.innerHTML = "<p class='small-text'>No saved matches or chats yet.</p>";
    return;
  }

  root.innerHTML = contactsCache.map((contact) => `
    <button class="chat-contact ${contact.firebaseUid === currentContact?.firebaseUid ? "active" : ""}" data-uid="${contact.firebaseUid}">
      <strong>${escapeHtml(contact.name || "Postd user")}</strong>
      <span>${escapeHtml(contact.email || "")}</span>
    </button>
  `).join("");

  root.querySelectorAll(".chat-contact").forEach((button) => {
    button.addEventListener("click", async () => {
      const contact = contactsCache.find((item) => item.firebaseUid === button.dataset.uid);

      if (!contact) {
        return;
      }

      currentContact = contact;
      setHeader(contact);
      renderContacts();
      history.replaceState({}, "", `/pages/chat.html?uid=${encodeURIComponent(contact.firebaseUid)}&name=${encodeURIComponent(contact.name || "")}&email=${encodeURIComponent(contact.email || "")}`);
      await loadThread();
    });
  });
}

function renderThread(messages) {
  const root = document.getElementById("chatThread");

  if (!root) {
    return;
  }

  if (!messages.length) {
    root.innerHTML = "<p class='small-text'>No chat messages yet. Start the conversation.</p>";
    return;
  }

  root.innerHTML = messages.map((message) => {
    const mine = message.senderUid === currentUser.uid;

    return `
      <article class="chat-bubble ${mine ? "mine" : "theirs"}">
        <div class="chat-bubble-inner">
          <strong>${escapeHtml(mine ? "You" : message.senderName || "Pen pal")}</strong>
          <p>${escapeHtml(message.body || "")}</p>
          <small>${new Date(message.createdAt).toLocaleString()}</small>
        </div>
      </article>
    `;
  }).join("");

  root.scrollTop = root.scrollHeight;
}

async function loadThread() {
  if (!currentContact) {
    renderThread([]);
    return;
  }

  const messages = await apiFetch(`/api/chat/thread${toQuery({
    uid: currentUser.uid,
    targetUid: currentContact.firebaseUid
  })}`);

  renderThread(messages);
}

function openSocket() {
  if (!currentUser || socket) {
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = `${protocol}//${window.location.host}/ws?uid=${encodeURIComponent(currentUser.uid)}&email=${encodeURIComponent(currentUser.email || "")}&name=${encodeURIComponent(currentUser.name || "Postd user")}`;

  socket = new WebSocket(url);

  socket.addEventListener("message", async (event) => {
    const payload = JSON.parse(event.data);

    if (payload.type === "socket.error") {
      window.showNotification?.(payload.error, "error");
      return;
    }

    if (payload.type !== "chat.message") {
      return;
    }

    const message = payload.message;
    const participants = [message.senderUid, message.recipientUid];

    if (!participants.includes(currentUser.uid)) {
      return;
    }

    if (currentContact && participants.includes(currentContact.firebaseUid)) {
      await loadThread();
      return;
    }

    window.showNotification?.(`New message from ${message.senderName || "a pen pal"}.`);
  });

  socket.addEventListener("close", () => {
    socket = null;
    setTimeout(() => {
      if (currentUser) {
        openSocket();
      }
    }, 1200);
  });
}

async function sendChat(event) {
  event.preventDefault();

  if (!currentContact) {
    return;
  }

  const input = document.getElementById("chatMessage");
  const body = input.value.trim();

  if (!body) {
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: "chat.send",
      recipientUid: currentContact.firebaseUid,
      recipientEmail: currentContact.email,
      recipientName: currentContact.name,
      body
    }));
  } else {
    await apiFetch("/api/chat/messages", {
      method: "POST",
      body: {
        senderUid: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.name,
        recipientUid: currentContact.firebaseUid,
        recipientEmail: currentContact.email,
        recipientName: currentContact.name,
        body
      }
    });
    await loadThread();
  }

  input.value = "";
}

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "/pages/sign-in.html";
    return;
  }

  try {
    const synced = await syncCurrentUser();
    currentUser = {
      uid: user.uid,
      email: synced.email,
      name: synced.name
    };

    contactsCache = await apiFetch(`/api/chat/contacts${toQuery({ uid: user.uid })}`);

    const queryUid = queryValue("uid");
    const queryName = queryValue("name");
    const queryEmail = queryValue("email");

    currentContact = contactsCache.find((contact) => contact.firebaseUid === queryUid) || null;

    if (!currentContact && queryUid) {
      currentContact = {
        firebaseUid: queryUid,
        name: queryName || "Pen pal",
        email: queryEmail
      };
      contactsCache = [currentContact, ...contactsCache.filter((contact) => contact.firebaseUid !== queryUid)];
    }

    if (!currentContact && contactsCache.length) {
      currentContact = contactsCache[0];
    }

    setHeader(currentContact);
    renderContacts();
    await loadThread();
    openSocket();
  } catch (error) {
    window.showNotification?.(error.message, "error");
  }
});

document.getElementById("chatComposer")?.addEventListener("submit", sendChat);
