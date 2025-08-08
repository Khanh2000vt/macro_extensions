// Biến lưu trữ popup hiện tại
let currentPopup = null;

// Lắng nghe tin nhắn từ background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "chatWithGemini") {
    showGeminiChatPopup(request.text);
  }
});

// Tạo và hiển thị popup chat với Gemini
function showGeminiChatPopup(selectedText) {
  // Xóa popup cũ nếu có
  removePopup();

  // Tạo popup container
  const popup = document.createElement("div");
  popup.id = "gemini-chat-popup";
  popup.className = "gemini-chat-popup";

  // Nội dung popup
  popup.innerHTML = `
    <div class="chat-header">
      <span class="chat-title">Khánh Macro</span>
      <dix class="chat-actions">
      <button id="copy-response">Sao chép</button>
      <button class="close-btn">&times;</button>
      </dix>
    </div>
    <div class="chat-content">
      <div class="gemini-response">
        <div class="response-content" id="response-content">
          Loading ...
        </div>
      </div>
    </div>
  `;

  // Vị trí popup gần con trỏ chuột
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  popup.style.left =
    Math.min(rect.left + window.scrollX, window.innerWidth - 450) + "px";
  popup.style.top = rect.bottom + window.scrollY + 10 + "px";

  document.body.appendChild(popup);
  currentPopup = popup;

  // Event listeners
  popup.querySelector(".close-btn").addEventListener("click", removePopup);
  popup
    .querySelector("#copy-response")
    .addEventListener("click", copyGeminiResponse);

  // Click outside để đóng popup
  document.addEventListener("click", handleOutsideClick);

  // Auto chat với prompt mặc định
  setTimeout(() => {
    console.log("Đang chat với Gemini...");
    chatWithGemini(selectedText);
  }, 500);
}

// Chat với Gemini và hiển thị kết quả
function chatWithGemini(text) {
  const responseDiv = currentPopup.querySelector("#response-content");

  // Hiển thị trạng thái loading
  responseDiv.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <span>Gemini đang suy nghĩ...</span>
    </div>
  `;
  responseDiv.className = "response-content loading-state";

  chrome.runtime.sendMessage(
    {
      action: "getChatResponse",
      text: text,
    },
    (response) => {
      if (response && currentPopup) {
        if (response.error) {
          responseDiv.innerHTML = `<div class="error-message">${response.response}</div>`;
          responseDiv.className = "response-content error-state";
        } else {
          // Format response text với line breaks
          const formattedResponse = response.response
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>");

          responseDiv.innerHTML = formattedResponse;
          responseDiv.className = "response-content success-state";

          // Lưu response để sao chép
          currentPopup.setAttribute("data-response", response.response);
        }
      }
    }
  );
}

// Sao chép phản hồi của Gemini
function copyGeminiResponse() {
  const response = currentPopup.getAttribute("data-response");
  if (response) {
    navigator.clipboard.writeText(response).then(() => {
      const copyBtn = currentPopup.querySelector("#copy-response");
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Đã sao chép!";
      setTimeout(() => {
        if (currentPopup) {
          copyBtn.textContent = originalText;
        }
      }, 2000);
    });
  }
}

// Xử lý click bên ngoài popup
function handleOutsideClick(event) {
  if (currentPopup && !currentPopup.contains(event.target)) {
    removePopup();
  }
}

// Xóa popup
function removePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
    document.removeEventListener("click", handleOutsideClick);
  }
}

// Xóa popup khi nhấn ESC
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && currentPopup) {
    removePopup();
  }
});
