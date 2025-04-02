# 🎮 Steam-Friends-Inventory-Checker

A Chrome extension that displays **CS2**, **TF2**, **Rust**, and **Dota 2** inventory values directly on your friends list.

Built with:
- ✅ No external servers or APIs (except Steam)
- ✅ Runs entirely in-browser
- ✅ Uses your own [Steam API Key](https://steamcommunity.com/dev/apikey)
- ✅ Handles both SteamID and vanity URL friends
- ✅ Shows accurate value per game and total per user
- ✅ Automatically detects private inventories

---

## 📦 How it works

This extension scans all friends listed on your [Steam Friends Page](https://steamcommunity.com/my/friends) and fetches their inventories to calculate total item value using price data.

The item prices are provided by the open-source [Steam-Price-Scraper](https://github.com/PeterTech-Dev/Steam-Price-Scraper), which you can use or update yourself to stay accurate.

---

## 🧰 Setup

1. Clone or download this repo
2. Go to `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select this project folder
6. Click the extension icon to enter your Steam API key

---

## 🛡️ Permissions Justified

| Permission     | Reason                                                  |
|----------------|----------------------------------------------------------|
| `activeTab`    | Injects inventory logic on the friends page             |
| `host_permissions` | Needed to access Steam inventory and API endpoints     |
| `storage`      | Saves your API key securely on your device              |
| `scripting`    | Injects and runs scripts on steamcommunity.com          |

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).  
It is forever free and open-source. Use it, improve it, fork it—just give credit.

---

## 👨‍💻 Author

Built with ❤️ by [PeterTech-Dev](https://github.com/PeterTech-Dev)  
Want to contribute? PRs and stars are always welcome ⭐
