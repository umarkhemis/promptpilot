
# Promptify Browser Extension

## Loading in Chrome (dev mode)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder
5. The Promptify icon appears in your toolbar

## Icons needed

Create an `icons/` folder and add:
- `icon16.png`  — 16×16px
- `icon48.png`  — 48×48px
- `icon128.png` — 128×128px

Use your existing Promptify logo (`prompt_logo.jpg`) resized to these dimensions.
Any image editor or https://squoosh.app works fine.

## Testing

1. Click the extension icon → sign in with your Promptify account
2. Go to https://chat.openai.com or https://claude.ai
3. Type something in the prompt box
4. The purple **Improve** button appears bottom-right
5. Click it — your prompt gets replaced with the improved version

## Supported platforms

| Platform       | URL                          | Status  |
|----------------|------------------------------|---------|
| ChatGPT        | chat.openai.com / chatgpt.com | ✅      |
| Claude         | claude.ai                     | ✅      |
| Gemini         | gemini.google.com             | ✅      |
| Perplexity     | perplexity.ai                 | ✅      |

## Publishing to Chrome Web Store

1. Zip the entire `extension/` folder
2. Go to https://chrome.google.com/webstore/devconsole
3. Pay the one-time $5 developer fee
4. Upload the zip and fill in the store listing
5. Submit for review (usually 1-3 days)

## Firefox port

Firefox supports Manifest V3 with minor changes:
- Replace `chrome.*` with `browser.*` (or use the webextension-polyfill)
- Add `"browser_specific_settings"` to manifest.json:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "promptify@yourdomain.com",
    "strict_min_version": "109.0"
  }
}
```