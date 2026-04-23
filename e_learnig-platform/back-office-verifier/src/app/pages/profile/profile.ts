import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: User | null = null;
  isEditing = false;
  editForm: Partial<User> = {};
  loading = false;
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If not authenticated, redirect to dashboard
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.editForm = { ...user };
      }
    });

    // Force load fresh user data from API
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Profile loaded:', user);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.user) {
      this.editForm = { ...this.user };
    }
    this.message = '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.message = '';
    if (this.user) {
      this.editForm = { ...this.user };
    }
  }

  saveProfile(): void {
    if (!this.user || !this.user.id_user) {
      this.message = 'Error: User not found';
      return;
    }

    this.loading = true;
    this.message = '';
    
    // Prepare update data - only send fields that can be updated
    const updateData: any = {
      username: this.user.username, // Required
      email: this.user.email, // Required
      role: this.user.role, // Required
      nom: this.editForm.nom || '',
      prenom: this.editForm.prenom || '',
      telephone: this.editForm.telephone || ''
    };

    // Add role-specific fields ONLY for the current role
    if (this.user.role === 'STUDENT') {
      updateData.date_naissance = this.editForm.date_naissance || null;
      updateData.niveau_actuel = this.editForm.niveau_actuel || '';
      updateData.statut_etudiant = this.editForm.statut_etudiant || '';
    } else if (this.user.role === 'TEACHER') {
      updateData.specialite = this.editForm.specialite || '';
      updateData.experience = this.editForm.experience || 0;
      updateData.disponibilite = this.editForm.disponibilite || '';
    } else if (this.user.role === 'ADMIN') {
      updateData.poste = this.editForm.poste || '';
    }

    this.authService.updateProfile(this.user.id_user, updateData).subscribe({
      next: (updatedUser) => {
        this.loading = false;
        this.message = 'Profile updated successfully!';
        this.isEditing = false;
        this.user = updatedUser;
        this.editForm = { ...updatedUser };
        
        // Clear message after 3 seconds
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.message = 'Error updating profile: ' + (err.error?.message || err.message || 'Unknown error');
        console.error('Update error:', err);
      }
    });
  }
}
