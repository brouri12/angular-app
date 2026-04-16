import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { GamesComponent } from './pages/games/games';
import { GamePlay } from './pages/game-play/game-play';
import { ProgressiveQuizComponent } from './pages/progressive-quiz/progressive-quiz';
import { GameResults } from './pages/game-results/game-results';
import { Register } from './pages/register/register';
import { ProgressPage } from './pages/progress/progress';
import { CrosswordPage } from './pages/crossword/crossword';
import { ScoreboardPage } from './pages/scoreboard/scoreboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'games', component: GamesComponent },
  { path: 'games/:id/play', component: GamePlay },
  { path: 'crossword', component: CrosswordPage },
  { path: 'quiz/:id', component: ProgressiveQuizComponent },
  { path: 'results', component: GameResults },
  { path: 'register', component: Register },
  { path: 'progress', component: ProgressPage },
  { path: 'scoreboard', component: ScoreboardPage },
  { path: '**', redirectTo: '' }
];
