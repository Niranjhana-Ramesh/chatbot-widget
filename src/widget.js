import './styles.css';

class ChatbotWidget {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'https://chatbot-backend-8kwr.onrender.com/query';
    this.primaryColor = config.primaryColor || '#007bff';
    this.position = config.position || 'bottom-right';
    this.init();
  }

  init() {
    this.createUI();
    this.attachEvents();
    this.addMessage('Hi! I’m ready to chat with you 😊', 'status-message');
  }

  createUI() {
    this.container = document.createElement('div');
    this.container.className = `chatbot-container ${this.position}`;
    this.container.style.setProperty('--primary-color', this.primaryColor);

    const header = document.createElement('div');
    header.className = 'chatbot-header';

    const title = document.createElement('span');
    title.textContent = 'Chatbot';

    const minimizeBtn = document.createElement('button');
    minimizeBtn.id = 'minimize-chat';
    minimizeBtn.textContent = '—';
    minimizeBtn.title = 'Minimize Chat';

    header.appendChild(title);
    header.appendChild(minimizeBtn);

    this.messagesEl = document.createElement('div');
    this.messagesEl.className = 'chatbot-body';
    this.messagesEl.id = 'chat-messages';

    const footer = document.createElement('div');
    footer.className = 'chatbot-footer';

    this.inputEl = document.createElement('input');
    this.inputEl.id = 'chatbot-query';
    this.inputEl.placeholder = 'Type your message...';

    this.sendBtn = document.createElement('button');
    this.sendBtn.id = 'chatbot-submit';
    this.sendBtn.textContent = 'Send';

    footer.appendChild(this.inputEl);
    footer.appendChild(this.sendBtn);

    this.container.appendChild(header);
    this.container.appendChild(this.messagesEl);
    this.container.appendChild(footer);

    document.body.appendChild(this.container);
  }

  attachEvents() {
    const minimizeBtn = this.container.querySelector('#minimize-chat');
    minimizeBtn.addEventListener('click', () => {
      this.container.classList.toggle('minimized');
      const isMinimized = this.container.classList.contains('minimized');
      minimizeBtn.textContent = isMinimized ? '▲' : '—';
      minimizeBtn.title = isMinimized ? 'Maximize Chat' : 'Minimize Chat';
    });

    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });
  }

  addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);

    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordWrap = 'break-word';
    pre.style.margin = '0';
    pre.style.padding = '0';
    pre.style.fontFamily = 'inherit';
    pre.style.fontSize = 'inherit';
    pre.style.lineHeight = '1.5';
    pre.textContent = text;

    messageDiv.appendChild(pre);
    this.messagesEl.appendChild(messageDiv);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return pre;
  }

  async handleSend() {
    const query = this.inputEl.value.trim();
    if (!query) return;
    this.addMessage(query, 'user-message');
    this.inputEl.value = '';

    const botPre = this.addMessage('', 'bot-message');

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error(`Server responded ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        botText += decoder.decode(value, { stream: true });
        botPre.textContent = botText;
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      }
    } catch (err) {
      botPre.textContent = `Error: ${err.message}`;
    }
  }
}

// Auto-initialize if config exists
if (window.CHATBOT_CONFIG) {
  new ChatbotWidget(window.CHATBOT_CONFIG);
}

window.ChatbotWidget = ChatbotWidget;
