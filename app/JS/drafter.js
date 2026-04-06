
function flipCard() { //flips card
    document.getElementById('previewBox').classList.toggle('flipped');
}

function previewMessage() {
    const recipient = document.getElementById('recipient').value.trim();
    const message   = document.getElementById('messageInput').value.trim();

    document.getElementById('cardRecipient').textContent =
    recipient || 'Dear Friend,';
    document.getElementById('cardMessage').textContent =
    message || 'Your message will appear here.';

    // flip to show back
    const card = document.getElementById('previewBox');
    card.classList.add('flipped');
}

//uploads for the images
function handleImageUpload(event) {
    loadImages(Array.from(event.target.files));
}
function loadImages(files) {
    if (!files.length) return;
    const front = document.getElementById('cardFront');
    const grid  = document.getElementById('imageGrid');
    const hint  = document.getElementById('uploadHint');

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
    front.onclick = null; // don't re-open picker if images present
}

const MAX_WORDS = 300;

function updateWordCount() {
    const text  = document.getElementById('messageInput').value.trim();
    const count = text === '' ? 0 : text.split(/\s+/).length;
    const el    = document.getElementById('wordCounter');

    el.textContent = `Word Count: ${count} / ${MAX_WORDS}`;
    el.className   = 'word-counter';

    if (count >= MAX_WORDS) {
        el.classList.add('at-limit');
    } 
    else if (count >= MAX_WORDS * 0.85) {
        el.classList.add('near-limit');
    }
}

/* Save */
function saveMessage() {
// add later
}

/* Send */
function sendMessage() {
// add laterrrr
}

document.querySelectorAll('.sidebar li[data-toggle]').forEach(li => {
  li.addEventListener('click', () => {
    const targetId = li.getAttribute('data-toggle');
    const target = document.getElementById(targetId);

    document.querySelectorAll('.sidebar-dropdown').forEach(drop => {
      if (drop !== target) drop.classList.remove('dropdown-open');
    });

    target.classList.toggle('dropdown-open');
  });
});


const templates = [
  {
    name: "Classic",
    cardBack: {
      background: "#fffdf5",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Georgia', serif",
      fontSize: "1.1rem",
      color: "#2c2c2c",
      fontStyle: "italic"
    },
    body: {
      fontFamily: "'Georgia', serif",
      fontSize: "1rem",
      color: "#2c2c2c",
      lineHeight: "1.8"
    }
  },
  {
    name: "Modern",
    cardBack: {
      background: "#f0f4ff",
      padding: "2rem"
    },
    recipient: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: "1.2rem",
      color: "#1a1a2e",
      fontStyle: "normal"
    },
    body: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: "1rem",
      color: "#1a1a2e",
      lineHeight: "1.6"
    }
  },
  {
    name: "Vintage",
    cardBack: {
      background: "#fdf3e3",
      padding: "2.5rem"
    },
    recipient: {
      fontFamily: "'Courier New', monospace",
      fontSize: "1rem",
      color: "#5c4033",
      fontStyle: "normal"
    },
    body: {
      fontFamily: "'Courier New', monospace",
      fontSize: "0.9rem",
      color: "#5c4033",
      lineHeight: "1.7"
    }
  }
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
