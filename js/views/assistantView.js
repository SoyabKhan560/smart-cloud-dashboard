/**
 * Smart Cloud Assistant View Controller - AI Chat Interface
 */

import { Api } from '../api.js';

export class AssistantView {
  static init() {
    this.bindEvents();
  }

  static bindEvents() {
    const input = document.getElementById('chat-input-field');
    const sendBtn = document.getElementById('chat-send-btn');
    const promptPills = document.querySelectorAll('.prompt-pill');

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    if (promptPills) {
      promptPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          const text = e.currentTarget.getAttribute('data-prompt') || e.currentTarget.textContent.trim();
          if (input) {
            input.value = text;
            this.handleSendMessage();
          }
        });
      });
    }
  }

  static async handleSendMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    // Clear input
    input.value = '';

    // Append user message
    this.appendMessage('user', message);

    // Show typing indicator
    const typingId = this.showTypingIndicator();

    try {
      const response = await Api.askAssistant(message);
      this.removeTypingIndicator(typingId);
      this.appendMessage('assistant', response.data.reply);
    } catch (err) {
      this.removeTypingIndicator(typingId);
      this.appendMessage('assistant', 'Sorry, I encountered an issue reaching the cloud intelligence engine. Please try again.');
    }
  }

  static appendMessage(role, text) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = `chat-message-row ${role}`;

    const formattedText = this.formatMarkdown(text);

    if (role === 'user') {
      row.innerHTML = `
        <div class="chat-msg-avatar"><i class="fas fa-user"></i></div>
        <div class="chat-bubble"><p>${formattedText}</p></div>
      `;
    } else {
      row.innerHTML = `
        <div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-bubble">${formattedText}</div>
      `;
    }

    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  }

  static showTypingIndicator() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return null;

    const id = `typing-${Date.now()}`;
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-message-row assistant';
    div.innerHTML = `
      <div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  static removeTypingIndicator(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  static formatMarkdown(text) {
    // Simple markdown conversion for bullets, bold, and code
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  }
}
