export async function getPriceData(game) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "getPriceFile", file: `${game}-prices.json` }, (res) => {
        if (res?.success) resolve(res.data);
        else resolve({});
      });
    });
  }