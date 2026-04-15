import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { Profile } from './pages/profile/profile';
import { Subscription } from './pages/subscription/subscription';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'profile', component: Profile },
  { path: 'subscription', component: Subscription },
  { path: '**', redirectTo: '' }
];
