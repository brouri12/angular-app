import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Users } from './pages/users/users';
import { Analytics } from './pages/analytics/analytics';
import { Subscriptions } from './pages/subscriptions/subscriptions';
import { Profile } from './pages/profile/profile';
import { Payments } from './pages/payments/payments';
import { Challenges } from './pages/challenges/challenges';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'subscriptions', component: Subscriptions },
  { path: 'payments', component: Payments },
  { path: 'courses', component: Courses },
  { path: 'challenges', component: Challenges },
  { path: 'users', component: Users },
  { path: 'analytics', component: Analytics },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: '/dashboard' }
];
