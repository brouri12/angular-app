import { Routes } from '@angular/router';
import { GamesAdmin } from './pages/games-admin/games-admin';
import { Analytics } from './pages/analytics/analytics';
import { AddQuestion } from './pages/add-question/add-question';

export const routes: Routes = [
  { path: '', redirectTo: '/games', pathMatch: 'full' },
  { path: 'games', component: GamesAdmin },
  { path: 'analytics', component: Analytics },
  { path: 'add-question', component: AddQuestion },
  { path: '**', redirectTo: '/games' }
];
