chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "chatWithGemini",
    title: "Khánh Macro",
    contexts: ["selection"],
  });
});

// Xử lý khi người dùng click vào context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "chatWithGemini" && info.selectionText) {
    try {
      chrome.tabs.sendMessage(tab.id, {
        action: "chatWithGemini",
        text: info.selectionText,
      });
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn đến content script:", error);
    }
    console.log("Đã gửi tin nhắn đến content script để hiển thị popup chat.");
  }
});

// Lắng nghe các tin nhắn từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "xin chào từ content script") {
    console.log("Đã nhận được tin nhắn từ tab:", sender.tab.url);

    sendResponse({ farewell: "tạm biệt từ background script" });
  }
  return true;
});
