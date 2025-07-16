chrome.runtime.onInstalled.addListener(() => {
  console.log('Replex extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {
    action: 'showReplexModal'
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSettings') {
    chrome.runtime.openOptionsPage();
  }
});