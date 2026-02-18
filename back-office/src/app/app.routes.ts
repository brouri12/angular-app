import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Users } from './pages/users/users';
import { Analytics } from './pages/analytics/analytics';
import { ForumComponent } from './pages/forum/forum';
import { RecrutementComponent } from './pages/recrutement/recrutement';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'courses', component: Courses },
  { path: 'users', component: Users },
  { path: 'analytics', component: Analytics },
  { path: 'forum', component: ForumComponent },
  { path: 'recrutement', component: RecrutementComponent },
  { path: '**', redirectTo: '/dashboard' }
];
