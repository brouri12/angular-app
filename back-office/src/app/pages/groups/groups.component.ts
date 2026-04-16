import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanificationService } from '../../services/planification.service';
import { UserService, User } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Group, StudentLevel } from '../../models/planification.model';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, concatMap } from 'rxjs/operators';

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

    // Form model for manual creation
    showAddForm = true;
    newGroupLevel: StudentLevel = StudentLevel.BEGINNER;
    newGroupTeacherId: number | undefined;
    newGroupStudentIds: number[] = [];

    // Track selected student per group
    selectedStudents: { [groupId: number]: number[] } = {};

    // Mapping of selected teacher for each group id
    selectedTeachers: { [groupId: number]: number } = {};

    // Edit state for group level
    editingGroupId: number | null = null;
    editingGroupLevel: StudentLevel = StudentLevel.BEGINNER;

    levels = Object.values(StudentLevel);

    constructor(
        private planifService: PlanificationService,
        private userService: UserService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.error = null;

        forkJoin({
            groups: this.planifService.getGroups(),
            teachers: this.userService.getUsersByRole('TEACHER').pipe(catchError(() => of([]))),
            students: this.userService.getUsersByRole('STUDENT').pipe(catchError(() => of([])))
        }).subscribe({
            next: (data) => {
                this.groups = data.groups;
                this.teachers = data.teachers;
                this.students = data.students;

                this.groups.forEach(g => {
                    if (g.studentIds == null) g.studentIds = [];
                    if (g.teacherId) {
                        this.selectedTeachers[g.id!] = g.teacherId;
                    }
                });

                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load groups. Run backend.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    // Refresh data without showing loading spinner
    refreshData(): void {
        forkJoin({
            groups: this.planifService.getGroups(),
            teachers: this.userService.getUsersByRole('TEACHER').pipe(catchError(() => of([]))),
            students: this.userService.getUsersByRole('STUDENT').pipe(catchError(() => of([])))
        }).subscribe({
            next: (data) => {
                this.groups = data.groups;
                this.teachers = data.teachers;
                this.students = data.students;

                this.groups.forEach(g => {
                    if (g.studentIds == null) g.studentIds = [];
                    if (g.teacherId) {
                        this.selectedTeachers[g.id!] = g.teacherId;
                    }
                });
            },
            error: (err) => {
                console.error('Failed to refresh data:', err);
            }
        });
    }

    startEditGroup(group: Group): void {
        this.editingGroupId = group.id!;
        this.editingGroupLevel = group.level;
    }

    cancelEditGroup(): void {
        this.editingGroupId = null;
    }

    saveEditGroup(groupId: number): void {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return;
        const updated: Group = { ...group, level: this.editingGroupLevel };
        this.planifService.updateGroup(groupId, updated).subscribe({
            next: (result) => {
                this.editingGroupId = null;
                this.refreshData(); // Refresh without loading spinner
            },
            error: (err) => {
                this.notificationService.error('Failed to update group: ' + (err.error?.message || err.message));
            }
        });
    }

    autoCreateGroups(): void {
        if (!confirm('This will auto-create groups based on unassigned students levels. Proceed?')) return;
        this.actionLoading = true;

        let totalCreated = 0;
        let pendingRequests = 0;

        // Bucket by level
        const levels = Object.values(StudentLevel);

        levels.forEach(level => {
            const unassigned = this.getStudentsForNewGroup(level);
            if (unassigned.length > 0) {
                pendingRequests++;

                const group: Group = { level: level };
                this.planifService.createGroup(group).pipe(
                    switchMap(newGroup => {
                        // After creating the group, add all the unassigned students
                        const addTasks = unassigned.map(s =>
                            this.planifService.addStudentToGroup(newGroup.id!, s.id_user)
                        );
                        if (addTasks.length === 0) return of(newGroup);
                        return forkJoin(addTasks);
                    })
                ).subscribe({
                    next: () => {
                        totalCreated++;
                        pendingRequests--;
                        if (pendingRequests === 0) {
                            this.notificationService.success(`${totalCreated} new groups created and populated automatically.`);
                            this.refreshData();
                            this.actionLoading = false;
                        }
                    },
                    error: (err) => {
                        console.error('Failed to auto-create group processing:', err);
                        pendingRequests--;
                        if (pendingRequests === 0) {
                            this.refreshData();
                            this.actionLoading = false;
                        }
                    }
                });
            }
        });

        if (pendingRequests === 0) {
            this.notificationService.info('No unassigned students found to group.');
            this.actionLoading = false;
        }
    }

    assignTeacher(groupId: number): void {
        const teacherId = this.selectedTeachers[groupId];
        if (!teacherId) {
            this.notificationService.warning('Please select a teacher');
            return;
        }

        this.actionLoading = true;
        this.planifService.assignTeacherToGroup(groupId, teacherId).subscribe({
            next: (updatedGroup) => {
                this.refreshData(); // Refresh without loading spinner
                this.notificationService.success('Teacher assigned successfully!');
                this.actionLoading = false;
            },
            error: (err) => {
                this.notificationService.error('Failed to assign teacher: ' + err.message);
                this.actionLoading = false;
            }
        });
    }

    assignStudents(groupId: number): void {
        const studentIds = this.selectedStudents[groupId];
        if (!studentIds || studentIds.length === 0) {
            this.notificationService.warning('Please select at least one student');
            return;
        }

        this.actionLoading = true;
        this.planifService.assignStudentsToGroup(groupId, studentIds).subscribe({
            next: (updatedGroup) => {
                this.selectedStudents[groupId] = [];
                this.refreshData(); // Refresh without loading spinner
                this.notificationService.success('Students added successfully!');
                this.actionLoading = false;
            },
            error: (err) => {
                this.notificationService.error('Failed to add students: ' + (err.error?.message || err.message));
                this.actionLoading = false;
            }
        });
    }

    createManualGroup(): void {
        this.actionLoading = true;
        
        // Create group WITHOUT teacher first
        const group: Group = { level: this.newGroupLevel };
        if (this.newGroupStudentIds && this.newGroupStudentIds.length > 0) {
            group.studentIds = this.newGroupStudentIds;
        }

        this.planifService.createGroup(group).subscribe({
            next: (newGroup) => {
                // If teacher was selected, assign it AFTER group creation
                if (this.newGroupTeacherId && newGroup.id) {
                    this.planifService.assignTeacherToGroup(newGroup.id, this.newGroupTeacherId).subscribe({
                        next: () => {
                            this.newGroupTeacherId = undefined;
                            this.newGroupStudentIds = [];
                            this.refreshData();
                            this.notificationService.success('Group created and teacher assigned successfully!');
                            this.actionLoading = false;
                        },
                        error: (err) => {
                            this.notificationService.warning('Group created but failed to assign teacher: ' + err.message);
                            this.newGroupTeacherId = undefined;
                            this.newGroupStudentIds = [];
                            this.refreshData();
                            this.actionLoading = false;
                        }
                    });
                } else {
                    // No teacher selected, just finish
                    this.newGroupTeacherId = undefined;
                    this.newGroupStudentIds = [];
                    this.refreshData();
                    this.notificationService.success('Group created successfully!');
                    this.actionLoading = false;
                }
            },
            error: (err) => {
                this.notificationService.error('Failed to create group: ' + err.message);
                this.actionLoading = false;
            }
        });
    }

    toggleNewGroupStudent(studentId: number, event: any): void {
        if (event.target.checked) {
            if (!this.newGroupStudentIds.includes(studentId)) {
                this.newGroupStudentIds.push(studentId);
            }
        } else {
            this.newGroupStudentIds = this.newGroupStudentIds.filter(id => id !== studentId);
        }
    }

    toggleGroupStudent(groupId: number, studentId: number, event: any): void {
        if (!this.selectedStudents[groupId]) {
            this.selectedStudents[groupId] = [];
        }
        if (event.target.checked) {
            if (!this.selectedStudents[groupId].includes(studentId)) {
                this.selectedStudents[groupId].push(studentId);
            }
        } else {
            this.selectedStudents[groupId] = this.selectedStudents[groupId].filter(id => id !== studentId);
        }
    }

    deleteGroup(id: number | undefined): void {
        if (!id) return;
        if (confirm('Are you sure you want to delete this group?')) {
            this.planifService.deleteGroup(id).subscribe({
                next: () => {
                    this.refreshData(); // Refresh without loading spinner
                },
                error: (err) => {
                    this.notificationService.error('Failed to delete group: ' + err.message);
                }
            });
        }
    }

    getStudentsInGroup(groupId: number): User[] {
        const group = this.groups.find(g => g.id === groupId);
        if (!group || !group.studentIds) return [];
        return this.students.filter(s => group.studentIds!.includes(s.id_user));
    }

    // For the creation form: show ALL students of matching level (none assigned yet)
    getStudentsForNewGroup(level: string): User[] {
        const allAssignedIds = new Set<number>();
        this.groups.forEach(g => {
            if (g.studentIds) g.studentIds.forEach(id => allAssignedIds.add(id));
        });
        const result = this.students.filter(s =>
            s.niveau_actuel?.trim().toUpperCase() === level.trim().toUpperCase() &&
            !allAssignedIds.has(s.id_user)
        );
        console.log('[DEBUG] getStudentsForNewGroup level=' + level + ' students:', result);
        return result;
    }

    // For existing group cards: show students of matching level NOT already in this group
    getUnassignedStudents(groupId: number, level: string): User[] {
        const group = this.groups.find(g => g.id === groupId);
        const alreadyIn = new Set<number>(group?.studentIds ?? []);
        return this.students.filter(s =>
            s.niveau_actuel?.trim().toUpperCase() === level.trim().toUpperCase() &&
            !alreadyIn.has(s.id_user)
        );
    }

    getTeacherName(teacherId: number): string {
        const teacher = this.teachers.find(t => t.id_user === teacherId);
        if (teacher) {
            return `${teacher.prenom} ${teacher.nom}`;
        }
        return '';
    }
}
