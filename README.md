# 🎬 GifDict

Double-click any English word → see a GIF that visually explains it + a short definition.

## Setup

1. Get a free Giphy API key: https://developers.giphy.com/
2. Open Chrome → `chrome://extensions` → Enable **Developer mode**
3. Click **Load unpacked** → select this `gifdict` folder
4. Click the GifDict extension icon → paste your Giphy API key
5. Go to any webpage, double-click a word, enjoy! ✨

## Tech Stack

- Chrome Extension (Manifest V3)
- Giphy API (GIF search)
- Free Dictionary API (definitions)
- No backend needed — 100% client-side

## TODO (iterate with Claude Code)

- [ ] Better GIF relevance (try different search queries)
- [ ] Add Chinese translation to tooltip
- [ ] Cache results for repeated words
- [ ] Add pronunciation audio
- [ ] Generate custom animations with AI instead of Giphy
- [ ] Publish to Chrome Web Store
