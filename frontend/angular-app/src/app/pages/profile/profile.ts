import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  user: User | null = null;
  isEditing = false;
  editForm: Partial<User> = {};
  loading = false;
  message = '';
  private sub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }
    this.sub = this.authService.currentUser$.subscribe((user: User | null) => {
      this.user = user;
      if (user) this.editForm = { ...user };
    });
    const current = this.authService.getCurrentUser();
    if (current) { this.user = current; this.editForm = { ...current }; }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.user) this.editForm = { ...this.user };
    this.message = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.message = '';
    if (this.user) this.editForm = { ...this.user };
  }

  saveProfile(): void {
    if (!this.user?.id_user) { this.message = 'Error: User not found'; return; }
    this.loading = true;
    this.message = '';

    const updateData: any = {
      username: this.user.username,
      email: this.user.email,
      role: this.user.role,
      nom: this.editForm.nom || '',
      prenom: this.editForm.prenom || '',
      telephone: this.editForm.telephone || ''
    };

    if (this.user.role === 'STUDENT') {
      updateData.date_naissance = this.editForm.date_naissance || null;
      updateData.niveau_actuel = this.editForm.niveau_actuel || '';
      updateData.statut_etudiant = this.editForm.statut_etudiant || '';
    } else if (this.user.role === 'TEACHER') {
      updateData.specialite = this.editForm.specialite || '';
      updateData.experience = this.editForm.experience || 0;
      updateData.disponibilite = this.editForm.disponibilite || '';
    }

    this.authService.updateProfile(this.user.id_user, updateData).subscribe({
      next: (updatedUser: User) => {
        this.loading = false;
        this.message = 'Profile updated successfully!';
        this.isEditing = false;
        this.user = updatedUser;
        this.editForm = { ...updatedUser };
        setTimeout(() => this.message = '', 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.message = 'Error: ' + (err.error?.message || err.message || 'Update failed');
      }
    });
  }
}
