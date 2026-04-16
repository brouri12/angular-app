import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GameService, Game, PlayerSession } from '../../services/game.service';

const PAGE_SIZE = 6;

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './games.html',
  styleUrl: './games.css'
})
export class GamesComponent implements OnInit {
  games = signal<Game[]>([]);
  session = signal<PlayerSession | null>(null);
  loading = signal(true);
  lastCrosswordAccuracy = signal<number | null>(null);

  // Filters
  filterDifficulty = signal<string | null>(null);
  filterType = signal<string | null>(null);
  searchTerm = signal<string>('');

  // Pagination
  currentPage = signal(1);

  filteredGames = computed(() => {
    let list = this.games();
    const diff = this.filterDifficulty();
    const type = this.filterType();
    const search = this.searchTerm().toLowerCase().trim();

    if (diff) list = list.filter(g => g.difficulty === diff);
    if (type) list = list.filter(g => g.type === type);
    if (search) list = list.filter(g =>
      g.title.toLowerCase().includes(search) ||
      g.description?.toLowerCase().includes(search)
    );
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredGames().length / PAGE_SIZE)));

  paginatedGames = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * PAGE_SIZE;
    return this.filteredGames().slice(start, start + PAGE_SIZE);
  });

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {
    this.loadGames();
    this.loadSession();
    // Load last crossword accuracy from localStorage
    const saved = localStorage.getItem('crossword_last_accuracy');
    if (saved) this.lastCrosswordAccuracy.set(parseFloat(saved));
  }

  loadGames() {
    this.loading.set(true);
    this.gameService.getAllGames().subscribe({
      next: games => { this.games.set(games); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadSession() {
    this.gameService.getSession().subscribe({
      next: s => this.session.set(s),
      error: () => this.session.set(null)
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onDifficultyChange(val: string) {
    this.filterDifficulty.set(val === 'all' ? null : val);
    this.currentPage.set(1);
  }

  onTypeChange(val: string) {
    this.filterType.set(val === 'all' ? null : val);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.filterDifficulty.set(null);
    this.filterType.set(null);
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  playGame(id: number) {
    this.router.navigate(['/games', id, 'play']);
  }

  playCrossword(id?: number) {
    this.router.navigate(['/crossword']);
  }

  getLevelRange(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isRecommended(_game: Game): boolean {
    return false;
  }

  getWinRate(): number {
    return 0;
  }

  getGameIcon(type: string): string {
    return ({ QUIZ: '🧠', SENTENCE: '✏️' } as any)[type] || '🎮';
  }

  getTypeGradient(type: string): string {
    return ({
      QUIZ: 'bg-gradient-to-r from-blue-400 to-blue-600',
      SENTENCE: 'bg-gradient-to-r from-green-400 to-emerald-600'
    } as any)[type] || 'bg-gradient-to-r from-gray-400 to-gray-600';
  }

  getTypeBackground(type: string): string {
    return ({
      QUIZ: 'bg-blue-50 dark:bg-blue-900/30',
      SENTENCE: 'bg-green-50 dark:bg-green-900/30'
    } as any)[type] || 'bg-gray-50 dark:bg-gray-700';
  }

  getDifficultyColor(difficulty: string): string {
    return ({
      EASY: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      HARD: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    } as any)[difficulty] || 'bg-gray-100 text-gray-800';
  }

  getGameTypeLabel(type: string): string {
    return ({ QUIZ: 'Multiple Choice', SENTENCE: 'Fill in the Blank', CROSSWORD: 'Crossword' } as any)[type] || type;
  }

  getSuccessRateColor(rate?: number): string {
    if (!rate) return 'text-gray-500';
    if (rate >= 70) return 'text-green-600 dark:text-green-400';
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }

  getSuccessRateBar(rate?: number): string {
    if (!rate) return 'bg-gray-400';
    if (rate >= 70) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (rate >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  }

  // Legacy filter methods kept for compatibility
  setFilterAll() { this.clearFilters(); }
  setFilterEasy() { this.filterDifficulty.set('EASY'); this.currentPage.set(1); }
  setFilterMedium() { this.filterDifficulty.set('MEDIUM'); this.currentPage.set(1); }
  setFilterHard() { this.filterDifficulty.set('HARD'); this.currentPage.set(1); }
}
