import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
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
    // If not authenticated, redirect to home
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    console.log('=== PROFILE PAGE INIT ===');

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      console.log('Profile - currentUser$ subscription fired:', user);
      this.user = user;
      if (user) {
        console.log('Profile - Setting editForm with user data:', {
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone,
          date_naissance: user.date_naissance,
          niveau_actuel: user.niveau_actuel,
          statut_etudiant: user.statut_etudiant
        });
        this.editForm = { ...user };
        console.log('Profile - editForm after copy:', {
          nom: this.editForm.nom,
          prenom: this.editForm.prenom,
          telephone: this.editForm.telephone,
          date_naissance: this.editForm.date_naissance,
          niveau_actuel: this.editForm.niveau_actuel,
          statut_etudiant: this.editForm.statut_etudiant
        });
      }
    });

    // Force load fresh user data from API
    console.log('Profile - Calling getCurrentUser()...');
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Profile - getCurrentUser() success:', user);
      },
      error: (err) => {
        console.error('Profile - getCurrentUser() error:', err);
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
    console.log('=== SAVE PROFILE CALLED ===');
    console.log('User:', this.user);
    console.log('EditForm:', this.editForm);
    
    if (!this.user || !this.user.id_user) {
      console.error('No user or user ID');
      this.message = 'Error: User not found';
      return;
    }

    console.log('Starting update for user ID:', this.user.id_user);
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

    console.log('Update data:', updateData);
    console.log('Calling authService.updateProfile...');

    this.authService.updateProfile(this.user.id_user, updateData).pipe(
      timeout(10000) // 10 second timeout
    ).subscribe({
      next: (updatedUser) => {
        console.log('✓ Update successful:', updatedUser);
        this.loading = false;
        this.message = 'Profile updated successfully!';
        this.isEditing = false;
        this.user = updatedUser;
        this.editForm = { ...updatedUser };
        
        // Clear message after 3 seconds
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        console.error('✗ Update error:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.loading = false;
        this.message = 'Error updating profile: ' + (err.error?.message || err.message || 'Unknown error');
      },
      complete: () => {
        console.log('Update request completed');
      }
    });
  }
}
