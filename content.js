// GifDict — Content Script
// Double-click a word → show GIF + definition tooltip

(function () {
  "use strict";

  const GIPHY_API_URL = "https://api.giphy.com/v1/gifs/search";
  const DICT_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
  const MIN_WORD_LENGTH = 3;

  let tooltip = null;
  let giphyApiKey = "";

  // Load API key from storage
  chrome.storage.sync.get(["giphyApiKey", "enabled"], (result) => {
    giphyApiKey = result.giphyApiKey || "";
    if (result.enabled === false) return; // extension disabled
    document.addEventListener("dblclick", onDoubleClick);
    document.addEventListener("click", dismissTooltip);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dismissTooltip();
    });
  });

  // --- Word Detection ---
  function getSelectedWord() {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text || text.includes(" ") || text.length < MIN_WORD_LENGTH) return null;
    // Only keep letters (strip punctuation)
    const word = text.replace(/[^a-zA-Z]/g, "");
    return word.length >= MIN_WORD_LENGTH ? word.toLowerCase() : null;
  }

  // --- API Calls ---
  async function fetchGif(word) {
    if (!giphyApiKey) return null;
    try {
      const url = `${GIPHY_API_URL}?api_key=${giphyApiKey}&q=${encodeURIComponent(word + " meaning")}&limit=1&rating=g&lang=en`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        // Use fixed_height for consistent sizing
        return data.data[0].images.fixed_height.url;
      }
    } catch (e) {
      console.error("GifDict: Giphy fetch error", e);
    }
    return null;
  }

  async function fetchDefinition(word) {
    try {
      const res = await fetch(`${DICT_API_URL}/${encodeURIComponent(word)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data[0] && data[0].meanings && data[0].meanings[0]) {
        const meaning = data[0].meanings[0];
        const partOfSpeech = meaning.partOfSpeech || "";
        const def = meaning.definitions[0]?.definition || "";
        return { partOfSpeech, definition: def };
      }
    } catch (e) {
      console.error("GifDict: Dictionary fetch error", e);
    }
    return null;
  }

  // --- Tooltip ---
  function dismissTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  function createTooltip(x, y) {
    dismissTooltip();
    tooltip = document.createElement("div");
    tooltip.className = "gifdict-tooltip";
    tooltip.innerHTML = `<div class="gifdict-loading">✨ Loading...</div>`;

    // Position near cursor
    const offset = 15;
    tooltip.style.left = `${x + offset}px`;
    tooltip.style.top = `${y + offset}px`;

    document.body.appendChild(tooltip);

    // Adjust if tooltip goes off screen
    requestAnimationFrame(() => {
      const rect = tooltip.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        tooltip.style.left = `${x - rect.width - offset}px`;
      }
      if (rect.bottom > window.innerHeight) {
        tooltip.style.top = `${y - rect.height - offset}px`;
      }
    });

    return tooltip;
  }

  function renderTooltip(word, gifUrl, definition) {
    if (!tooltip) return;

    let html = `<div class="gifdict-word">${word}</div>`;

    if (gifUrl) {
      html += `<img class="gifdict-gif" src="${gifUrl}" alt="${word}" />`;
    } else {
      html += `<div class="gifdict-no-gif">No visual found</div>`;
    }

    if (definition) {
      html += `<div class="gifdict-def">`;
      html += `<span class="gifdict-pos">${definition.partOfSpeech}</span> `;
      html += `${definition.definition}`;
      html += `</div>`;
    } else {
      html += `<div class="gifdict-def gifdict-no-def">No definition found</div>`;
    }

    tooltip.innerHTML = html;
  }

  // --- Main Handler ---
  async function onDoubleClick(e) {
    const word = getSelectedWord();
    if (!word) return;

    // Don't trigger on input fields
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    createTooltip(e.pageX, e.pageY);

    // Fetch GIF and definition in parallel
    const [gifUrl, definition] = await Promise.all([
      fetchGif(word),
      fetchDefinition(word),
    ]);

    renderTooltip(word, gifUrl, definition);
  }
})();
