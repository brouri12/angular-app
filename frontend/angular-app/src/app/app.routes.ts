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
import { ChallengeStats } from './pages/challenge-stats/challenge-stats';
import { MyGroups } from './pages/my-groups/my-groups';
import { Events } from './pages/events/events';
import { ClubComponent } from './pages/club/club.component';
import { MyRegistrationsComponent } from './pages/reservation/my-registrations.component';
import { ForumsPublicComponent } from './pages/forums-public/forums-public';
import { RecrutementPublicComponent } from './pages/recrutement-public/recrutement-public';

// -- Library (Hsaya) ----------------------------------------------------------
import { LibraryPage } from './pages/library/library';
import { BookDetailPage } from './pages/book-detail/book-detail';
import { ReservationsPage } from './pages/reservations/reservations';

// -- Games (Hsaya) ------------------------------------------------------------
import { GamesPage } from './pages/games/games';
import { GamePlayPage } from './pages/game-play/game-play';
import { GameResultsPage } from './pages/game-results/game-results';
import { ScoreboardPage } from './pages/scoreboard/scoreboard';
import { CrosswordPage } from './pages/crossword/crossword';
import { WordLadderPage } from './pages/word-ladder/word-ladder';

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
  { path: 'challenge-stats', component: ChallengeStats },
  { path: 'my-groups', component: MyGroups },
  { path: 'events', component: Events },
  { path: 'clubs', component: ClubComponent },
  { path: 'my-registrations', component: MyRegistrationsComponent },
  {
    path: 'registrations/new/:eventId',
    loadComponent: () =>
      import('./pages/reservation/registration-form.component')
        .then(m => m.RegistrationFormComponent)
  },
  { path: 'test-notifications', component: TestNotifications },
  // -- Forum & Recrutement (Rahma) ------------------------------------------
  { path: 'forums', component: ForumsPublicComponent },
  { path: 'recrutement', component: RecrutementPublicComponent },
  // -- Library (Hsaya) -----------------------------------------------------
  { path: 'library', component: LibraryPage },
  { path: 'library/:id', component: BookDetailPage },
  { path: 'my-reservations', component: ReservationsPage },
  // -- Games (Hsaya) --------------------------------------------------------
  { path: 'games', component: GamesPage },
  { path: 'games/play/:id', component: GamePlayPage },
  { path: 'games/results/:id', component: GameResultsPage },
  { path: 'scoreboard', component: ScoreboardPage },
  { path: 'crossword', component: CrosswordPage },
  { path: 'word-ladder', component: WordLadderPage },
  { path: '**', redirectTo: '' }
];
