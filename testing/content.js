// Gửi một đối tượng chứa dữ liệu đến background script
chrome.runtime.sendMessage(
  { greeting: "xin chào từ content script" },
  (response) => {
    if (chrome.runtime.lastError) {
      // Xử lý lỗi nếu có
      console.error(chrome.runtime.lastError.message);
    } else {
      // Nhận và xử lý phản hồi từ background script
      console.log(response.farewell);
    }
  }
);

// Lắng nghe tin nhắn từ background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message from background script:", request);
  if (request.action === "chatWithGemini") {
    console.log("Received chat request with text:", request.text);
    // showGeminiChatPopup(request.text);
  }
});
