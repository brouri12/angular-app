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

  newSalle: Salle = { nomSalle: '', capacite: 30, localisation: '' };
  showAddForm = true;
  editingSalle: Salle | null = null;

  constructor(private planifService: PlanificationService) {}

  ngOnInit(): void { this.loadSalles(); }

  loadSalles(): void {
    this.loading = true;
    this.planifService.getSalles().subscribe({
      next: (data) => { this.salles = data; this.loading = false; },
      error: () => { this.error = 'Failed to load rooms. Make sure PlanificationService is running.'; this.loading = false; }
    });
  }

  refreshSalles(): void {
    this.planifService.getSalles().subscribe({ next: (data) => this.salles = data });
  }

  saveSalle(): void {
    if (!this.newSalle.nomSalle || !this.newSalle.localisation || !this.newSalle.capacite) {
      alert('Please fill all fields'); return;
    }
    this.planifService.createSalle(this.newSalle).subscribe({
      next: () => { this.newSalle = { nomSalle: '', capacite: 30, localisation: '' }; this.refreshSalles(); },
      error: (err) => alert('Failed to add room: ' + (err.error?.message || err.message))
    });
  }

  startEdit(salle: Salle): void { this.editingSalle = { ...salle }; }
  cancelEdit(): void { this.editingSalle = null; }

  saveEdit(): void {
    if (!this.editingSalle?.idSalle) return;
    this.planifService.updateSalle(this.editingSalle.idSalle, this.editingSalle).subscribe({
      next: () => { this.refreshSalles(); this.editingSalle = null; },
      error: (err) => alert('Failed to update: ' + (err.error?.message || err.message))
    });
  }

  deleteSalle(id: number | undefined): void {
    if (!id || !confirm('Delete this room?')) return;
    this.planifService.deleteSalle(id).subscribe({
      next: () => this.refreshSalles(),
      error: (err) => alert('Failed to delete: ' + (err.error?.message || err.message))
    });
  }
}
