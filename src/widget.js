import './styles.css';

class ChatbotWidget extends HTMLElement {
  constructor() {
    super();
    this.apiUrl = 'https://chatbot-backend-8kwr.onrender.com/query'; // fixed API URL
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

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .chatbot-container {
        position: relative;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        overflow: hidden;
        font-family: Arial, sans-serif;
        z-index: 10000;
      }
      .chatbot-container.minimized {
        height: 40px;
        width: 200px;
      }
      .chatbot-header {
        color: #fff;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #007bff;
      }
      .chatbot-header button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
      }
      .chatbot-body {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        background-color: #f7f7f7;
      }
      .chatbot-footer {
        padding: 10px;
        display: flex;
        gap: 5px;
        border-top: 1px solid #ddd;
      }
      .chatbot-footer input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .chatbot-footer button {
        padding: 8px 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .message {
        margin-bottom: 10px;
        padding: 6px 10px;
        border-radius: 6px;
        max-width: 80%;
        word-wrap: break-word;
      }
      .user-message {
        background-color: #007bff;
        color: white;
        margin-left: auto;
      }
      .bot-message {
        background-color: #e9ecef;
        color: #333;
      }
      .status-message {
        text-align: center;
        color: #666;
        font-style: italic;
      }
    `;

    this.shadowRoot.appendChild(style);
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
