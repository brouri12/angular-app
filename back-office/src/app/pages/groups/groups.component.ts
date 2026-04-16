import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanificationService } from '../../services/planification.service';
import { UserService, User } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Group, StudentLevel } from '../../models/planification.model';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  teachers: User[] = [];
  students: User[] = [];

  loading = true;
  actionLoading = false;
  error: string | null = null;

  showAddForm = true;
  newGroupLevel: StudentLevel = StudentLevel.BEGINNER;
  newGroupTeacherId: number | undefined;
  newGroupStudentIds: number[] = [];

  selectedStudents: { [groupId: number]: number[] } = {};
  selectedTeachers: { [groupId: number]: number } = {};

  editingGroupId: number | null = null;
  editingGroupLevel: StudentLevel = StudentLevel.BEGINNER;

  levels = Object.values(StudentLevel);

  constructor(
    private planifService: PlanificationService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    forkJoin({
      groups:   this.planifService.getGroups(),
      teachers: this.userService.getUsersByRole('TEACHER').pipe(catchError(() => of([]))),
      students: this.userService.getUsersByRole('STUDENT').pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.groups = data.groups;
        this.teachers = data.teachers;
        this.students = data.students;
        this.groups.forEach(g => {
          if (!g.studentIds) g.studentIds = [];
          if (g.teacherId) this.selectedTeachers[g.id!] = g.teacherId;
        });
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load groups. Make sure PlanificationService is running.'; this.loading = false; }
    });
  }

  refreshData(): void {
    forkJoin({
      groups:   this.planifService.getGroups(),
      teachers: this.userService.getUsersByRole('TEACHER').pipe(catchError(() => of([]))),
      students: this.userService.getUsersByRole('STUDENT').pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.groups = data.groups;
        this.teachers = data.teachers;
        this.students = data.students;
        this.groups.forEach(g => {
          if (!g.studentIds) g.studentIds = [];
          if (g.teacherId) this.selectedTeachers[g.id!] = g.teacherId;
        });
      }
    });
  }

  startEditGroup(group: Group): void { this.editingGroupId = group.id!; this.editingGroupLevel = group.level; }
  cancelEditGroup(): void { this.editingGroupId = null; }

  saveEditGroup(groupId: number): void {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) return;
    this.planifService.updateGroup(groupId, { ...group, level: this.editingGroupLevel }).subscribe({
      next: () => { this.editingGroupId = null; this.refreshData(); },
      error: (err) => this.notificationService.error('Failed to update group: ' + (err.error?.message || err.message))
    });
  }

  autoCreateGroups(): void {
    if (!confirm('Auto-create groups based on unassigned student levels?')) return;
    this.actionLoading = true;
    let pending = 0;
    let created = 0;

    Object.values(StudentLevel).forEach(level => {
      const unassigned = this.getStudentsForNewGroup(level);
      if (unassigned.length > 0) {
        pending++;
        this.planifService.createGroup({ level }).pipe(
          switchMap(newGroup => {
            const tasks = unassigned.map(s => this.planifService.addStudentToGroup(newGroup.id!, s.id_user));
            return tasks.length ? forkJoin(tasks) : of(newGroup);
          })
        ).subscribe({
          next: () => { created++; pending--; if (pending === 0) { this.notificationService.success(`${created} groups created.`); this.refreshData(); this.actionLoading = false; } },
          error: () => { pending--; if (pending === 0) { this.refreshData(); this.actionLoading = false; } }
        });
      }
    });

    if (pending === 0) { this.notificationService.info('No unassigned students found.'); this.actionLoading = false; }
  }

  assignTeacher(groupId: number): void {
    const teacherId = this.selectedTeachers[groupId];
    if (!teacherId) { this.notificationService.warning('Please select a teacher'); return; }
    this.actionLoading = true;
    this.planifService.assignTeacherToGroup(groupId, teacherId).subscribe({
      next: () => { this.refreshData(); this.notificationService.success('Teacher assigned'); this.actionLoading = false; },
      error: (err) => { this.notificationService.error('Failed: ' + err.message); this.actionLoading = false; }
    });
  }

  assignStudents(groupId: number): void {
    const ids = this.selectedStudents[groupId];
    if (!ids?.length) { this.notificationService.warning('Select at least one student'); return; }
    this.actionLoading = true;
    this.planifService.assignStudentsToGroup(groupId, ids).subscribe({
      next: () => { this.selectedStudents[groupId] = []; this.refreshData(); this.notificationService.success('Students added'); this.actionLoading = false; },
      error: (err) => { this.notificationService.error('Failed: ' + (err.error?.message || err.message)); this.actionLoading = false; }
    });
  }

  createManualGroup(): void {
    this.actionLoading = true;
    const group: Group = { level: this.newGroupLevel };
    if (this.newGroupStudentIds.length) group.studentIds = this.newGroupStudentIds;

    this.planifService.createGroup(group).subscribe({
      next: (newGroup) => {
        if (this.newGroupTeacherId && newGroup.id) {
          this.planifService.assignTeacherToGroup(newGroup.id, this.newGroupTeacherId).subscribe({
            next: () => { this.resetNewGroup(); this.refreshData(); this.notificationService.success('Group created'); this.actionLoading = false; },
            error: () => { this.resetNewGroup(); this.refreshData(); this.notificationService.warning('Group created but teacher assignment failed.'); this.actionLoading = false; }
          });
        } else {
          this.resetNewGroup(); this.refreshData(); this.notificationService.success('Group created'); this.actionLoading = false;
        }
      },
      error: (err) => { this.notificationService.error('Failed: ' + err.message); this.actionLoading = false; }
    });
  }

  private resetNewGroup(): void { this.newGroupTeacherId = undefined; this.newGroupStudentIds = []; }

  toggleNewGroupStudent(studentId: number, event: any): void {
    if (event.target.checked) { if (!this.newGroupStudentIds.includes(studentId)) this.newGroupStudentIds.push(studentId); }
    else this.newGroupStudentIds = this.newGroupStudentIds.filter(id => id !== studentId);
  }

  toggleGroupStudent(groupId: number, studentId: number, event: any): void {
    if (!this.selectedStudents[groupId]) this.selectedStudents[groupId] = [];
    if (event.target.checked) { if (!this.selectedStudents[groupId].includes(studentId)) this.selectedStudents[groupId].push(studentId); }
    else this.selectedStudents[groupId] = this.selectedStudents[groupId].filter(id => id !== studentId);
  }

  deleteGroup(id: number | undefined): void {
    if (!id || !confirm('Delete this group?')) return;
    this.planifService.deleteGroup(id).subscribe({
      next: () => this.refreshData(),
      error: (err) => this.notificationService.error('Failed: ' + err.message)
    });
  }

  getStudentsInGroup(groupId: number): User[] {
    const group = this.groups.find(g => g.id === groupId);
    if (!group?.studentIds) return [];
    return this.students.filter(s => group.studentIds!.includes(s.id_user));
  }

  getStudentsForNewGroup(level: string): User[] {
    const allAssigned = new Set<number>();
    this.groups.forEach(g => g.studentIds?.forEach(id => allAssigned.add(id)));
    return this.students.filter(s =>
      s.niveau_actuel?.trim().toUpperCase() === level.trim().toUpperCase() && !allAssigned.has(s.id_user)
    );
  }

  getUnassignedStudents(groupId: number, level: string): User[] {
    const group = this.groups.find(g => g.id === groupId);
    const alreadyIn = new Set<number>(group?.studentIds ?? []);
    return this.students.filter(s =>
      s.niveau_actuel?.trim().toUpperCase() === level.trim().toUpperCase() && !alreadyIn.has(s.id_user)
    );
  }

  getTeacherName(teacherId: number): string {
    const t = this.teachers.find(t => t.id_user === teacherId);
    return t ? `${t.prenom} ${t.nom}` : '';
  }
}
