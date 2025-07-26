class ReplexContentScript {
  constructor() {
    this.currentTweetContext = null;
    this.replexUI = null;
    this.isTwitter = window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');
    
    if (this.isTwitter) {
      this.init();
    }
  }

  init() {
    this.injectStyles();
    this.observeReplyButtons();
    this.setupMessageListener();
  }

  injectStyles() {
    if (document.getElementById('replex-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'replex-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('styles.css');
    document.head.appendChild(link);
  }

  observeReplyButtons() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            this.processNewNodes(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.processNewNodes(document.body);
  }

  processNewNodes(container) {
    const replyButtons = container.querySelectorAll('[data-testid="reply"]');
    
    replyButtons.forEach((button) => {
      if (!button.dataset.replexProcessed) {
        button.dataset.replexProcessed = 'true';
        this.addReplexButton(button);
      }
    });
  }

  addReplexButton(replyButton) {
    const replexButton = document.createElement('div');
    replexButton.className = 'replex-trigger-button';
    replexButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.95 5.16-.21 9-4.4 9-9.95V7l-10-5z"/>
        <path d="M8 11h1.5l.5 2h4l.5-2H16v-1H8v1z"/>
      </svg>
      <span>AI Reply</span>
    `;
    
    replexButton.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.handleReplexButtonClick(replyButton);
    });

    const parentContainer = replyButton.closest('[data-testid="tweet"]') || replyButton.closest('article');
    if (parentContainer) {
      const actionBar = parentContainer.querySelector('[role="group"]');
      if (actionBar && !actionBar.querySelector('.replex-trigger-button')) {
        actionBar.appendChild(replexButton);
      }
    }
  }

  handleReplexButtonClick(replyButton) {
    const tweetContainer = replyButton.closest('[data-testid="tweet"]') || replyButton.closest('article');
    
    if (!tweetContainer) return;

    this.currentTweetContext = this.extractTweetContext(tweetContainer);
    
    replyButton.click();
    
    setTimeout(() => {
      this.showReplexModal();
    }, 500);
  }

  extractTweetContext(tweetContainer) {
    const tweetTextElement = tweetContainer.querySelector('[data-testid="tweetText"]');
    
    // Find the User-Name container
    const userNameContainer = tweetContainer.querySelector('[data-testid="User-Name"]');
    let userName = '';
    let handle = '';
    let displayName = '';
    
    if (userNameContainer) {
      // Get the display name from the first link's text content
      const nameLink = userNameContainer.querySelector('a');
      if (nameLink) {
        // Get the display name from the span inside the link
        const nameSpan = nameLink.querySelector('span');
        if (nameSpan) {
          // Extract the full display name including emojis
          displayName = nameSpan.innerText.trim();
          // Extract just the text without emojis for userName
          userName = nameSpan.textContent.trim();
        }
        
        // Get the handle from the href attribute
        const href = nameLink.getAttribute('href');
        if (href) {
          handle = href.replace('/', '').split('/')[0];
        }
      }
      
      // If handle not found from main link, look for it in the second link
      if (!handle) {
        const links = userNameContainer.querySelectorAll('a');
        for (const link of links) {
          const spanWithAt = link.querySelector('span');
          if (spanWithAt && spanWithAt.textContent.includes('@')) {
            handle = spanWithAt.textContent.replace('@', '').trim();
            break;
          }
        }
      }
    }
    
    // Extract profile picture
    let profilePicUrl = '';
    const avatarContainer = tweetContainer.querySelector('[data-testid="Tweet-User-Avatar"]');
    if (avatarContainer) {
      const profileImg = avatarContainer.querySelector('img[src*="profile_images"]');
      if (profileImg) {
        profilePicUrl = profileImg.src;
      }
    }
    
    // Debug logging
    console.log('Extracted context:', { displayName, userName, handle, profilePicUrl, text: tweetTextElement ? tweetTextElement.innerText.substring(0, 50) + '...' : '' });
    
    return {
      text: tweetTextElement ? tweetTextElement.innerText : '',
      userName: userName,
      displayName: displayName || userName,
      handle: handle,
      profilePicUrl: profilePicUrl,
      timestamp: Date.now()
    };
  }

  showReplexModal() {
    if (this.replexUI) {
      this.removeReplexModal();
    }

    const modal = document.createElement('div');
    modal.className = 'replex-modal';
    modal.innerHTML = `
      <div class="replex-modal-content">
        <div class="replex-header">
          <div class="header-content">
            <div class="header-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M9 9l6 6"/>
                <path d="M15 9l-6 6"/>
              </svg>
              <h3>Generate AI Reply</h3>
            </div>
            <button class="replex-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="replex-body">
          <div class="replex-context">
            <div class="context-header">
              ${this.currentTweetContext.profilePicUrl ? `
                <img src="${this.currentTweetContext.profilePicUrl}" alt="Profile" class="reply-profile-pic">
              ` : ''}
              <div class="reply-user-info">
                <div class="reply-display-name">${this.currentTweetContext.displayName || this.currentTweetContext.userName || 'Unknown User'}</div>
                <div class="reply-handle">@${this.currentTweetContext.handle || 'unknown'}</div>
              </div>
            </div>
            <div class="tweet-preview">"${this.currentTweetContext.text.substring(0, 120)}${this.currentTweetContext.text.length > 120 ? '...' : ''}"</div>
          </div>
          
          <div class="replex-controls">
            <div class="form-group">
              <label class="form-label" for="tone-select">Reply Tone</label>
              <select id="tone-select" class="form-select">
                <option value="friendly">😊 Friendly</option>
                <option value="professional">💼 Professional</option>
                <option value="witty">🎭 Witty</option>
                <option value="playful">🤹 Playful/Humorous</option>
                <option value="sarcastic">😏 Sarcastic</option>
                <option value="supportive">🤝 Supportive</option>
                <option value="casual">😎 Casual</option>
                <option value="curious">🔍 Curious</option>
                <option value="critical">🧐 Critical</option>
                <option value="philosophical">🧠 Philosophical</option>
                <option value="technical">🧰 Technical</option>
                <option value="dialectical">⚖️ Dialectical</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="context-input">Additional Context (Optional)</label>
              <textarea id="context-input" class="form-textarea context-input" placeholder="Add specific context for this reply (e.g., 'Focus on the technical aspects' or 'Include my background in AI')"></textarea>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" id="rephrase-mode" class="form-checkbox">
                <span>Rephrase context as an engaging tweet (ignores reply tone)</span>
              </label>
            </div>
            
            <button class="btn btn-primary replex-generate" id="generate-reply">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.95 5.16-.21 9-4.4 9-9.95V7l-10-5z"/>
              </svg>
              <span class="button-text">Generate Reply</span>
            </button>
          </div>
          
          <div class="replex-output" id="reply-output" style="display: none;">
            <div class="form-group">
              <label class="form-label">Generated Reply</label>
              <textarea id="generated-reply" class="form-textarea" placeholder="Your AI-generated reply will appear here..."></textarea>
            </div>
            <div class="reply-actions">
              <button class="btn btn-primary replex-insert" id="insert-reply">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Insert Reply
              </button>
              <button class="btn btn-secondary replex-regenerate" id="regenerate-reply">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <polyline points="1,20 1,14 7,14"/>
                  <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"/>
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.replexUI = modal;

    this.setupModalEventListeners();
    this.loadDefaultTone();
  }

  setupModalEventListeners() {
    const modal = this.replexUI;
    
    modal.querySelector('.replex-close').addEventListener('click', () => {
      this.removeReplexModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.removeReplexModal();
      }
    });

    modal.querySelector('#generate-reply').addEventListener('click', () => {
      this.generateReply();
    });

    modal.querySelector('#insert-reply').addEventListener('click', () => {
      this.insertReply();
    });

    modal.querySelector('#regenerate-reply').addEventListener('click', () => {
      this.generateReply();
    });

    // Add explicit change listener for checkbox to ensure state is properly reflected
    const checkbox = modal.querySelector('#rephrase-mode');
    checkbox.addEventListener('change', (e) => {
      console.log('Checkbox state changed:', e.target.checked);
      // Force visual update
      if (e.target.checked) {
        e.target.setAttribute('checked', 'checked');
      } else {
        e.target.removeAttribute('checked');
      }
    });
  }

  loadDefaultTone() {
    chrome.storage.sync.get(['defaultTone', 'contextKeywords'], (result) => {
      if (result.defaultTone) {
        const toneSelect = this.replexUI.querySelector('#tone-select');
        toneSelect.value = result.defaultTone;
      }
      if (result.contextKeywords) {
        const contextInput = this.replexUI.querySelector('#context-input');
        contextInput.placeholder = `Add specific context for this reply (your default: ${result.contextKeywords.substring(0, 50)}${result.contextKeywords.length > 50 ? '...' : ''})`;
      }
    });
  }

  async generateReply() {
    const generateButton = this.replexUI.querySelector('#generate-reply');
    const toneSelect = this.replexUI.querySelector('#tone-select');
    const contextInput = this.replexUI.querySelector('#context-input');
    const rephraseCheckbox = this.replexUI.querySelector('#rephrase-mode');
    const outputDiv = this.replexUI.querySelector('#reply-output');
    const replyTextarea = this.replexUI.querySelector('#generated-reply');

    generateButton.classList.add('loading');
    generateButton.disabled = true;

    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set it in the extension popup.');
      }

      const tone = toneSelect.value;
      const additionalContext = contextInput.value.trim();
      const savedContext = await this.getSavedContext();
      const isRephrase = rephraseCheckbox.checked;
      
      const reply = await this.callOpenAI(apiKey, this.currentTweetContext, tone, additionalContext, savedContext, isRephrase);
      
      replyTextarea.value = reply;
      outputDiv.style.display = 'block';
      
    } catch (error) {
      alert(`Error generating reply: ${error.message}`);
    } finally {
      generateButton.classList.remove('loading');
      generateButton.disabled = false;
    }
  }

  async getApiKey() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['openaiApiKey'], (result) => {
        resolve(result.openaiApiKey);
      });
    });
  }

  async getSavedContext() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['contextKeywords'], (result) => {
        resolve(result.contextKeywords || '');
      });
    });
  }

  async callOpenAI(apiKey, context, tone, additionalContext = '', savedContext = '', isRephrase = false) {
    let contextPrompt = '';
    
    if (savedContext) {
      contextPrompt += `\nContext about me: ${savedContext}`;
    }
    
    if (additionalContext) {
      contextPrompt += `\nAdditional context: ${additionalContext}`;
    }

    let prompt;
    
    if (isRephrase) {
      // Rephrase mode - turn the context into an engaging tweet
      prompt = `Rephrase the following into an engaging tweet:

${contextPrompt}

`;
    } else {
      // Normal reply mode
      prompt = `Generate a ${tone} reply to this tweet:

Username: ${context.userName || 'Unknown'}
Handle: @${context.handle || 'unknown'}
Tweet: "${context.text}"
${contextPrompt}

Requirements:
Write a reply to the tweet below that sounds like a real human — thoughtful, casual, sometimes witty or sharp, but always grounded.

The reply should:

Show personality — ${tone}

Never sound like you're trying to farm likes or go viral

Avoid generic praise — respond meaningfully, disagree if needed, or riff on the idea

Optional: one emoji if it fits naturally

Don't include hashtags or links unless they're organic

Reference or riff on something timely if it makes sense (tech trend, launch, meme, etc).

Keep it brief — think tweet-length or just under.

Be contextually relevant

Sound natural and engaging

${contextPrompt ? 'Incorporate the provided context naturally into the reply where relevant.' : ''}

Reply:`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates engaging social media replies. Keep responses concise and natural.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate reply');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  insertReply() {
    const replyTextarea = this.replexUI.querySelector('#generated-reply');
    const generatedText = replyTextarea.value;

    if (!generatedText) return;

    // Updated selectors based on the provided HTML structure
    const twitterReplyBox = document.querySelector('[data-testid="tweetTextarea_0"]') || 
                           document.querySelector('.public-DraftEditor-content[contenteditable="true"]') ||
                           document.querySelector('div[contenteditable="true"][role="textbox"]') ||
                           document.querySelector('[role="textbox"][aria-label*="Post text"]');

    if (twitterReplyBox) {
      twitterReplyBox.focus();
      
      // Handle Draft.js editor content
      if (twitterReplyBox.classList.contains('public-DraftEditor-content')) {
        // Clear existing content first
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(twitterReplyBox);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Insert the generated text
        document.execCommand('insertText', false, generatedText);
        
        // Trigger input events for Draft.js
        twitterReplyBox.dispatchEvent(new Event('input', { bubbles: true }));
        twitterReplyBox.dispatchEvent(new Event('change', { bubbles: true }));
        twitterReplyBox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
        twitterReplyBox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      } else if (twitterReplyBox.tagName === 'TEXTAREA') {
        twitterReplyBox.value = generatedText;
        twitterReplyBox.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        // Fallback for other contenteditable elements
        twitterReplyBox.textContent = generatedText;
        twitterReplyBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      this.removeReplexModal();
    } else {
      alert('Could not find Twitter reply box. Please try again.');
    }
  }

  removeReplexModal() {
    if (this.replexUI) {
      this.replexUI.remove();
      this.replexUI = null;
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.action === 'getCurrentTweet') {
        sendResponse(this.currentTweetContext);
      }
    });
  }
}

if (typeof window !== 'undefined') {
  new ReplexContentScript();
}