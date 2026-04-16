import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// ─── APIVerve types ────────────────────────────────────────────────────────────
interface ApiClue { number: number; clue: string; answer: string; length: number; }
interface ApiResponse {
  status: string;
  data: {
    size: number; difficulty: string; theme: string;
    grid: (string | null)[][];
    across: ApiClue[]; down: ApiClue[]; wordCount: number;
  };
}

// ─── Internal types ────────────────────────────────────────────────────────────
interface CellState { row: number; col: number; letter: string; number?: number; userInput: string; }
interface Clue { number: number; direction: 'ACROSS' | 'DOWN'; clue: string; answer: string; length: number; startRow: number; startCol: number; }

const THEMES = ['animals', 'food', 'sports', 'science', 'geography'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// ── API is proxied through the backend to avoid CORS issues ───────────────────
const PROXY_URL = 'http://localhost:9001/api/crossword/generate';

@Component({
  selector: 'app-crossword',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './crossword.html',
  styleUrl: './crossword.css'
})
export class CrosswordPage implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);
  showResults = signal(false);

  gridSize = signal(15);
  cells = signal<Map<string, CellState>>(new Map());
  clues = signal<Clue[]>([]);
  theme = signal('');
  difficulty = signal('');

  selectedCell = signal<{ row: number; col: number } | null>(null);
  selectedClue = signal<Clue | null>(null);

  timeRemaining = signal(300);
  timerInterval: any = null;
  timerActive = signal(false);
  startTime = 0;

  correctWords = signal(0);
  totalWords = signal(0);
  xpEarned = signal(0);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.loadNewPuzzle(); }
  ngOnDestroy() { this.stopTimer(); }

  // ─── Load from APIVerve ────────────────────────────────────────────────────

  loadNewPuzzle() {
    this.loading.set(true);
    this.error.set(null);
    this.showResults.set(false);
    this.stopTimer();
    this.cells.set(new Map());
    this.clues.set([]);
    this.selectedCell.set(null);
    this.selectedClue.set(null);

    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

    // Call backend proxy (avoids CORS issues with direct API calls)
    const url = `${PROXY_URL}?size=medium&theme=${theme}&difficulty=${difficulty}`;

    this.http.get<ApiResponse>(url).subscribe({
      next: res => {
        if (!res || res.status !== 'ok' || !res.data) {
          this.error.set('Failed to load crossword. Please try again.');
          this.loading.set(false);
          return;
        }
        this.buildPuzzle(res.data);
        this.theme.set(res.data.theme);
        this.difficulty.set(res.data.difficulty);
        this.loading.set(false);
        // Timer based on grid size and difficulty
        this.startTimer(this.calcTimer(res.data.size, res.data.difficulty));
      },
      error: (err) => {
        console.error('APIVerve error:', err);
        const msg = err.status === 401 ? 'Invalid API key — check crossword.ts line 27.'
          : err.status === 429 ? 'Rate limit reached. Wait a moment and try again.'
          : err.status === 0 ? 'Network error. Make sure you have internet access.'
          : `API error (${err.status || 'unknown'}). Check browser console for details.`;
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  private buildPuzzle(data: ApiResponse['data']) {
    const cellMap = new Map<string, CellState>();
    const size = data.size || 15;
    this.gridSize.set(size);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const letter = data.grid[r]?.[c];
        if (letter) cellMap.set(`${r},${c}`, { row: r, col: c, letter, userInput: '' });
      }
    }

    const allClues: Clue[] = [];
    const numberMap = new Map<string, number>();
    let nextNum = 1;

    const getOrAssignNumber = (r: number, c: number): number => {
      const key = `${r},${c}`;
      if (!numberMap.has(key)) numberMap.set(key, nextNum++);
      return numberMap.get(key)!;
    };

    for (const ac of data.across) {
      const pos = this.findWordStart(data.grid, ac.answer, true, size);
      if (pos) {
        const num = getOrAssignNumber(pos.row, pos.col);
        const cell = cellMap.get(`${pos.row},${pos.col}`);
        if (cell) cell.number = num;
        allClues.push({ number: num, direction: 'ACROSS', clue: ac.clue, answer: ac.answer, length: ac.length, startRow: pos.row, startCol: pos.col });
      }
    }

    for (const dc of data.down) {
      const pos = this.findWordStart(data.grid, dc.answer, false, size);
      if (pos) {
        const num = getOrAssignNumber(pos.row, pos.col);
        const cell = cellMap.get(`${pos.row},${pos.col}`);
        if (cell && !cell.number) cell.number = num;
        allClues.push({ number: num, direction: 'DOWN', clue: dc.clue, answer: dc.answer, length: dc.length, startRow: pos.row, startCol: pos.col });
      }
    }

    this.cells.set(cellMap);
    this.clues.set(allClues.sort((a, b) => a.number - b.number || a.direction.localeCompare(b.direction)));
    this.totalWords.set(allClues.length);
    this.startTime = Date.now();
  }

  private findWordStart(grid: (string | null)[][], word: string, across: boolean, size: number): { row: number; col: number } | null {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r]?.[c] !== word[0]) continue;
        let match = true;
        for (let i = 0; i < word.length; i++) {
          const nr = across ? r : r + i;
          const nc = across ? c + i : c;
          if (nr >= size || nc >= size || grid[nr]?.[nc] !== word[i]) { match = false; break; }
        }
        if (match) return { row: r, col: c };
      }
    }
    return null;
  }

  // ─── Grid helpers ──────────────────────────────────────────────────────────

  getRows(): number[] { return Array.from({ length: this.gridSize() }, (_, i) => i); }
  getCols(): number[] { return Array.from({ length: this.gridSize() }, (_, i) => i); }
  isBlack(r: number, c: number): boolean { return !this.cells().has(`${r},${c}`); }
  getCellNumber(r: number, c: number): number | null { return this.cells().get(`${r},${c}`)?.number ?? null; }
  getUserLetter(r: number, c: number): string { return this.cells().get(`${r},${c}`)?.userInput || ''; }
  isSelected(r: number, c: number): boolean { const s = this.selectedCell(); return s?.row === r && s?.col === c; }

  isHighlighted(r: number, c: number): boolean {
    const clue = this.selectedClue();
    if (!clue) return false;
    for (let i = 0; i < clue.length; i++) {
      const nr = clue.direction === 'DOWN' ? clue.startRow + i : clue.startRow;
      const nc = clue.direction === 'ACROSS' ? clue.startCol + i : clue.startCol;
      if (nr === r && nc === c) return true;
    }
    return false;
  }

  isCorrect(r: number, c: number): boolean {
    if (!this.showResults()) return false;
    const cell = this.cells().get(`${r},${c}`);
    return !!cell && cell.userInput === cell.letter;
  }

  isWrong(r: number, c: number): boolean {
    if (!this.showResults()) return false;
    const cell = this.cells().get(`${r},${c}`);
    return !!cell && cell.userInput !== '' && cell.userInput !== cell.letter;
  }

  // ─── Interaction ───────────────────────────────────────────────────────────

  selectCell(r: number, c: number) {
    if (this.isBlack(r, c) || this.showResults()) return;
    const prev = this.selectedCell();
    this.selectedCell.set({ row: r, col: c });

    const existing = this.selectedClue();
    if (existing && prev?.row === r && prev?.col === c) {
      const other = this.clues().find(cl => cl.direction !== existing.direction && this.clueCoversCell(cl, r, c));
      if (other) { this.selectedClue.set(other); return; }
    }

    const clue = this.clues().find(cl => this.clueCoversCell(cl, r, c));
    if (clue) this.selectedClue.set(clue);
  }

  clueCoversCell(clue: Clue, r: number, c: number): boolean {
    for (let i = 0; i < clue.length; i++) {
      const nr = clue.direction === 'DOWN' ? clue.startRow + i : clue.startRow;
      const nc = clue.direction === 'ACROSS' ? clue.startCol + i : clue.startCol;
      if (nr === r && nc === c) return true;
    }
    return false;
  }

  selectClue(clue: Clue) {
    this.selectedClue.set(clue);
    this.selectedCell.set({ row: clue.startRow, col: clue.startCol });
  }

  onKeyDown(event: KeyboardEvent, r: number, c: number) {
    if (this.showResults()) return;
    const key = event.key.toUpperCase();

    if (key.length === 1 && /[A-Z]/.test(key)) {
      event.preventDefault();
      this.setLetter(r, c, key);
      this.moveNext(r, c);
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      const cell = this.cells().get(`${r},${c}`);
      if (cell?.userInput) this.setLetter(r, c, '');
      else this.movePrev(r, c);
    } else if (event.key === 'ArrowRight') { event.preventDefault(); this.selectCell(r, c + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); this.selectCell(r, c - 1); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); this.selectCell(r + 1, c); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); this.selectCell(r - 1, c); }
  }

  setLetter(r: number, c: number, letter: string) {
    const map = new Map(this.cells());
    const cell = map.get(`${r},${c}`);
    if (cell) { cell.userInput = letter; this.cells.set(map); }
  }

  moveNext(r: number, c: number) {
    const clue = this.selectedClue();
    if (!clue) return;
    const nr = clue.direction === 'DOWN' ? r + 1 : r;
    const nc = clue.direction === 'ACROSS' ? c + 1 : c;
    if (!this.isBlack(nr, nc)) this.selectCell(nr, nc);
  }

  movePrev(r: number, c: number) {
    const clue = this.selectedClue();
    if (!clue) return;
    const nr = clue.direction === 'DOWN' ? r - 1 : r;
    const nc = clue.direction === 'ACROSS' ? c - 1 : c;
    if (!this.isBlack(nr, nc)) this.selectCell(nr, nc);
  }

  // ─── Timer ─────────────────────────────────────────────────────────────────

  /**
   * Timer formula:
   * Base time by difficulty: easy=600s (10min), medium=1200s (20min), hard=1800s (30min)
   * Row adjustment: each row above/below the standard 15 adds/removes 30 seconds
   * Standard grid = 15 rows
   */
  calcTimer(gridSize: number, difficulty: string): number {
    const base = difficulty === 'easy' ? 600 : difficulty === 'hard' ? 1800 : 1200;
    const rowDiff = (gridSize - 15) * 30;   // +30s per extra row, -30s per fewer row
    return Math.max(120, base + rowDiff);    // minimum 2 minutes
  }

  startTimer(seconds = 300) {
    this.timeRemaining.set(seconds);
    this.timerActive.set(true);
    this.timerInterval = setInterval(() => {
      const r = this.timeRemaining() - 1;
      this.timeRemaining.set(r);
      if (r <= 0) { this.stopTimer(); this.checkAnswers(); }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerActive.set(false);
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // ─── Submit & Score ────────────────────────────────────────────────────────

  checkAnswers() {
    this.stopTimer();
    let correct = 0;
    let xp = 0;

    for (const clue of this.clues()) {
      let wordCorrect = true;
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === 'DOWN' ? clue.startRow + i : clue.startRow;
        const c = clue.direction === 'ACROSS' ? clue.startCol + i : clue.startCol;
        const cell = this.cells().get(`${r},${c}`);
        if (!cell || cell.userInput !== cell.letter) { wordCorrect = false; break; }
      }
      if (wordCorrect) { correct++; xp += 10; }
    }

    this.correctWords.set(correct);
    this.xpEarned.set(xp);
    this.showResults.set(true);

    // Save accuracy to localStorage so games list can show it
    const accuracy = this.clues().length > 0 ? (correct / this.clues().length) * 100 : 0;
    localStorage.setItem('crossword_last_accuracy', accuracy.toFixed(1));

    // Award XP via backend session
    if (xp > 0) {
      this.http.post('http://localhost:9001/api/submissions', {
        gameId: 0,
        userId: 'default-user',
        answers: {},
        completionTime: Math.floor((Date.now() - this.startTime) / 1000),
        scoreOverride: xp,
        correctOverride: correct,
        totalOverride: this.clues().length
      }).subscribe({ error: () => {} });
    }
  }

  get acrossClues(): Clue[] { return this.clues().filter(c => c.direction === 'ACROSS'); }
  get downClues(): Clue[] { return this.clues().filter(c => c.direction === 'DOWN'); }

  get answeredCount(): number {
    let count = 0;
    for (const clue of this.clues()) {
      let done = true;
      for (let i = 0; i < clue.length; i++) {
        const r = clue.direction === 'DOWN' ? clue.startRow + i : clue.startRow;
        const c = clue.direction === 'ACROSS' ? clue.startCol + i : clue.startCol;
        if (!this.cells().get(`${r},${c}`)?.userInput) { done = false; break; }
      }
      if (done) count++;
    }
    return count;
  }

  playAgain() { this.loadNewPuzzle(); }
  goHome() { this.router.navigate(['/games']); }
}
