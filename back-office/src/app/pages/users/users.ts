import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

interface DisplayUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  enrolledCourses: number;
  joinDate: string;
  avatar: string;
  username: string;
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users = signal<DisplayUser[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedRole = 'all';
  selectedStatus = 'all';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAllUsers().subscribe({
      next: (apiUsers: User[]) => {
        const displayUsers: DisplayUser[] = apiUsers.map(user => ({
          id: user.id_user,
          name: this.getFullName(user),
          email: user.email,
          role: this.formatRole(user.role),
          status: user.enabled ? 'active' : 'inactive',
          enrolledCourses: 0, // TODO: Get from courses service when available
          joinDate: this.formatDate(user.date_creation),
          avatar: this.getAvatarUrl(user),
          username: user.username
        }));
        this.users.set(displayUsers);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error.set('Failed to load users. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private getFullName(user: User): string {
    if (user.nom && user.prenom) {
      return `${user.prenom} ${user.nom}`;
    }
    return user.username;
  }

  private formatRole(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'TEACHER': return 'Instructor';
      case 'STUDENT': return 'Student';
      default: return role;
    }
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private getAvatarUrl(user: User): string {
    const name = this.getFullName(user);
    const color = user.role === 'TEACHER' ? 'ff7f50' : '00c897';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff`;
  }

  get filteredUsers() {
    return this.users().filter(user => {
      const roleMatch = this.selectedRole === 'all' || user.role.toLowerCase() === this.selectedRole.toLowerCase();
      const statusMatch = this.selectedStatus === 'all' || user.status === this.selectedStatus;
      return roleMatch && statusMatch;
    });
  }

  editUser(user: DisplayUser) {
    console.log('Edit user:', user);
    // TODO: Implement edit functionality
    alert(`Edit functionality for ${user.name} will be implemented soon.`);
  }

  deleteUser(user: DisplayUser) {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        alert(`User ${user.name} deleted successfully!`);
        this.loadUsers(); // Reload the list
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('Failed to delete user. Please try again.');
      }
    });
  }

  toggleUserStatus(user: DisplayUser) {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: () => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        alert(`User ${user.name} is now ${newStatus}!`);
        this.loadUsers(); // Reload the list
      },
      error: (err) => {
        console.error('Error toggling user status:', err);
        alert('Failed to update user status. Please try again.');
      }
    });
  }
}
