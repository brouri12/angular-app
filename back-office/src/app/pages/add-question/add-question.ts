import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Game {
  id: number;
  title: string;
  type: string;
  difficulty: string;
}

interface QuestionForm {
  questionText: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-question.html',
  styleUrl: './add-question.css'
})
export class AddQuestion implements OnInit {
  games = signal<Game[]>([]);
  selectedGame = signal<Game | null>(null);
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  
  // Form data
  questionText = signal('');
  correctAnswer = signal('');
  option1 = signal('');
  option2 = signal('');
  option3 = signal('');
  option4 = signal('');
  explanation = signal('');
  
  private apiUrl = 'http://localhost:9001/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGames();
  }

  loadGames() {
    this.loading.set(true);
    this.http.get<Game[]>(`${this.apiUrl}/games`).subscribe({
      next: (games) => {
        // Filter only QUIZ and SENTENCE games
        const filtered = games.filter(g => g.type === 'QUIZ' || g.type === 'SENTENCE');
        this.games.set(filtered);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.error.set('Failed to load games');
        this.loading.set(false);
      }
    });
  }

  selectGame(game: Game) {
    this.selectedGame.set(game);
    this.resetForm();
  }

  resetForm() {
    this.questionText.set('');
    this.correctAnswer.set('');
    this.option1.set('');
    this.option2.set('');
    this.option3.set('');
    this.option4.set('');
    this.explanation.set('');
    this.success.set(false);
    this.error.set(null);
  }

  isQuizGame(): boolean {
    return this.selectedGame()?.type === 'QUIZ';
  }

  isSentenceGame(): boolean {
    return this.selectedGame()?.type === 'SENTENCE';
  }

  canSubmit(): boolean {
    const game = this.selectedGame();
    if (!game) return false;

    const hasQuestion = this.questionText().trim().length > 0;
    const hasAnswer = this.correctAnswer().trim().length > 0;

    if (game.type === 'QUIZ') {
      // Quiz needs all 4 options
      return hasQuestion && hasAnswer && 
             this.option1().trim().length > 0 &&
             this.option2().trim().length > 0 &&
             this.option3().trim().length > 0 &&
             this.option4().trim().length > 0;
    } else {
      // Sentence just needs question and answer
      return hasQuestion && hasAnswer;
    }
  }

  submitQuestion() {
    if (!this.canSubmit()) return;

    const game = this.selectedGame()!;
    this.loading.set(true);
    this.error.set(null);

    let options: string[] = [];
    if (game.type === 'QUIZ') {
      options = [
        this.option1().trim(),
        this.option2().trim(),
        this.option3().trim(),
        this.option4().trim()
      ];
    } else if (game.type === 'SENTENCE') {
      // For sentence games, options can be hints or alternatives
      options = [
        this.correctAnswer().trim(),
        this.option1().trim() || '',
        this.option2().trim() || '',
        this.option3().trim() || ''
      ].filter(o => o.length > 0);
    }

    const payload = {
      questionText: this.questionText().trim(),
      correctAnswer: this.correctAnswer().trim(),
      options: JSON.stringify(options),
      explanation: this.explanation().trim() || 'No explanation provided.',
      extraData: '{}'
    };

    this.http.post(`${this.apiUrl}/admin/games/${game.id}/content`, payload).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      },
      error: (err) => {
        console.error('Error adding question:', err);
        this.error.set('Failed to add question. Please try again.');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
