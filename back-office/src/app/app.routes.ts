import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'subscriptions', loadComponent: () => import('./pages/subscriptions/subscriptions').then(m => m.Subscriptions) },
  { path: 'payments', loadComponent: () => import('./pages/payments/payments').then(m => m.Payments) },
  { path: 'courses', loadComponent: () => import('./pages/courses/courses').then(m => m.Courses) },
  { path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.Users) },
  { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics').then(m => m.Analytics) },
  { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },

  // ✅ EVENTS
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events').then(m => m.Events),
    children: [
      { path: 'new', loadComponent: () => import('./pages/events/event-form-page').then(m => m.EventFormPage) },
      { path: ':id/edit', loadComponent: () => import('./pages/events/event-form-page').then(m => m.EventFormPage) },
    ],
  },

  // ✅ CLUBS
  {
    path: 'clubs',
    loadComponent: () => import('./pages/Club/clubs.component').then(m => m.ClubsComponent),
    children: [
      { path: 'new', loadComponent: () => import('./pages/Club/club-form-page').then(m => m.ClubFormPage) },
      { path: ':id/edit', loadComponent: () => import('./pages/Club/club-form-page').then(m => m.ClubFormPage) },
    ],
  },

  // ✅ REGISTRATIONS
  {
    path: 'registrations',
    loadComponent: () => import('./pages/reservation/registrations.component').then(m => m.RegistrationsComponent),
    children: [
      { path: ':id/edit', loadComponent: () => import('./pages/reservation/registration-edit.component').then(m => m.RegistrationEditComponent) },
    ],
  },

  // ✅ MEMBERS (NEW)
  {
    path: 'members',
    loadComponent: () => import('./pages/members/members.page').then(m => m.MembersPage),
  },

  { path: '**', redirectTo: 'dashboard' },
];