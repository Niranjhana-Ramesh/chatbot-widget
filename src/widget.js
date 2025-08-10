import './styles.css';

class ChatbotWidget extends HTMLElement {
  constructor() {
    super();
    this.apiUrl = 'https://chatbot-backend-8kwr.onrender.com/query';
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this._attachEvents();
    this._addMessage('Hi! I’m ready to chat with you 😊', 'status-message');
  }

  _render() {
    const container = document.createElement('div');
    container.className = 'chatbot-container inline';

    container.innerHTML = `
      <div class="chatbot-header">
        <span>Chatbot</span>
        <button id="minimize-chat" title="Minimize Chat">—</button>
      </div>
      <div class="chatbot-body" id="chat-messages"></div>
      <div class="chatbot-footer">
        <input id="chatbot-query" placeholder="Type your message..." />
        <button id="chatbot-submit">Send</button>
      </div>
    `;

    // Inject the extracted CSS into Shadow DOM
    const cssLink = document.createElement('link');
    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute('href', 'https://chatbot-widget-drg.pages.dev/chatbot-widget.css');
    this.shadowRoot.appendChild(cssLink);

    this.shadowRoot.appendChild(container);

    this._container = container;
    this._messagesEl = container.querySelector('#chat-messages');
    this._inputEl = container.querySelector('#chatbot-query');
    this._sendBtn = container.querySelector('#chatbot-submit');
  }

  _attachEvents() {
    this.shadowRoot.querySelector('#minimize-chat').addEventListener('click', () => {
      this._container.classList.toggle('minimized');
      const btn = this.shadowRoot.querySelector('#minimize-chat');
      const minimized = this._container.classList.contains('minimized');
      btn.textContent = minimized ? '▲' : '—';
      btn.title = minimized ? 'Maximize Chat' : 'Minimize Chat';
    });

    this._sendBtn.addEventListener('click', () => this._handleSend());
    this._inputEl.addEventListener('keypress', e => {
      if (e.key === 'Enter') this._handleSend();
    });
  }

  _addMessage(text, type) {
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
    this._messagesEl.appendChild(messageDiv);
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    return pre;
  }

  async _handleSend() {
    const query = this._inputEl.value.trim();
    if (!query) return;

    this._addMessage(query, 'user-message');
    this._inputEl.value = '';

    const botPre = this._addMessage('', 'bot-message');

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
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
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
      }
    } catch (err) {
      botPre.textContent = `Error: ${err.message}`;
    }
  }
}

customElements.define('chatbot-widget', ChatbotWidget);
