// Example: grab selected text
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getSelectedText") {
      const selectedText = window.getSelection().toString();
      sendResponse({ text: selectedText });
    }
  });
  