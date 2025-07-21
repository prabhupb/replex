document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyButton = document.getElementById('saveKey');
  const defaultToneSelect = document.getElementById('defaultTone');
  const contextKeywordsTextarea = document.getElementById('contextKeywords');
  const statusDiv = document.getElementById('status');

  function showStatus(message, type = 'success') {
    const messageSpan = statusDiv.querySelector('.alert-message');
    const icon = statusDiv.querySelector('.alert-icon');
    
    messageSpan.textContent = message;
    statusDiv.className = `alert ${type}`;
    statusDiv.style.display = 'block';
    
    // Update icon based on type
    if (type === 'success') {
      icon.innerHTML = '<polyline points="20,6 9,17 4,12"/>';
    } else {
      icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
    }
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  chrome.storage.sync.get(['openaiApiKey', 'defaultTone', 'contextKeywords'], function(result) {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
    if (result.defaultTone) {
      defaultToneSelect.value = result.defaultTone;
    } else {
      // Set default value if none exists
      defaultToneSelect.value = 'friendly';
    }
    if (result.contextKeywords) {
      contextKeywordsTextarea.value = result.contextKeywords;
    }
  });

  saveKeyButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    const defaultTone = defaultToneSelect.value;
    const contextKeywords = contextKeywordsTextarea.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format', 'error');
      return;
    }
    
    chrome.storage.sync.set({
      openaiApiKey: apiKey,
      defaultTone: defaultTone,
      contextKeywords: contextKeywords
    }, function() {
      showStatus('Settings saved successfully!');
    });
  });

  defaultToneSelect.addEventListener('change', function() {
    chrome.storage.sync.set({
      defaultTone: defaultToneSelect.value
    });
  });

  contextKeywordsTextarea.addEventListener('blur', function() {
    chrome.storage.sync.set({
      contextKeywords: contextKeywordsTextarea.value.trim()
    });
  });
});