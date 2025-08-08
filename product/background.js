// Tạo context menu khi extension được cài đặt
chrome.runtime.onInstalled.addListener(() => {
  console.log("Khánh Macro extension đã được cài đặt thành công!");
  chrome.contextMenus.create({
    id: "chatWithGemini",
    title: "Khánh Macro",
    contexts: ["selection"],
  });
});

// Xử lý khi người dùng click vào context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "chatWithGemini" && info.selectionText) {
    console.log("Đang gửi yêu cầu chat với Gemini...");
    chrome.tabs.sendMessage(tab.id, {
      action: "chatWithGemini",
      text: info.selectionText,
    });
  }
});

// Chat với Gemini AI
async function chatWithGemini(text) {
  try {
    const result = await chrome.storage.sync.get(["geminiApiKey", "modelType"]);
    const apiKey = result.geminiApiKey;
    const model = result?.modelType ?? "gemini-2.0-flash";

    if (!apiKey) {
      return {
        response:
          "Vui lòng cài đặt API key của Gemini trong popup extension trước khi sử dụng.",
        error: true,
      };
    }
    const prompts = `Hãy trả lời câu hỏi hoặc định nghĩa câu sau một cách ngắn gọn và đầy đủ nhất có thể. Chỉ dùng chữ để trả lời chứ không được dùng code và bảng. Câu hỏi là: ${text}`;

    const api = "generateContent";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${api}?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompts,
            },
          ],
        },
      ],
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return {
        response: data.candidates[0].content.parts[0].text,
        originalText: text,
      };
    } else {
      throw new Error("Không nhận được phản hồi từ Gemini");
    }
  } catch (error) {
    return {
      response: `Lỗi khi chat với Gemini: ${error.message}. Vui lòng kiểm tra API key và kết nối internet.`,
      error: true,
      originalText: text,
    };
  }
}

// Lắng nghe tin nhắn từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getChatResponse") {
    chatWithGemini(request.text, request.prompt)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({
          response: "Lỗi khi gọi Gemini API: " + error.message,
          error: true,
          originalText: request.text,
        })
      );
    return true;
  }
});
