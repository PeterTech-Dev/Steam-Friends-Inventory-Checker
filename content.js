console.log("✅ Steam Inventory Extension running...");

const appIds = {
  cs2: 730,
  tf2: 440,
  rust: 252490,
  dota: 570
};

const priceFiles = {
  730: chrome.runtime.getURL("prices/cs2-prices.json"),
  440: chrome.runtime.getURL("prices/tf2-prices.json"),
  252490: chrome.runtime.getURL("prices/rust-prices.json"),
  570: chrome.runtime.getURL("prices/dota-prices.json")
};

const priceCache = {};
const DELAY_MS = 2000;

// Inject styles
const style = document.createElement("style");
style.textContent = `
  .selectable_overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 0;
  }
  .friend_block_v2 {
    height: 140px !important;
    overflow: visible !important;
    padding-bottom: 8px;
  }
  .friend_block_content {
    flex: 1 1 100%;
    width: auto;
  }
  .inventory-totals {
    flex: 1 1 100%;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 6px;
    color: #90ee90;
    font-family: Arial, sans-serif;
    padding-left: 58px;
    z-index: 2;
  }
`;
document.head.appendChild(style);

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load local price cache
async function loadPriceFile(appId) {
  if (priceCache[appId]) return priceCache[appId];
  try {
    const res = await fetch(priceFiles[appId]);
    if (!res.ok) throw new Error(`Failed to fetch prices for ${appId}: ${res.status}`);
    const json = await res.json();
    priceCache[appId] = json;
    return json;
  } catch (e) {
    console.error(`❌ Failed to load price file for ${appId}`, e);
    return {};
  }
}

// Fetch Steam inventory
async function fetchInventory(steamId, appId) {
  const url = `https://steamcommunity.com/inventory/${steamId}/${appId}/2?l=english&count=5000`;
  console.log("🌐 Fetching inventory URL:", url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ Inventory fetch failed (${response.status}) for ${steamId}`);
      return { private: true };
    }
    return await response.json();
  } catch (err) {
    console.error(`❌ Failed inventory fetch for ${steamId} HTTP ${err.message}`);
    return { private: true };
  }
}

// Calculate total value
function calculateInventoryValue(inventory, prices) {
  if (!inventory || !inventory.descriptions) return 0;
  return inventory.descriptions.reduce((total, item) => {
    const price = prices[item.market_hash_name] || 0;
    return total + price;
  }, 0);
}

function displayProfileTotals(profileId, gameTotals, isPrivate = false) {
  const container = document.querySelector(`[data-steamid="${profileId}"]`);
  if (!container) return;

  container.querySelector(".inventory-totals")?.remove();

  const block = document.createElement("div");
  block.className = "inventory-totals";

  if (isPrivate) {
    block.innerHTML = `🔒 <strong>The inventory is private</strong>`;
  } else {
    const total = Object.values(gameTotals).reduce((a, b) => a + b, 0);

    for (const [game, value] of Object.entries(gameTotals)) {
      block.innerHTML += `💰 <strong>${game.toUpperCase()}</strong>: $${value.toFixed(2)}<br>`;
    }

    block.innerHTML += `<hr style="border:0;border-top:1px solid #666;margin:4px 0;">
                        🎯 <strong>Total</strong>: $${total.toFixed(2)}`;
  }

  container.appendChild(block);
}


// Process one user's inventory
async function processFriendInventory(steamId) {
  console.log("👤 Processing SteamID:", steamId);
  const gameTotals = {};

  for (const [game, appId] of Object.entries(appIds)) {
    console.log(`🎮 Fetching ${game.toUpperCase()} (${appId}) for ${steamId}...`);

    const [inventory, prices] = await Promise.all([
      fetchInventory(steamId, appId),
      loadPriceFile(appId)
    ]);

    const value = inventory?.private ? 0 : calculateInventoryValue(inventory, prices);
    gameTotals[game] = value;

    if (inventory?.private) {
      console.log(`🔒 Inventory private for ${steamId}, defaulting values to $0`);
    } else {
      console.log(`💵 ${game.toUpperCase()} value for ${steamId}: $${value.toFixed(2)}`);
    }
  }
  const isPrivate = Object.values(gameTotals).every(val => val === 0);
  displayProfileTotals(steamId, gameTotals, isPrivate);
}

// Convert vanity URL to steamID
function resolveVanityURL(name) {
  return new Promise(async (resolve) => {
    const apiKey = window.STEAM_API_KEY;
    if (!apiKey) return resolve(null);

    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${name}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json?.response?.steamid) return resolve(json.response.steamid);
    } catch (err) {
      console.warn("❌ Vanity resolution failed:", err.message);
    }

    console.warn(`⚠️ Could not resolve /id/${name}`);
    resolve(null);
  });
}

// Grab steam IDs from friend list
async function getFriendSteamIds() {
  const links = document.querySelectorAll("a[href*='/profiles/'], a[href*='/id/']");
  const ids = new Set();

  for (const link of links) {
    const profileMatch = link.href.match(/\/profiles\/(\d+)/);
    if (profileMatch) {
      ids.add(profileMatch[1]);
    } else {
      const customMatch = link.href.match(/\/id\/([^/]+)/);
      if (customMatch) {
        const steamId = await resolveVanityURL(customMatch[1]);
        if (steamId) ids.add(steamId);
        await delay(350);
      }
    }
  }

  return Array.from(ids);
}

// Start logic
function runExtension() {
  getFriendSteamIds().then(async (friendIds) => {
    console.log(`👥 Found ${friendIds.length} friends`);
    for (const steamId of friendIds) {
      await processFriendInventory(steamId);
      await delay(DELAY_MS);
    }
  });
}

// Entry point: load API key then run
chrome.storage.local.get("steamApiKey", (data) => {
  const apiKey = data.steamApiKey;
  if (!apiKey || apiKey.length !== 32) {
    alert("⚠️ Please enter your Steam API key by clicking the extension icon.");
    console.warn("❌ Steam API Key is missing or invalid. Extension halted.");
    return;
  }

  window.STEAM_API_KEY = apiKey;
  runExtension();
});
