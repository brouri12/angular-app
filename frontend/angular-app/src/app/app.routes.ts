import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { Profile } from './pages/profile/profile';
import { Subscription } from './pages/subscription/subscription';
import { Events } from './pages/events/events';
import { ClubComponent } from './pages/club/club.component'; // ✅ IMPORT
import { MyRegistrationsComponent } from './pages/reservation/my-registrations.component';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'events', component: Events },
  { path: 'clubs', component: ClubComponent },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'profile', component: Profile },
  { path: 'subscription', component: Subscription },

  {
    path: 'registrations/new/:eventId',
    loadComponent: () =>
      import('./pages/reservation/registration-form.component')
        .then(m => m.RegistrationFormComponent),
  },

  { path: 'my-registrations', component: MyRegistrationsComponent },

  { path: '**', redirectTo: '' }
];
