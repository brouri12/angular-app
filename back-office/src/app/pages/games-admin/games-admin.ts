import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameAdminService, Game, GameContent, AdminStats } from '../../services/game-admin.service';
import { Theme } from '../../services/theme';

type View = 'games' | 'content' | 'players';

@Component({
  selector: 'app-games-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './games-admin.html',
  styleUrl: './games-admin.css'
})
export class GamesAdmin implements OnInit {
  view = signal<View>('games');
  games = signal<Game[]>([]);
  content = signal<GameContent[]>([]);
  stats = signal<AdminStats | null>(null);
  selectedGame = signal<Game | null>(null);
  loading = signal(false);
  toast = signal('');

  // Game form
  showGameForm = signal(false);
  editingGame: Game | null = null;
  gameForm: Game = this.emptyGame();

  // Content form
  showContentForm = signal(false);
  editingContent: GameContent | null = null;
  contentForm: GameContent = this.emptyContent();
  optionsList: string[] = ['', '', '', ''];

  // Player lookup
  playerUserId = '';
  playerSession = signal<any>(null);

  constructor(private svc: GameAdminService, public themeService: Theme) {}

  ngOnInit() {
    this.loadGames();
    this.loadStats();
  }

  loadGames() {
    this.loading.set(true);
    this.svc.getGames().subscribe({ next: g => { this.games.set(g); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  loadStats() {
    this.svc.getStats().subscribe({ next: s => this.stats.set(s), error: () => {} });
  }

  loadContent(game: Game) {
    this.selectedGame.set(game);
    this.view.set('content');
    this.svc.getContent(game.id!).subscribe(c => this.content.set(c));
  }

  // ─── GAMES CRUD ───────────────────────────────────────────────────────────

  openCreateGame() { this.editingGame = null; this.gameForm = this.emptyGame(); this.showGameForm.set(true); }
  openEditGame(g: Game) { this.editingGame = g; this.gameForm = { ...g }; this.showGameForm.set(true); }

  saveGame() {
    if (!this.gameForm.title?.trim()) { this.notify('❌ Title is required'); return; }
    if (this.editingGame?.id) {
      this.svc.updateGame(this.editingGame.id, this.gameForm).subscribe({
        next: () => { this.loadGames(); this.loadStats(); this.showGameForm.set(false); this.notify('✅ Game updated!'); },
        error: () => this.notify('❌ Failed to update game')
      });
    } else {
      this.svc.createGame(this.gameForm).subscribe({
        next: () => { this.loadGames(); this.loadStats(); this.showGameForm.set(false); this.notify('✅ Game created!'); },
        error: () => this.notify('❌ Failed to create game')
      });
    }
  }

  deleteGame(id: number) {
    if (!confirm('Delete this game and all its content?')) return;
    this.svc.deleteGame(id).subscribe(() => { this.loadGames(); this.notify('Game deleted.'); });
  }

  toggleGame(id: number) {
    this.svc.toggleGame(id).subscribe(() => { this.loadGames(); this.notify('Status toggled.'); });
  }

  // ─── CONTENT CRUD ─────────────────────────────────────────────────────────

  openAddContent() {
    this.editingContent = null;
    this.contentForm = this.emptyContent();
    this.optionsList = ['', '', '', ''];
    this.showContentForm.set(true);
  }

  openEditContent(c: GameContent) {
    this.editingContent = c;
    this.contentForm = { ...c };
    // options is already string[]
    this.optionsList = Array.isArray(c.options) ? [...c.options] : [];
    if (this.optionsList.length === 0) this.optionsList = ['', '', '', ''];
    this.showContentForm.set(true);
  }

  addOption() {
    this.optionsList = [...this.optionsList, ''];
  }

  removeOption(index: number) {
    this.optionsList = this.optionsList.filter((_, i) => i !== index);
  }

  saveContent() {
    // Validate required fields
    if (!this.contentForm.questionText?.trim()) {
      this.notify('❌ Question text is required');
      return;
    }
    if (!this.contentForm.correctAnswer?.trim()) {
      this.notify('❌ Correct answer is required');
      return;
    }

    const gameId = this.selectedGame()!.id!;
    const opts = this.optionsList.filter(o => o.trim().length > 0);

    // For QUIZ games, ensure correct answer is in options
    if (this.selectedGame()!.type === 'QUIZ' && opts.length > 0) {
      const correctInOptions = opts.some(o =>
        o.trim().toLowerCase() === this.contentForm.correctAnswer.trim().toLowerCase()
      );
      if (!correctInOptions) {
        this.notify('❌ Correct answer must be one of the options');
        return;
      }
    }

    // Assign options array directly (backend expects string[])
    this.contentForm.options = opts;

    if (this.editingContent?.id) {
      this.svc.updateContent(this.editingContent.id, this.contentForm).subscribe({
        next: () => { this.loadContent(this.selectedGame()!); this.showContentForm.set(false); this.notify('✅ Question updated!'); },
        error: () => this.notify('❌ Failed to update question')
      });
    } else {
      this.svc.addContent(gameId, this.contentForm).subscribe({
        next: () => { this.loadContent(this.selectedGame()!); this.showContentForm.set(false); this.notify('✅ Question added!'); },
        error: () => this.notify('❌ Failed to add question')
      });
    }
  }

  deleteContent(id: number) {
    if (!confirm('Delete this question?')) return;
    this.svc.deleteContent(id).subscribe(() => { this.loadContent(this.selectedGame()!); this.notify('Deleted.'); });
  }

  // ─── PLAYERS ──────────────────────────────────────────────────────────────

  lookupPlayer() {
    if (!this.playerUserId.trim()) return;
    this.svc.getPlayerSession(this.playerUserId.trim()).subscribe({ next: s => this.playerSession.set(s), error: () => this.playerSession.set(null) });
  }

  resetPlayer() {
    this.svc.resetPlayerSession(this.playerUserId.trim()).subscribe(s => { this.playerSession.set(s); this.notify('Session reset!'); });
  }

  // ─── SEED ─────────────────────────────────────────────────────────────────

  seed() {
    this.notify('Use the "+ New Game" button to create games and add questions via the admin panel.');
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  notify(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
  emptyGame(): Game { return { title: '', type: 'QUIZ', difficulty: 'EASY', description: '', isActive: true }; }
  emptyContent(): GameContent { return { questionText: '', correctAnswer: '', options: [], explanation: '' }; }
  typeIcon(t: string) { return t === 'QUIZ' ? '🧠' : '✏️'; }
  diffColor(d: string) { return d === 'EASY' ? 'text-green-600' : d === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'; }
  parseOptions(opts: string[] | string): string[] {
    if (Array.isArray(opts)) return opts;
    try { return JSON.parse(opts as string); } catch { return []; }
  }
}
