import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanificationService } from '../../services/planification.service';
import { Salle } from '../../models/planification.model';

@Component({
    selector: 'app-salles',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './salles.component.html',
    styleUrls: ['./salles.component.css']
})
export class SallesComponent implements OnInit {
    salles: Salle[] = [];
    loading = true;
    error: string | null = null;

    // Form model for new room
    newSalle: Salle = { nomSalle: '', capacite: 30, localisation: '' };
    showAddForm = true;

    // Edit state
    editingSalle: Salle | null = null;

    constructor(private planifService: PlanificationService) { }

    ngOnInit(): void {
        this.loadSalles();
    }

    loadSalles(): void {
        this.loading = true;
        this.error = null;
        this.planifService.getSalles().subscribe({
            next: (data) => {
                this.salles = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load salles. Run backend.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    // Refresh data without showing loading spinner
    refreshSalles(): void {
        this.planifService.getSalles().subscribe({
            next: (data) => {
                this.salles = data;
            },
            error: (err) => {
                console.error('Failed to refresh salles:', err);
            }
        });
    }

    saveSalle(): void {
        if (!this.newSalle.nomSalle || !this.newSalle.localisation || !this.newSalle.capacite) {
            alert('Please fill all fields');
            return;
        }

        this.planifService.createSalle(this.newSalle).subscribe({
            next: (salle) => {
                this.newSalle = { nomSalle: '', capacite: 30, localisation: '' };
                this.refreshSalles(); // Refresh without loading spinner
                alert('Room added successfully');
            },
            error: (err) => {
                alert('Failed to add room: ' + (err.error?.message || err.message));
                console.error(err);
            }
        });
    }

    startEdit(salle: Salle): void {
        // Clone so we don't mutate the original until save
        this.editingSalle = { ...salle };
    }

    cancelEdit(): void {
        this.editingSalle = null;
    }

    saveEdit(): void {
        if (!this.editingSalle?.idSalle) return;
        if (!this.editingSalle.nomSalle || !this.editingSalle.localisation || !this.editingSalle.capacite) {
            alert('Please fill all fields');
            return;
        }
        this.planifService.updateSalle(this.editingSalle.idSalle, this.editingSalle).subscribe({
            next: (updated) => {
                this.refreshSalles(); // Refresh without loading spinner
                this.editingSalle = null;
            },
            error: (err) => {
                alert('Failed to update room: ' + (err.error?.message || err.message));
            }
        });
    }

    deleteSalle(id: number | undefined): void {
        if (!id) return;
        if (confirm('Are you sure you want to delete this room?')) {
            this.planifService.deleteSalle(id).subscribe({
                next: () => {
                    this.refreshSalles(); // Refresh without loading spinner
                },
                error: (err) => {
                    alert('Failed to delete room: ' + (err.error?.message || err.message));
                }
            });
        }
    }
}
