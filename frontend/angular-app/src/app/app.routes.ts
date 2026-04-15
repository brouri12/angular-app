import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { Feedbacks } from './pages/feedbacks/feedbacks';
import { Reclamations } from './pages/reclamations/reclamations';
import { AuthService } from './services/auth.service';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

const studentGuard: CanActivateFn = () => {
  return inject(AuthService).hasRole('student')();
};

const tuteurGuard: CanActivateFn = () => {
  return inject(AuthService).hasRole('tuteur')();
};

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'feedbacks', component: Feedbacks },
  { path: 'reclamations', component: Reclamations },
  {
    path: 'student',
    canActivate: [studentGuard],
    children: [
      {
        path: 'challenges',
        loadComponent: () =>
          import('./pages/pronunciation/student/challengeList/challengeList.component').then(
            (m) => m.ChallengeListComponent
          ),
      },
      {
        path: 'challenges/:id',
        loadComponent: () =>
          import('./pages/pronunciation/student/challengeDetails/challengeDetails.component').then(
            (m) => m.ChallengeDetailComponent
          ),
      },
      {
        path: 'my-recordings',
        loadComponent: () =>
          import('./pages/pronunciation/student/myRecordings/myRecordings.component').then(
            (m) => m.MyRecordingsComponent
          ),
      },
      { path: '', redirectTo: 'challenges', pathMatch: 'full' },
    ],
  },
 
  // ── Tuteur routes ───────────────────────────────────────────────────────────
  {
    path: 'tuteur',
    canActivate: [tuteurGuard],
    children: [
      {
        path: 'challenges',
        loadComponent: () =>
          import('./pages/pronunciation/tuteur/manageChallenges/manageChallenges.component').then(
            (m) => m.ManageChallengesComponent
          ),
      },
      {
        path: 'results/:id',
        loadComponent: () =>
          import('./pages/pronunciation/tuteur/studentResults/studentResults.component').then(
            (m) => m.StudentResultsComponent
          ),
      },
      { path: '', redirectTo: 'challenges', pathMatch: 'full' },
    ],
  },
{ path: 'leaderboard', loadComponent: () => import('./pages/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent) },
  { path: '**', redirectTo: '' }
];



