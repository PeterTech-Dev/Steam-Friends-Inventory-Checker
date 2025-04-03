const apiKeyInput = document.getElementById("apiKey");
const saveBtn = document.getElementById("saveBtn");
const toggleView = document.getElementById("toggleView");
const toast = document.getElementById("toast");

let isMasked = true;
let realKey = "";

// Load saved key on popup open
chrome.storage.local.get("steamApiKey", (data) => {
  if (data.steamApiKey) {
    realKey = data.steamApiKey;
    apiKeyInput.type = "password";
    apiKeyInput.value = realKey;
    isMasked = true;
    toggleView.textContent = "👁 Show API Key";
  }
});

// Save key
saveBtn.addEventListener("click", () => {
  const entered = apiKeyInput.value.trim();

  if (entered.length !== 32) {
    showStatus("❌ Invalid API key. Must be 32 characters.", false);
    return;
  }

  chrome.storage.local.get("steamApiKey", (data) => {
    if (data.steamApiKey === entered) {
      showStatus("⚠️ This API key is already saved.", false);
    } else {
      chrome.storage.local.set({ steamApiKey: entered }, () => {
        realKey = entered;
        isMasked = true;
        apiKeyInput.type = "password";
        apiKeyInput.value = realKey;
        toggleView.textContent = "👁 Show API Key";
        showStatus("✅ API key saved!", true);
      });
    }
  });
});


// Show/hide API key
toggleView.addEventListener("click", () => {
  if (!realKey) return;
  isMasked = !isMasked;
  apiKeyInput.type = isMasked ? "password" : "text";
  apiKeyInput.value = realKey;
  toggleView.textContent = isMasked ? "👁 Show API Key" : "🙈 Hide API Key";
});

function showStatus(message, isSuccess = true) {
  const box = document.getElementById("statusMsg");
  box.textContent = message;
  box.className = isSuccess ? "success" : "error";
  box.style.display = "block";
  setTimeout(() => box.style.display = "none", 4000);
}

