
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