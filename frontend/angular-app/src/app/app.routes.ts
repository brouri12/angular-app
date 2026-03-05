import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Courses } from './pages/courses/courses';
import { About } from './pages/about/about';
import { Pricing } from './pages/pricing/pricing';
import { Profile } from './pages/profile/profile';
import { Subscription } from './pages/subscription/subscription';
import { TestNotifications } from './pages/test-notifications/test-notifications';
import { Challenges } from './pages/challenges/challenges';
import { ChallengeDetail } from './pages/challenge-detail/challenge-detail';
import { ChallengeResult } from './pages/challenge-result/challenge-result';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'courses', component: Courses },
  { path: 'about', component: About },
  { path: 'pricing', component: Pricing },
  { path: 'profile', component: Profile },
  { path: 'subscription', component: Subscription },
  { path: 'challenges', component: Challenges },
  { path: 'challenge/:id', component: ChallengeDetail },
  { path: 'challenge-result/:id', component: ChallengeResult },
  { path: 'test-notifications', component: TestNotifications },
  { path: '**', redirectTo: '' }
];
