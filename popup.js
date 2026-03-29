// GifDict — Popup Settings
const enabledToggle = document.getElementById("enabled");
const savedMsg = document.getElementById("saved");

// Load saved settings
chrome.storage.sync.get(["enabled"], (result) => {
  enabledToggle.checked = result.enabled !== false;
});

// Save on change
function save() {
  chrome.storage.sync.set({
    enabled: enabledToggle.checked,
  }, () => {
    savedMsg.classList.add("show");
    setTimeout(() => savedMsg.classList.remove("show"), 1500);
  });
}

enabledToggle.addEventListener("change", save);
