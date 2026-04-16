
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
    document.getElementById('cardFront').style.backgroundImage = '';
    document.getElementById('imageGrid').style.opacity = '1';
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
      background: "var(--sky-blue)",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Georgia', serif",
      fontSize: "1.1rem",
      color: "var(--pure-white)",
      fontStyle: "italic",
      textTransform: "capitalize",
      textShadow: "1px 1px 3px rgba(9,47,51,0.25)"  // deep-sea tint
    },
    body: {
      fontFamily: "'Georgia', serif",
      fontSize: "1rem",
      color: "var(--pure-white)",
      lineHeight: "1.8",
      textShadow: "none"
    }
  },
  {
    name: "Modern",
    cardBack: {
      background: "var(--pure-white)",
      padding: "2rem"
    },
    recipient: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: "1.2rem",
      color: "var(--deep-sea)",
      fontStyle: "normal",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      textShadow: "none"
    },
    body: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: "1rem",
      color: "var(--pure-black)",
      lineHeight: "1.6",
      textShadow: "none"
    }
  },
  {
    name: "Vintage",
    cardBack: {
      background: "var(--parchement-paper)",
      padding: "2.5rem"
    },
    recipient: {
      fontFamily: "'Courier New', monospace",
      fontSize: "1rem",
      color: "var(--terracotta)",
      fontStyle: "normal",
      textTransform: "capitalize",
      textShadow: "1px 1px 0px rgba(175,80,49,0.3)"  // terracotta tint
    },
    body: {
      fontFamily: "'Courier New', monospace",
      fontSize: "0.9rem",
      color: "var(--deep-sea)",
      lineHeight: "1.7",
      textShadow: "none"
    }
  },
  {
    name: "Techno",
    cardBack: {
      background: "var(--pure-black)",
      padding: "2rem"
    },
    recipient: {
      fontFamily: "'Courier New', monospace",
      fontSize: "1rem",
      color: "var(--sky-blue)",
      fontStyle: "normal",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      textShadow: "0 0 8px var(--sky-blue), 0 0 20px rgba(127,199,204,0.4)"  // sky-blue glow
    },
    body: {
      fontFamily: "'Courier New', monospace",
      fontSize: "0.85rem",
      color: "var(--default-gray)",
      lineHeight: "1.7",
      letterSpacing: "0.03em",
      textShadow: "none"
    }
  },
  {
    name: "Icy",
    cardBack: {
      background: "linear-gradient(135deg, #dff4f7 0%, var(--pure-white) 50%, #e8f6fa 100%)",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Palatino Linotype', Palatino, serif",
      fontSize: "1.1rem",
      color: "var(--sky-blue)",
      fontStyle: "italic",
      textTransform: "capitalize",
      textShadow: "0 1px 4px rgba(127,199,204,0.6), 0 0 12px rgba(127,199,204,0.2)"  // sky-blue frost
    },
    body: {
      fontFamily: "'Palatino Linotype', Palatino, serif",
      fontSize: "1rem",
      color: "var(--deep-sea)",
      lineHeight: "1.8",
      textShadow: "none"
    }
  },
  {
    name: "Lovebug",
    cardBack: {
      background: "#fdf0f0",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
      fontSize: "1.4rem",
      color: "var(--red-wine)",
      fontStyle: "normal",
      textTransform: "capitalize",
      textShadow: "1px 2px 6px rgba(152,2,4,0.2)"  // red-wine blush
    },
    body: {
      fontFamily: "'Georgia', serif",
      fontSize: "1rem",
      color: "var(--terracotta)",
      lineHeight: "1.8",
      textShadow: "none"
    }
  },
  {
    name: "Earthy",
    cardBack: {
      background: "var(--parchement-paper)",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Trebuchet MS', sans-serif",
      fontSize: "1.1rem",
      color: "var(--moss-green)",
      fontStyle: "normal",
      textTransform: "capitalize",
      textShadow: "1px 1px 0px rgba(2,99,58,0.2)"  // moss-green pressed
    },
    body: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: "1rem",
      color: "var(--terracotta)",
      lineHeight: "1.75",
      textShadow: "none"
    }
  },
  {
    name: "Pride",
    cardBack: {
      background: "linear-gradient(135deg, var(--red-wine), var(--terracotta), var(--sunshine-yellow), var(--moss-green), var(--sky-blue), var(--cherrry-blossom))",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Impact', 'Arial Black', sans-serif",
      fontSize: "1.2rem",
      color: "var(--pure-white)",
      fontStyle: "normal",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      textShadow: "2px 2px 0px rgba(9,47,51,0.4), 0 0 12px rgba(255,255,255,0.3)"  // deep-sea hard drop + white glow
    },
    body: {
      fontFamily: "'Figtree', sans-serif",
      fontSize: "1rem",
      color: "var(--pure-white)",
      lineHeight: "1.7",
      textShadow: "0 1px 3px rgba(9,47,51,0.3)"  // deep-sea soft
    }
  },
  {
    name: "Cotton Candy",
    cardBack: {
      background: "linear-gradient(135deg, var(--cherrry-blossom) 0%, #c8e6ff 50%, var(--light-green) 100%)",
      padding: "2rem 2.5rem"
    },
    recipient: {
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
      fontSize: "1.1rem",
      color: "var(--deep-sea)",
      fontStyle: "normal",
      textTransform: "capitalize",
      textShadow: "1px 1px 4px rgba(253,171,165,0.6), 0 0 10px rgba(199,217,160,0.4)"  // cherry-blossom + light-green pastel glow
    },
    body: {
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
      fontSize: "0.95rem",
      color: "var(--deep-sea)",
      lineHeight: "1.8",
      textShadow: "none"
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


//adding sticker elements to the postcards
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

    // Where the sticker started (parseInt strips 'px')
    startLeft = parseInt(el.style.left) || 0;
    startTop = parseInt(el.style.top) || 0;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;

    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;

    // within bounds so sticker can't leave the card
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


//background function 
function applyBackground(src) {
  const front = document.getElementById('cardFront');
  const imageGrid = document.getElementById('imageGrid');
  const uploadHint = document.getElementById('uploadHint');

  // Apply the background image to the card front
  front.style.backgroundImage = `url('${src}')`;
  front.style.backgroundSize = 'cover';
  front.style.backgroundPosition = 'center';

  // Hide the upload hint since we now have a background
  uploadHint.style.display = 'none';

  // If there's an image grid showing, keep it but make it
  // slightly transparent so the background shows through
  if (imageGrid.style.display !== 'none') {
    imageGrid.style.opacity = '0.75';
  }
}


//dropdowns for the templates stuff

document.querySelectorAll('.sidebar li[data-toggle]').forEach(li => {
  li.addEventListener('click', () => {
    const target = document.querySelector(li.dataset.toggle);
    const isOpen = target.classList.toggle('dropdown-open');
    
    //gets for all the .sidebardropdown ones thorugh the data toggle + id
    document.querySelectorAll('.sidebar-dropdown').forEach(d => {
      if (d !== target) d.classList.remove('dropdown-open');
    });
  });
});
