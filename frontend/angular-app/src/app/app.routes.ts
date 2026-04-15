import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { ForumsPublicComponent } from './pages/forums-public/forums-public';
import { RecrutementPublicComponent } from './pages/recrutement-public/recrutement-public';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'forums', component: ForumsPublicComponent },
  { path: 'recrutement', component: RecrutementPublicComponent },
  { path: '**', redirectTo: '' }
];
