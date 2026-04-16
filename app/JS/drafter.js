function flipCard() {
    document.getElementById('previewBox').classList.toggle('flipped');
}


// =======================
// Preview message
// =======================
function previewMessage() {
    const recipient = document.getElementById('recipient').value.trim();
    const message = document.getElementById('messageInput').value.trim();

    document.getElementById('cardRecipient').textContent =
        recipient || 'Dear Friend,';

    document.getElementById('cardMessage').textContent =
        message || 'Your message will appear here.';

    document.getElementById('previewBox').classList.add('flipped');

    if (typeof showNotification === "function") {
        showNotification("Preview updated", "success");
    }
}


// =======================
// Image upload
// =======================
function handleImageUpload(event) {
    loadImages(Array.from(event.target.files));
    document.getElementById('cardFront').style.backgroundImage = '';
    document.getElementById('imageGrid').style.opacity = '1';

    if (typeof showNotification === "function") {
        showNotification("Images uploaded", "success");
    }
}

function loadImages(files) {
    if (!files.length) return;

    const front = document.getElementById('cardFront');
    const grid = document.getElementById('imageGrid');
    const hint = document.getElementById('uploadHint');

    grid.innerHTML = '';
    const count = Math.min(files.length, 3);
    grid.className = `image-grid count-${count}`;

    for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(files[i]);
        img.alt = `Uploaded image ${i + 1}`;
        grid.appendChild(img);
    }

    hint.style.display = 'none';
    grid.style.display = 'grid';
    front.classList.add('has-images');
    front.onclick = null;
}


// =======================
// Word counter
// =======================
const MAX_WORDS = 300;

function updateWordCount() {
    const text = document.getElementById('messageInput').value.trim();
    const count = text === '' ? 0 : text.split(/\s+/).length;
    const el = document.getElementById('wordCounter');

    el.textContent = `Word Count: ${count} / ${MAX_WORDS}`;
    el.className = 'word-counter';

    if (count >= MAX_WORDS) {
        el.classList.add('at-limit');
    } else if (count >= MAX_WORDS * 0.85) {
        el.classList.add('near-limit');
    }
}


// =======================
// Save message
// =======================
function saveMessage() {
    const recipient = document.getElementById('recipient').value.trim();
    const message = document.getElementById('messageInput').value.trim();

    if (!recipient && !message) {
        if (typeof showNotification === "function") {
            showNotification("Nothing to save", "error");
        }
        return;
    }

    const drafts = JSON.parse(localStorage.getItem("drafts")) || [];

    drafts.push({
        recipient,
        message,
        timestamp: Date.now()
    });

    localStorage.setItem("drafts", JSON.stringify(drafts));

    if (typeof showNotification === "function") {
        showNotification("Message saved successfully", "success");
    }
}


// =======================
// Send message
// =======================
function sendMessage() {
    const user = JSON.parse(localStorage.getItem("user"));

    const recipient = document.getElementById('recipient').value.trim();
    const message = document.getElementById('messageInput').value.trim();

    if (!recipient || !message) {
        if (typeof showNotification === "function") {
            showNotification("Please fill in all fields", "error");
        }
        return;
    }

    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    messages.push({
        from: user ? user.id : "anonymous",
        to: recipient,
        body: message,
        subject: "Postcard Message",
        timestamp: Date.now()
    });

    localStorage.setItem("messages", JSON.stringify(messages));

    if (typeof showNotification === "function") {
        showNotification("Message sent successfully", "success");
    }

    setTimeout(() => {
        window.location.href = "/pages/message_inbox.html";
    }, 800);
}


// =======================
// Sidebar dropdowns
// =======================
document.querySelectorAll('.sidebar li[data-toggle]').forEach(li => {
    li.addEventListener('click', () => {
        const target = document.querySelector(li.dataset.toggle);

        document.querySelectorAll('.sidebar-dropdown').forEach(drop => {
            if (drop !== target) drop.classList.remove('dropdown-open');
        });

        target.classList.toggle('dropdown-open');
    });
});


// =======================
// Templates
// =======================
const templates = [
    // (UNCHANGED — your full template array stays exactly the same)
];

function applyTemplate(index) {
    const t = templates[index];
    const cardBack = document.getElementById('cardBack');
    const recipient = document.getElementById('cardRecipient');
    const body = document.getElementById('cardMessage');

    Object.assign(cardBack.style, t.cardBack);
    Object.assign(recipient.style, t.recipient);
    Object.assign(body.style, t.body);
}


// =======================
// Stickers
// =======================
function addSticker(src) {
    const isFlipped = document.getElementById('previewBox').classList.contains('flipped');
    const target = isFlipped
        ? document.getElementById('cardBack')
        : document.getElementById('cardFront');

    const sticker = document.createElement('img');
    sticker.src = src;
    sticker.className = 'sticker';

    sticker.style.left = '40%';
    sticker.style.top = '35%';

    target.appendChild(sticker);
    makeDraggable(sticker, target);
}

function makeDraggable(el, bounds) {
    let isDragging = false;
    let startMouseX, startMouseY, startLeft, startTop;

    el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;

        startMouseX = e.clientX;
        startMouseY = e.clientY;

        startLeft = parseInt(el.style.left) || 0;
        startTop = parseInt(el.style.top) || 0;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;

        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;

        const maxLeft = bounds.offsetWidth - el.offsetWidth;
        const maxTop = bounds.offsetHeight - el.offsetHeight;

        const newLeft = Math.max(0, Math.min(startLeft + dx, maxLeft));
        const newTop = Math.max(0, Math.min(startTop + dy, maxTop));

        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}


// =======================
// Backgrounds
// =======================
function applyBackground(src) {
    const front = document.getElementById('cardFront');
    const imageGrid = document.getElementById('imageGrid');
    const uploadHint = document.getElementById('uploadHint');

    front.style.backgroundImage = `url('${src}')`;
    front.style.backgroundSize = 'cover';
    front.style.backgroundPosition = 'center';

    uploadHint.style.display = 'none';

    if (imageGrid.style.display !== 'none') {
        imageGrid.style.opacity = '0.75';
    }
}
