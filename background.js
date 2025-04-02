chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "resolveVanity") {
    chrome.storage.sync.get("steamApiKey", async (data) => {
      const key = data.steamApiKey;
      if (!key) {
        sendResponse({ error: "Missing Steam API key" });
        return;
      }

      const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${message.name}`;
      console.log("🌐 Proxying API call:", url);

      try {
        const res = await fetch(url);
        const json = await res.json();
        const steamid = json?.response?.steamid || null;
        sendResponse({ steamid });
      } catch (e) {
        console.error("❌ Vanity resolution failed:", e.message);
        sendResponse({ error: e.message });
      }
    });

    return true; // Keep async sendResponse alive
  }
});
