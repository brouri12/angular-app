import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Users } from './pages/users/users';
import { Analytics } from './pages/analytics/analytics';
import { Subscriptions } from './pages/subscriptions/subscriptions';
import { Profile } from './pages/profile/profile';
import { Payments } from './pages/payments/payments';
import { ReviewsPage } from './pages/reviews/reviews';
import { BusinessIntelPage } from './pages/business-intel/business-intel';
import { MaterialsPage } from './pages/materials/materials';
import { QuestionsPage } from './pages/questions/questions';
import { ResponsesPage } from './pages/responses/responses';
import { EnrollmentsPage } from './pages/enrollments/enrollments';
import { AwardBadgePage } from './pages/award-badge/award-badge';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'subscriptions', component: Subscriptions },
  { path: 'payments', component: Payments },
  { path: 'courses', component: Courses },
  { path: 'users', component: Users },
  { path: 'analytics', component: Analytics },
  { path: 'reviews', component: ReviewsPage },
  { path: 'business-intel', component: BusinessIntelPage },
  { path: 'materials', component: MaterialsPage },
  { path: 'questions', component: QuestionsPage },
  { path: 'responses', component: ResponsesPage },
  { path: 'enrollments', component: EnrollmentsPage },
  { path: 'award-badge', component: AwardBadgePage },
  { path: 'profile', component: Profile },
  { path: '**', redirectTo: '/dashboard' }
];
