import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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
export class ChatbotImprovedService {
  private conversationHistory: ChatMessage[] = [];
  private conversationSubject = new BehaviorSubject<ChatMessage[]>([]);
  public conversation$ = this.conversationSubject.asObservable();

  private knowledgeBase = {
    // Forums et Messages
    'forum': 'Les forums vous permettent de créer des discussions, répondre aux messages, liker, et partager des fichiers multimédias. Allez dans le menu "Forums" pour commencer.',
    'message': 'Pour créer un message, sélectionnez un forum puis cliquez sur "Nouveau Message". Vous pouvez ajouter du texte, des images, audio, documents et vidéos.',
    'créer': 'Pour créer un nouveau message: 1) Allez dans Forums, 2) Sélectionnez un forum, 3) Cliquez "Nouveau Message", 4) Remplissez le titre et contenu, 5) Ajoutez des médias si souhaité, 6) Cliquez "Publier".',
    'nouveau': 'Pour créer un nouveau message: 1) Allez dans Forums, 2) Sélectionnez un forum, 3) Cliquez "Nouveau Message", 4) Remplissez le titre et contenu, 5) Ajoutez des médias si souhaité, 6) Cliquez "Publier".',
    'publier': 'Pour publier un message, remplissez le titre et le contenu, ajoutez des médias si vous le souhaitez, puis cliquez sur le bouton "Publier".',
    'répondre': 'Pour répondre à un message, cliquez sur le bouton "Répondre" sous le message qui vous intéresse.',
    'liker': 'Pour liker un message, cliquez sur l\'icône cœur (❤️) sous le message. Vous pouvez voir le nombre de likes à côté.',
    'signaler': 'Pour signaler un contenu inapproprié, cliquez sur le bouton "Signaler" (🚩) sous le message.',

    // Upload et Médias
    'upload': 'Pour uploader un fichier: 1) Créez un nouveau message, 2) Scrollez vers le bas, 3) Section "Ajouter des médias", 4) Choisissez le type de fichier (image, audio, document), 5) Sélectionnez votre fichier.',
    'image': 'Pour ajouter une image: formats supportés JPG, PNG, GIF, WebP (max 5MB). Dans "Nouveau Message", scrollez vers "Ajouter des médias" et cliquez "Choisir une image".',
    'photo': 'Pour ajouter une photo: formats supportés JPG, PNG, GIF, WebP (max 5MB). Dans "Nouveau Message", scrollez vers "Ajouter des médias" et cliquez "Choisir une image".',
    'audio': 'Pour ajouter un audio: formats MP3, WAV, OGG (max 10MB). Dans "Nouveau Message", scrollez vers "Ajouter des médias" et cliquez "Choisir un audio".',
    'son': 'Pour ajouter un fichier audio: formats MP3, WAV, OGG (max 10MB). Dans "Nouveau Message", scrollez vers "Ajouter des médias" et cliquez "Choisir un audio".',
    'document': 'Pour ajouter un document: formats PDF, ZIP, DOC, XLS (max 20MB). Dans "Nouveau Message", scrollez vers "Ajouter des médias" et cliquez "Choisir un document".',
    'pdf': 'Pour ajouter un PDF: Dans "Nouveau Message", scrollez vers "Ajouter des médias" et cliquez "Choisir un document". Taille max: 20MB.',
    'video': 'Pour ajouter une vidéo YouTube: Dans "Nouveau Message", scrollez vers "Ajouter des médias" et collez l\'URL YouTube dans le champ "Lien vidéo".',
    'youtube': 'Pour intégrer une vidéo YouTube: copiez l\'URL de la vidéo et collez-la dans le champ "Lien vidéo" lors de la création d\'un message.',
    'fichier': 'Vous pouvez uploader: Images (JPG, PNG, GIF - 5MB), Audio (MP3, WAV - 10MB), Documents (PDF, DOC, ZIP - 20MB), et intégrer des vidéos YouTube.',

    // Email et Notifications
    'email': 'Pour gérer vos emails: cliquez sur l\'icône email dans le header, puis configurez vos préférences de notification (nouveaux messages, réponses, likes, mentions).',
    'notification': 'Pour configurer les notifications: cliquez sur l\'icône email dans le header, puis cochez/décochez les types de notifications que vous souhaitez recevoir.',
    'préférence': 'Vos préférences email se trouvent en cliquant sur l\'icône email dans le header. Vous pouvez activer/désactiver 7 types de notifications.',
    'mail': 'Pour gérer vos emails: cliquez sur l\'icône email dans le header, puis configurez vos préférences de notification (nouveaux messages, réponses, likes, mentions).',

    // Recrutement
    'recrutement': 'Pour consulter les offres d\'emploi: allez dans le menu "Recrutement". Vous pouvez voir les offres disponibles et postuler en ligne.',
    'emploi': 'Pour consulter les offres d\'emploi: allez dans le menu "Recrutement". Vous pouvez voir les offres disponibles et postuler en ligne.',
    'offre': 'Les offres d\'emploi se trouvent dans la section "Recrutement". Cliquez sur une offre pour voir les détails et postuler.',
    'postuler': 'Pour postuler: 1) Allez dans "Recrutement", 2) Sélectionnez une offre, 3) Cliquez "Postuler", 4) Remplissez le formulaire, 5) Uploadez votre CV, 6) Soumettez.',
    'cv': 'Vous pouvez uploader votre CV (PDF, DOC, DOCX - max 2MB) lors de votre candidature dans la section Recrutement.',
    'candidature': 'Pour soumettre une candidature: remplissez le formulaire avec vos informations, uploadez votre CV, rédigez une lettre de motivation, puis cliquez "Soumettre".',

    // Navigation et Interface
    'menu': 'Le menu principal contient: Accueil, Forums, Recrutement. Dans le header, vous avez aussi les icônes pour les emails et le changement de langue.',
    'navigation': 'Utilisez le menu en haut pour naviguer: Accueil (page principale), Forums (discussions), Recrutement (offres d\'emploi).',
    'langue': 'Pour changer de langue: cliquez sur l\'icône de langue dans le header et sélectionnez Français ou English.',
    'français': 'Pour passer en français: cliquez sur l\'icône de langue dans le header et sélectionnez "Français".',
    'anglais': 'Pour passer en anglais: cliquez sur l\'icône de langue dans le header et sélectionnez "English".',
    'english': 'To switch to English: click on the language icon in the header and select "English".',

    // Aide générale
    'aide': 'Je peux vous aider avec: créer des messages, uploader des fichiers, configurer les notifications email, naviguer dans les forums, postuler aux offres d\'emploi.',
    'help': 'Je peux vous aider avec: créer des messages, uploader des fichiers, configurer les notifications email, naviguer dans les forums, postuler aux offres d\'emploi.',
    'comment': 'Dites-moi ce que vous voulez faire! Je peux vous expliquer comment créer un message, uploader des fichiers, configurer les emails, ou naviguer sur la plateforme.',
    'où': 'Que cherchez-vous? Je peux vous dire où trouver les forums, les offres d\'emploi, les préférences email, ou comment naviguer sur la plateforme.',
    'quoi': 'Que voulez-vous savoir? Je peux vous expliquer les fonctionnalités des forums, l\'upload de médias, les notifications email, ou le système de recrutement.',

    // Problèmes courants
    'problème': 'Quel problème rencontrez-vous? Je peux vous aider avec l\'upload de fichiers, les notifications email, la navigation, ou la création de messages.',
    'erreur': 'Quelle erreur voyez-vous? Vérifiez que: 1) Le backend est démarré (port 8082), 2) Votre fichier respecte les limites de taille, 3) Vous êtes connecté.',
    'marche': 'Si quelque chose ne fonctionne pas: 1) Actualisez la page, 2) Vérifiez votre connexion, 3) Assurez-vous que le backend est démarré sur le port 8082.',
    'fonctionne': 'Si quelque chose ne fonctionne pas: 1) Actualisez la page, 2) Vérifiez votre connexion, 3) Assurez-vous que le backend est démarré sur le port 8082.',

    // Informations techniques
    'backend': 'Le backend doit être démarré sur le port 8082. Si vous avez des erreurs, vérifiez que les services Spring Boot sont actifs.',
    'port': 'Les ports utilisés: Frontend (4300), Back-office (4301), Forum Service (8082), Recrutement Service (8083), API Gateway (8888).',
    'service': 'Les services incluent: Forum Service (messages, médias), Recrutement Service (offres, candidatures), API Gateway (routage).',

    // Salutations
    'bonjour': 'Bonjour! Je suis votre assistant virtuel pour la plateforme éducative ESPRIT. Comment puis-je vous aider aujourd\'hui?',
    'salut': 'Salut! Je peux vous aider avec les forums, l\'upload de médias, les notifications email, et le recrutement. Que voulez-vous savoir?',
    'bonsoir': 'Bonsoir! Comment puis-je vous assister avec la plateforme? Forums, médias, emails, recrutement?',
    'hello': 'Hello! I can help you with forums, media upload, email notifications, and recruitment. What would you like to know?',

    // Remerciements
    'merci': 'De rien! N\'hésitez pas si vous avez d\'autres questions sur les forums, l\'upload de médias, ou toute autre fonctionnalité.',
    'thanks': 'You\'re welcome! Feel free to ask if you have more questions about forums, media upload, or any other features.'
  };

