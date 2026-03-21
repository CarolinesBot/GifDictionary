// GifDict — Popup Settings
const apiKeyInput = document.getElementById("apiKey");
const enabledToggle = document.getElementById("enabled");
const savedMsg = document.getElementById("saved");

// Load saved settings
chrome.storage.sync.get(["giphyApiKey", "enabled"], (result) => {
  apiKeyInput.value = result.giphyApiKey || "";
  enabledToggle.checked = result.enabled !== false;
});

// Save on change
function save() {
  chrome.storage.sync.set({
    giphyApiKey: apiKeyInput.value.trim(),
    enabled: enabledToggle.checked,
  }, () => {
    savedMsg.classList.add("show");
    setTimeout(() => savedMsg.classList.remove("show"), 1500);
  });
}

apiKeyInput.addEventListener("input", save);
enabledToggle.addEventListener("change", save);
