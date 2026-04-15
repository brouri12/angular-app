import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanificationService } from '../../services/planification.service';
import { Planification, PlanificationType, Salle, Group } from '../../models/planification.model';

@Component({
    selector: 'app-planifications',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './planifications.component.html',
    styleUrls: ['./planifications.component.css']
})
export class PlanificationsComponent implements OnInit {
    planifications: Planification[] = [];
    salles: Salle[] = [];
    groups: Group[] = [];

    loading = true;
    actionLoading = false;
    error: string | null = null;
    formError: string | null = null;

    types = Object.values(PlanificationType);
    showAddForm = true;

    newPlanif: Partial<Planification> = {
        titre: '',
        type: PlanificationType.COURS,
        date: '',
        heureDebut: '',
        heureFin: '',
        salleId: undefined,
        groupId: undefined
    };

    // Edit state
    editingPlanif: Partial<Planification> | null = null;

    constructor(private planifService: PlanificationService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        this.error = null;

        this.planifService.getPlanifications().subscribe({
            next: (data) => {
                this.planifications = data;
                this.planifService.getSalles().subscribe(s => this.salles = s);
                this.planifService.getGroups().subscribe(g => this.groups = g);
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load planifications. Run backend.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    // Refresh data without showing loading spinner
    refreshData(): void {
        this.planifService.getPlanifications().subscribe({
            next: (data) => {
                this.planifications = data;
                this.planifService.getSalles().subscribe(s => this.salles = s);
                this.planifService.getGroups().subscribe(g => this.groups = g);
            },
            error: (err) => {
                console.error('Failed to refresh data:', err);
            }
        });
    }

    savePlanification(): void {
        this.formError = null;
        if (!this.newPlanif.titre || !this.newPlanif.date ||
            !this.newPlanif.heureDebut || !this.newPlanif.heureFin ||
            !this.newPlanif.salleId || !this.newPlanif.groupId) {
            this.formError = 'Please fill all required fields';
            return;
        }

        this.actionLoading = true;
        this.planifService.createPlanification(this.newPlanif as Planification).subscribe({
            next: (planif) => {
                this.resetForm();
                this.refreshData(); // Refresh without loading spinner
                alert('Schedule created successfully!');
                this.actionLoading = false;
            },
            error: (err) => {
                this.formError = err.error?.message || err.message || 'Scheduling conflict or validation error.';
                this.actionLoading = false;
            }
        });
    }

    startEditPlanif(p: Planification): void {
        this.editingPlanif = { ...p };
    }

    cancelEditPlanif(): void {
        this.editingPlanif = null;
    }

    saveEditPlanif(): void {
        if (!this.editingPlanif?.idPlanification) return;
        if (!this.editingPlanif.titre || !this.editingPlanif.date ||
            !this.editingPlanif.heureDebut || !this.editingPlanif.heureFin ||
            !this.editingPlanif.salleId || !this.editingPlanif.groupId) {
            alert('Please fill all required fields');
            return;
        }
        this.actionLoading = true;
        this.planifService.updatePlanification(this.editingPlanif.idPlanification, this.editingPlanif as Planification).subscribe({
            next: (updated) => {
                this.refreshData(); // Refresh without loading spinner
                this.editingPlanif = null;
                this.actionLoading = false;
            },
            error: (err) => {
                alert('Failed to update schedule: ' + (err.error?.message || err.message));
                this.actionLoading = false;
            }
        });
    }

    deletePlanification(id: number | undefined): void {
        if (!id) return;
        if (confirm('Are you sure you want to delete this schedule?')) {
            this.planifService.deletePlanification(id).subscribe({
                next: () => {
                    this.refreshData(); // Refresh without loading spinner
                },
                error: (err) => {
                    alert('Failed to delete schedule: ' + err.message);
                }
            });
        }
    }

    resetForm(): void {
        this.newPlanif = {
            titre: '',
            type: PlanificationType.COURS,
            date: '',
            heureDebut: '',
            heureFin: '',
            salleId: undefined,
            groupId: undefined
        };
    }
}