  constructor() {
    this.loadConversationHistory();
  }

  sendMessage(message: string): Observable<ChatbotResponse> {
    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    this.conversationHistory.push(userMessage);
    this.conversationSubject.next([...this.conversationHistory]);

    // Generate response after delay
    return of(null).pipe(
      delay(500), // Simulate typing delay
      map(() => {
        const response = this.generateResponse(message);
        
        // Add assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date()
        };
        this.conversationHistory.push(assistantMessage);

        // Keep only last 20 messages
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }

        this.saveConversationHistory();
        this.conversationSubject.next([...this.conversationHistory]);

        return response;
      })
    );
  }

  private generateResponse(message: string): ChatbotResponse {
    const lowerMessage = message.toLowerCase();
    
    // Check knowledge base for exact matches first
    for (const [keyword, response] of Object.entries(this.knowledgeBase)) {
      if (lowerMessage.includes(keyword)) {
        return {
          response,
          suggestedLinks: this.getSuggestedLinks(keyword)
        };
      }
    }

    // Check for partial matches or related terms
    if (lowerMessage.includes('créer') || lowerMessage.includes('faire') || lowerMessage.includes('nouveau')) {
      return {
        response: 'Pour créer un nouveau message: 1) Allez dans Forums, 2) Sélectionnez un forum, 3) Cliquez "Nouveau Message", 4) Remplissez le titre et contenu, 5) Ajoutez des médias si souhaité, 6) Cliquez "Publier".',
        suggestedLinks: ['/forums']
      };
    }

    if (lowerMessage.includes('taille') || lowerMessage.includes('limite') || lowerMessage.includes('max')) {
      return {
        response: 'Limites de taille des fichiers: Images (5MB), Audio (10MB), Documents (20MB). Les formats supportés sont JPG/PNG/GIF pour images, MP3/WAV pour audio, PDF/DOC/ZIP pour documents.',
        suggestedLinks: ['/forums']
      };
    }

    if (lowerMessage.includes('où') || lowerMessage.includes('trouver') || lowerMessage.includes('localiser')) {
      return {
        response: 'Navigation: Forums (discussions et médias), Recrutement (offres d\'emploi), icône email (notifications), icône langue (FR/EN). Que cherchez-vous précisément?',
        suggestedLinks: ['/forums', '/recrutement']
      };
    }

    // Default response with helpful suggestions
    return {
      response: '🤖 Je suis votre assistant virtuel de la Plateforme Éducative ESPRIT!\n\nJe peux vous aider avec:\n• 📝 Créer des messages dans les forums\n• 📸 Uploader des images, audio, documents\n• 📧 Configurer les notifications email\n• 💼 Postuler aux offres d\'emploi\n• 🌐 Naviguer sur la plateforme\n\nQue voulez-vous savoir?',
      suggestedLinks: ['/forums', '/recrutement']
    };
  }

  private getSuggestedLinks(keyword: string): string[] {
    const linkMap: { [key: string]: string[] } = {
      'forum': ['/forums'],
      'message': ['/forums'],
      'créer': ['/forums'],
      'nouveau': ['/forums'],
      'upload': ['/forums'],
      'image': ['/forums'],
      'photo': ['/forums'],
      'audio': ['/forums'],
      'video': ['/forums'],
      'document': ['/forums'],
      'fichier': ['/forums'],
      'email': ['/email-preferences'],
      'notification': ['/email-preferences'],
      'préférence': ['/email-preferences'],
      'mail': ['/email-preferences'],
      'recrutement': ['/recrutement'],
      'emploi': ['/recrutement'],
      'offre': ['/recrutement'],
      'postuler': ['/recrutement'],
      'cv': ['/recrutement'],
      'candidature': ['/recrutement']
    };
    return linkMap[keyword] || ['/forums'];
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