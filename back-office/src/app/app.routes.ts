import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Users } from './pages/users/users';
import { Analytics } from './pages/analytics/analytics';
import { Subscriptions } from './pages/subscriptions/subscriptions';
import { Profile } from './pages/profile/profile';
import { Payments } from './pages/payments/payments';
import { Challenges } from './pages/challenges/challenges';
import { SallesComponent } from './pages/salles/salles.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { PlanificationsComponent } from './pages/planifications/planifications.component';
import { RoomAnalyticsComponent } from './pages/room-analytics/room-analytics.component';

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
  { path: 'salles', component: SallesComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'planifications', component: PlanificationsComponent },
  { path: 'room-analytics', component: RoomAnalyticsComponent },

  // ── Events (Mahdi) ─────────────────────────────────────────────────────────
  {
    path: 'events',
    loadComponent: () => import('./pages/events-admin/events').then(m => m.Events),
    children: [
      { path: 'new', loadComponent: () => import('./pages/events-admin/event-form-page').then(m => m.EventFormPage) },
      { path: ':id/edit', loadComponent: () => import('./pages/events-admin/event-form-page').then(m => m.EventFormPage) },
    ]
  },

  // ── Clubs (Mahdi) ──────────────────────────────────────────────────────────
  {
    path: 'clubs',
    loadComponent: () => import('./pages/clubs-admin/clubs.component').then(m => m.ClubsComponent),
    children: [
      { path: 'new', loadComponent: () => import('./pages/clubs-admin/club-form-page').then(m => m.ClubFormPage) },
      { path: ':id/edit', loadComponent: () => import('./pages/clubs-admin/club-form-page').then(m => m.ClubFormPage) },
    ]
  },

  // ── Members (Mahdi) ────────────────────────────────────────────────────────
  { path: 'members', loadComponent: () => import('./pages/members-admin/members.page').then(m => m.MembersPage) },

  // ── Registrations (Mahdi) ──────────────────────────────────────────────────
  {
    path: 'registrations',
    loadComponent: () => import('./pages/registrations-admin/registrations.component').then(m => m.RegistrationsComponent),
    children: [
      { path: ':id/edit', loadComponent: () => import('./pages/registrations-admin/registration-edit.component').then(m => m.RegistrationEditComponent) },
    ]
  },

  // ── Forum & Recrutement (Rahma) ────────────────────────────────────────────
  { path: 'forum', loadComponent: () => import('./pages/forum/forum').then(m => m.ForumComponent) },
  { path: 'recrutement', loadComponent: () => import('./pages/recrutement/recrutement').then(m => m.RecrutementComponent) },

  { path: '**', redirectTo: '/dashboard' }
];
