import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlanificationService } from '../../services/planification.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Group, Planification } from '../../models/planification.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-groups.html',
  styleUrls: ['./my-groups.css']
})
export class MyGroups implements OnInit {
  private authService = inject(AuthService);
  private planificationService = inject(PlanificationService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser: User | null = null;
  myGroup: Group | null = null;
  groupMembers: User[] = [];
  teacher: User | null = null;
  schedules: Planification[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  downloadCalendar(): void {
    if (!this.currentUser?.id_user) return;
    const url = this.planificationService.getStudentCalendarPdfUrl(this.currentUser.id_user);
    window.open(url, '_blank');
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.currentUser = this.authService.getCurrentUserValue();

    if (!this.currentUser) {
      this.error = 'Please login to view your group';
      this.loading = false;
      return;
    }

    if (this.currentUser.role !== 'STUDENT') {
      this.error = 'This page is only for students';
      this.loading = false;
      return;
    }

    forkJoin({
      groups:    this.planificationService.getGroups().pipe(catchError(() => of([]))),
      users:     this.userService.getAllUsers().pipe(catchError(() => of([]))),
      schedules: this.planificationService.getPlanifications().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        // Find student's group
        this.myGroup = data.groups.find((g: Group) =>
          g.studentIds?.includes(this.currentUser!.id_user!)
        ) || null;

        if (this.myGroup) {
          // Get group members (other students)
          this.groupMembers = data.users.filter((u: User) =>
            this.myGroup!.studentIds?.includes(u.id_user!) &&
            u.id_user !== this.currentUser!.id_user
          );

          // Get teacher
          if (this.myGroup.teacherId) {
            this.teacher = data.users.find((u: User) => u.id_user === this.myGroup!.teacherId) || null;
          }

          // Get group schedules
          this.schedules = data.schedules.filter((s: Planification) => s.groupId === this.myGroup!.id);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load group information. Please make sure PlanificationService is running.';
        this.loading = false;
      }
    });
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'BEGINNER':     return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800';
      case 'ADVANCED':     return 'bg-purple-100 text-purple-800';
      default:             return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'COURS':   return 'bg-blue-100 text-blue-800';
      case 'EXAMEN':  return 'bg-red-100 text-red-800';
      case 'REUNION': return 'bg-yellow-100 text-yellow-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return timeString.substring(0, 5); // HH:MM
  }
}
