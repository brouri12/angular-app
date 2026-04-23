import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { Profile } from './pages/profile/profile';
import { Subscription } from './pages/subscription/subscription';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'profile', component: Profile },
  { path: 'subscription', component: Subscription },
  { path: '**', redirectTo: '' }
];
