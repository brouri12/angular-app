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

// Pronunciation Admin Routes
import { PronunciationAdminListComponent } from './pages/admin-pronunciation/admin-pronunciation-list.component';
import { PronunciationStudentProfileComponent } from './pages/admin-pronunciation/student-profile.component';

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
  
{
    path: 'admin',
    children: [
      {
        path: 'pronunciation',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin-pronunciation/admin-pronunciation-list.component')
              .then(m => m.PronunciationAdminListComponent),
            title: 'Admin - Défis de Prononciation'
          },
          {
            path: 'new',
            loadComponent: () => import('./components/modal/create-challenge.component')
              .then(m => m.CreateChallengeModalComponent),   
            title: 'Créer un nouveau défi'
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/modal/edit-challenge.component')
              .then(m => m.EditChallengeComponent),
            title: 'Modifier le défi'
          }
        ]
      }
    ]
  },
  
  { path: '**', redirectTo: '/dashboard' }
];

