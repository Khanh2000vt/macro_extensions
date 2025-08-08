document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyBtn = document.getElementById("saveApiKey");
  const modelType = document.querySelector("#model-type").value;

  // Khôi phục API key đã lưu
  chrome.storage.sync.get(["geminiApiKey", "modelType"], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
    modelType.value = result?.modelType || "gemini-2.0-flash";
  });

  // Lưu API key
  saveApiKeyBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert("Vui lòng nhập API key");
      return;
    }

    chrome.storage.sync.set(
      {
        geminiApiKey: apiKey,
        modelType: modelType,
      },
      () => {
        alert("✅ API key đã được lưu!");
      }
    );
  });
});
