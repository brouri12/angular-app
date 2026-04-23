import { Routes } from '@angular/router';
import { Student } from './pages/student/student';
import { Teacher } from './pages/teacher/teacher';

export const routes: Routes = [
  { path: '', redirectTo: 'student', pathMatch: 'full' },
  { path: 'student', component: Student },
  { path: 'teacher', component: Teacher },
  { path: '**', redirectTo: 'student' }
];
