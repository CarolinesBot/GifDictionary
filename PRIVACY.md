# Privacy Policy for GifDict

**Last updated:** March 29, 2026

## What GifDict Does

GifDict is a Chrome extension that lets you double-click any English word on a webpage to see a GIF and a short definition.

## Data We Collect

When you double-click a word, the extension sends **only** the following to our server:

- The word you selected
- The surrounding sentence (for context-aware definitions)

That's it. We do not collect any other data.

## How Your Data Is Used

Your word and sentence are sent to our backend server (hosted on Cloudflare Workers), which forwards them to:

- **Anthropic API** — to generate a definition and a GIF search keyword
- **Giphy API** — to find a relevant GIF

These requests are made in real time and **nothing is stored**. We do not log, save, or retain any of the words or sentences you look up.

## Data We Do NOT Collect

- Browsing history
- Personal information (name, email, etc.)
- Cookies or tracking identifiers
- Analytics or telemetry data
- Passwords or form data

## Third-Party Services

- [Anthropic](https://www.anthropic.com/privacy) — processes word definitions
- [Giphy](https://support.giphy.com/hc/en-us/articles/360032872931-GIPHY-Privacy-Policy) — provides GIF results

These services have their own privacy policies linked above.

## Permissions

- **Storage** — used solely to save your on/off toggle preference via `chrome.storage.sync`
- **All URLs (content script)** — required because the core feature works on any webpage you visit

## Contact

If you have questions about this privacy policy, please open an issue at [github.com/CarolinesBot/GifDictionary/issues](https://github.com/CarolinesBot/GifDictionary/issues).
