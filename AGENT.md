# GifDict

Chrome extension (Manifest V3) — double-click any word on a webpage to see a GIF + definition in a tooltip, powered by Claude Haiku.

## Architecture

No build step for the extension. Plain HTML/CSS/JS loaded directly by Chrome. API calls are proxied through a Cloudflare Worker.

```
User double-clicks word → content script → Cloudflare Worker → Claude Haiku + Giphy → tooltip
```

### Extension (`extension/`)

| File | Role |
|---|---|
| `manifest.json` | Extension config — declares content scripts, popup, permissions |
| `content/content.js` | Injected into every page. Handles double-click detection, calls worker API, renders tooltip |
| `content/styles.css` | Tooltip styles, injected alongside content.js |
| `popup/popup.html` / `popup.js` | Toolbar popup — enable/disable toggle |
| `icons/` | Extension icons (16, 48, 128px) |

### Worker (`worker/`)

| File | Role |
|---|---|
| `index.js` | Cloudflare Worker — proxies calls to Anthropic and Giphy APIs, holds API keys as secrets |
| `wrangler.toml` | Cloudflare deployment config |

## Key Details

- **APIs**: Claude Haiku (definition + GIF keyword), Giphy Search API (GIFs)
- **API keys**: Stored as Cloudflare Worker secrets (not in client code)
- **Storage**: `chrome.storage.sync` for the enabled/disabled setting
- **No background service worker** — everything runs in the content script and popup
- **LLM prompt**: Defined in `worker/index.js` (`RESPONSE_FORMAT` + `buildPrompt()`)

## Local Development

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` directory
4. Double-click any word on a webpage to test

## Worker Deployment

1. `cd worker && wrangler login`
2. Set secrets: `echo "key" | wrangler secret put CLAUDE_API_KEY`
3. Deploy: `wrangler deploy`
