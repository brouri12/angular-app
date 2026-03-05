import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  response: string;
  suggestedLinks?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private conversationHistory: ChatMessage[] = [];
  private conversationSubject = new BehaviorSubject<ChatMessage[]>([]);
  public conversation$ = this.conversationSubject.asObservable();

  private knowledgeBase = {
    'upload': 'Pour uploader un fichier, cliquez sur le bouton "Joindre" lors de la création d\'un message. Vous pouvez ajouter des images (max 10MB), audio (max 25MB), ou documents (max 50MB).',
    'image': 'Les formats d\'images supportés sont: JPEG, PNG, GIF et WebP. La taille maximale est de 10MB.',
    'video': 'Vous pouvez intégrer des vidéos YouTube et Vimeo en collant simplement l\'URL dans votre message.',
    'audio': 'Pour enregistrer un audio, cliquez sur l\'icône microphone. Les formats supportés sont MP3, WAV et OGG (max 25MB).',
    'document': 'Les documents supportés incluent: PDF, ZIP, RAR, DOC, DOCX, XLS, XLSX. Taille max: 50MB.',
    'notification': 'Gérez vos préférences de notification email dans votre profil. Vous pouvez activer/désactiver les notifications pour les réponses, mentions, et résumés.',
    'email': 'Vous recevrez des emails pour: bienvenue, réponses à vos messages, mentions @username, digest hebdomadaire, et résumé quotidien.',
    'preference': 'Accédez à vos préférences email via votre profil pour personnaliser les notifications que vous souhaitez recevoir.',
    'forum': 'Le forum vous permet de créer des discussions, répondre aux messages, liker, et partager des fichiers multimédias.',
    'aide': 'Je peux vous aider avec: upload de fichiers, notifications email, fonctionnalités du forum, et navigation.',
    'help': 'Je peux vous aider avec: upload de fichiers, notifications email, fonctionnalités du forum, et navigation.'
  };

  constructor() {
    this.loadConversationHistory();
  }

  sendMessage(message: string): Observable<ChatbotResponse> {
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.conversationHistory.push(userMessage);

    // Generate response
    const response = this.generateResponse(message);
    
    // Add assistant response
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.response,
      timestamp: new Date()
    };
    this.conversationHistory.push(assistantMessage);

    // Keep only last 10 messages
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    this.saveConversationHistory();
    this.conversationSubject.next([...this.conversationHistory]);

    return of(response).pipe(delay(500)); // Simulate API delay
  }

  private generateResponse(message: string): ChatbotResponse {
    const lowerMessage = message.toLowerCase();
    
    // Check knowledge base
    for (const [keyword, response] of Object.entries(this.knowledgeBase)) {
      if (lowerMessage.includes(keyword)) {
        return {
          response,
          suggestedLinks: this.getSuggestedLinks(keyword)
        };
      }
    }

    // Default response
    return {
      response: 'Je suis votre assistant virtuel du Forum JUNGLE IN ENGHLISH. Je peux vous aider avec les uploads de fichiers, les notifications email, et la navigation du forum. Comment puis-je vous aider?',
      suggestedLinks: ['/forums', '/preferences']
    };
  }

  private getSuggestedLinks(keyword: string): string[] {
    const linkMap: { [key: string]: string[] } = {
      'upload': ['/forums'],
      'image': ['/forums'],
      'video': ['/forums'],
      'audio': ['/forums'],
      'document': ['/forums'],
      'notification': ['/preferences'],
      'email': ['/preferences'],
      'preference': ['/preferences'],
      'forum': ['/forums']
    };
    return linkMap[keyword] || [];
  }

  clearConversation(): void {
    this.conversationHistory = [];
    this.conversationSubject.next([]);
    localStorage.removeItem('chatbot_conversation');
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  private saveConversationHistory(): void {
    localStorage.setItem('chatbot_conversation', JSON.stringify(this.conversationHistory));
  }

  private loadConversationHistory(): void {
    const saved = localStorage.getItem('chatbot_conversation');
    if (saved) {
      try {
        this.conversationHistory = JSON.parse(saved);
        this.conversationSubject.next([...this.conversationHistory]);
      } catch (e) {
        this.conversationHistory = [];
      }
    }
  }
}
