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
  const isFake = apiKeyInput.type === "password" && entered !== realKey;

  if (entered.length === 32 && !isFake) {
    chrome.storage.local.set({ steamApiKey: entered }, () => {
      realKey = entered;
      apiKeyInput.type = "password";
      apiKeyInput.value = realKey;
      isMasked = true;
      toggleView.textContent = "👁 Show API Key";

      // Feedback
      showToast();
      saveBtn.classList.add("saved");
      setTimeout(() => saveBtn.classList.remove("saved"), 2000);
    });
  } else if (isFake) {
    showToast("⚠️ API key already saved.");
  } else {
    showToast("❌ Invalid API key. Must be 32 characters.", true);
  }
});

// Show/hide API key
toggleView.addEventListener("click", () => {
  if (!realKey) return;
  isMasked = !isMasked;
  apiKeyInput.type = isMasked ? "password" : "text";
  apiKeyInput.value = realKey;
  toggleView.textContent = isMasked ? "👁 Show API Key" : "🙈 Hide API Key";
});

function showToast(message = "✅ API Key saved!", isError = false) {
  toast.textContent = message;
  toast.style.color = isError ? "#f66" : "#9f9";
  toast.style.display = "block";
  toast.style.animation = "fade 2s ease-in-out";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}
