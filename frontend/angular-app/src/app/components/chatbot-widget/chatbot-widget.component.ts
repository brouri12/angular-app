import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotImprovedService, ChatMessage } from '../../services/chatbot-improved.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" [class.expanded]="isExpanded">
      <!-- Chatbot Icon -->
      <button 
        *ngIf="!isExpanded"
        (click)="toggleChat()"
        class="chatbot-icon"
        title="Assistant virtuel">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      <!-- Chat Window -->
      <div *ngIf="isExpanded" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <h3 class="text-white font-semibold">Assistant Forum ESPRIT</h3>
          <div class="flex gap-2">
            <button (click)="clearChat()" class="text-white hover:text-gray-200" title="Effacer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button (click)="toggleChat()" class="text-white hover:text-gray-200" title="Fermer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #messagesContainer>
          <div *ngIf="messages.length === 0" class="text-center text-gray-500 py-8">
            <p>Bonjour! Comment puis-je vous aider?</p>
          </div>
          
          <div *ngFor="let msg of messages" 
               [class]="msg.role === 'user' ? 'message-user' : 'message-assistant'">
            <div class="message-content">
              <p>{{ msg.content }}</p>
              <span class="message-time">{{ msg.timestamp | date:'HH:mm' }}</span>
            </div>
          </div>

          <div *ngIf="isTyping" class="message-assistant">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <input
            type="text"
            [(ngModel)]="userMessage"
            (keyup.enter)="sendMessage()"
            placeholder="Tapez votre message..."
            class="chat-input-field flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style="color: #000000 !important; background-color: #ffffff !important;"
            [disabled]="isTyping"
          />
          <button
            (click)="sendMessage()"
            [disabled]="!userMessage.trim() || isTyping"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        <!-- Custom Confirm Dialog -->
        <div *ngIf="showClearConfirm" class="confirm-overlay">
          <div class="confirm-dialog">
            <h4 class="text-lg font-semibold mb-2">Effacer l'historique</h4>
            <p class="text-gray-600 mb-4">Voulez-vous effacer l'historique de conversation?</p>
            <div class="flex gap-2 justify-end">
              <button (click)="cancelClear()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Annuler
              </button>
              <button (click)="confirmClear()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Effacer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .chatbot-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }

    .chatbot-icon:hover {
      transform: scale(1.1);
    }

    .chat-window {
      width: 380px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f9fafb;
    }

    .message-user, .message-assistant {
      margin-bottom: 12px;
      display: flex;
    }

    .message-user {
      justify-content: flex-end;
    }

    .message-user .message-content {
      background: #667eea;
      color: white;
      border-radius: 12px 12px 0 12px;
    }

    .message-assistant .message-content {
      background: white;
      color: #1f2937;
      border-radius: 12px 12px 12px 0;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .message-content {
      max-width: 75%;
      padding: 10px 14px;
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
      display: block;
      margin-top: 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 8px 0;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-10px);
      }
    }

    .chat-input {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      background: white;
    }

    .chat-input-field {
      color: #000000 !important;
      background-color: #ffffff !important;
      border: 1px solid #d1d5db !important;
    }

    .chat-input-field::placeholder {
      color: #9ca3af !important;
    }

    .chat-input-field:focus {
      color: #000000 !important;
      background-color: #ffffff !important;
    }

    .chat-input-field:disabled {
      background-color: #f3f4f6 !important;
      color: #374151 !important;
    }

    /* Force text color in all states */
    input.chat-input-field,
    input.chat-input-field:focus,
    input.chat-input-field:active,
    input.chat-input-field:hover {
      color: #000000 !important;
      background-color: #ffffff !important;
    }

    .confirm-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      z-index: 10;
    }

    .confirm-dialog {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      max-width: 300px;
      width: 90%;
    }
  `]
})
export class ChatbotWidgetComponent implements OnInit {
  isExpanded = false;
  userMessage = '';
  messages: ChatMessage[] = [];
  isTyping = false;
  showClearConfirm = false;

  constructor(private chatbotService: ChatbotImprovedService) {}

  ngOnInit() {
    this.chatbotService.conversation$.subscribe(messages => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isTyping) return;

    const messageToSend = this.userMessage.trim();
    this.userMessage = ''; // Clear input immediately
    this.isTyping = true;

    this.chatbotService.sendMessage(messageToSend).subscribe({
      next: () => {
        this.isTyping = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Chatbot error:', error);
        this.isTyping = false;
      }
    });
  }

  clearChat() {
    this.showClearConfirm = true;
  }

  confirmClear() {
    this.chatbotService.clearConversation();
    this.showClearConfirm = false;
  }

  cancelClear() {
    this.showClearConfirm = false;
  }

  private scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
