import { Routes } from '@angular/router';
import { GamesAdmin } from './pages/games-admin/games-admin';
import { Analytics } from './pages/analytics/analytics';
import { AddQuestion } from './pages/add-question/add-question';
import { LibraryAdmin } from './pages/library-admin/library-admin';
import { ReservationsAdmin } from './pages/reservations-admin/reservations-admin';
import { LoansAdmin } from './pages/loans-admin/loans-admin';

export const routes: Routes = [
  { path: '', redirectTo: '/games', pathMatch: 'full' },
  { path: 'games', component: GamesAdmin },
  { path: 'analytics', component: Analytics },
  { path: 'add-question', component: AddQuestion },
  { path: 'library', component: LibraryAdmin },
  { path: 'reservations', component: ReservationsAdmin },
  { path: 'loans', component: LoansAdmin },
  { path: '**', redirectTo: '/games' }
];
