// GifDict — Content Script
// Double-click a word → show GIF + definition tooltip

(function () {
  "use strict";

  const WORKER_URL = "https://gifdict-api.carolineli6023.workers.dev";
  const MIN_WORD_LENGTH = 3;

  let tooltip = null;

  // Load settings from storage
  chrome.storage.sync.get(["enabled"], (result) => {
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

  function getSentenceAround(selection) {
    const node = selection.anchorNode;
    if (!node || !node.textContent) return null;
    const text = node.textContent;
    const offset = selection.anchorOffset;
    // Find sentence boundaries around the cursor
    const start = Math.max(0, text.lastIndexOf(".", offset - 1) + 1);
    const end = text.indexOf(".", offset);
    return text.slice(start, end === -1 ? text.length : end + 1).trim();
  }

  // --- API Calls ---
  async function fetchWordInfo(word, sentence) {
    try {
      const res = await fetch(`${WORKER_URL}/api/word-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, sentence })
      });
      const result = await res.json();
      console.log("Word info:", result);
      return result;
    } catch (e) {
      console.error("GifDict: Word info fetch error", e);
      return null;
    }
  }

  async function fetchGif(query) {
    try {
      console.log("Giphy query:", query);
      const res = await fetch(`${WORKER_URL}/api/gif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      return data.gifUrl || null;
    } catch (e) {
      console.error("GifDict: Giphy fetch error", e);
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

    // Single LLM call: get definition, POS, and GIF keyword from sentence context
    const sentence = getSentenceAround(window.getSelection());
    const wordInfo = await fetchWordInfo(word, sentence);
    const gifKeyword = wordInfo?.gifKeyword?.toLowerCase() || word;
    const query = gifKeyword !== word ? `${word} ${gifKeyword}` : word;
    const gifUrl = await fetchGif(query);

    renderTooltip(word, gifUrl, wordInfo);
  }
})();
