import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { Feedbacks } from './pages/feedbacks/feedbacks';
import { Reclamations } from './pages/reclamations/reclamations';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'feedbacks', component: Feedbacks },
  { path: 'reclamations', component: Reclamations },
  { path: '**', redirectTo: '' }
];
