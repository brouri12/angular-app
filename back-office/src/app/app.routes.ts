import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Users } from './pages/users/users';
import { Analytics } from './pages/analytics/analytics';
import { Feedbacks } from './pages/feedbacks/feedbacks';
import { Reclamations } from './pages/reclamations/reclamations';
import { Resolutions } from './pages/resolutions/resolutions';
import { FeedbackDetail } from './pages/feedbacks/feedback-detail/feedback-detail';
import { ReclamationDetail } from './pages/reclamations/reclamation-detail';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'courses', component: Courses },
  { path: 'users', component: Users },
  { path: 'analytics', component: Analytics },
  { path: 'feedbacks', component: Feedbacks },
  { path: 'feedbacks/:id', component: FeedbackDetail },
  { path: 'reclamations', component: Reclamations },
  { path: 'reclamations/new', redirectTo: 'reclamations', pathMatch: 'full' },
  { path: 'reclamations/:id', component: ReclamationDetail },
  { path: 'resolutions', component: Resolutions },
  { path: '**', redirectTo: '/dashboard' }
];
