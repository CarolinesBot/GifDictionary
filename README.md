# 🎬 GifDict

Double-click any English word → see a GIF that visually explains it + a short definition.

## How It Works

1. User double-clicks a word on any webpage
2. The extension extracts the surrounding sentence for context
3. A Cloudflare Worker calls Claude Haiku to get the definition, part of speech, and a GIF-optimized search keyword
4. The keyword + original word are used to search Giphy
5. A tooltip displays the GIF and definition

## Project Structure

```
GifDictionary/
├── extension/          # Chrome extension (load this in chrome://extensions)
│   ├── manifest.json
│   ├── icons/
│   ├── content/        # Content script + styles
│   └── popup/          # Extension popup UI
└── worker/             # Cloudflare Worker API proxy
    ├── index.js
    └── wrangler.toml
```

## Setup

### Extension
1. Open Chrome → `chrome://extensions` → Enable **Developer mode**
2. Click **Load unpacked** → select the `extension/` folder
3. Go to any webpage, double-click a word, enjoy! ✨

### Worker (for development)
1. Install dependencies: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Set secrets:
   ```bash
   echo "your-key" | wrangler secret put CLAUDE_API_KEY
   echo "your-key" | wrangler secret put GIPHY_API_KEY
   ```
4. Deploy: `cd worker && wrangler deploy`

## Tech Stack

- Chrome Extension (Manifest V3)
- Cloudflare Worker (API proxy — keeps keys server-side)
- Claude Haiku (context-aware definitions + GIF keyword generation)
- Giphy API (GIF search)

## TODO

- [ ] Add Chinese translation to tooltip
- [ ] Cache results for repeated words
- [ ] Add pronunciation audio
- [ ] Generate custom animations with AI instead of Giphy
- [ ] Publish to Chrome Web Store
