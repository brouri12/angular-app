import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { EventsService } from '../../services/events.service';
import { EventModel } from '../../models/event.model';
import { EventsRefreshService } from '../../services/events-refresh.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, JoinConfirmModalComponent],
  templateUrl: './events.html',
  styleUrls: ['./events.css'],
})
export class Events implements OnInit {

  events: EventModel[] = [];
  filteredEvents: EventModel[] = [];

  loadingList = false;
  loadingAction = false;
  errorMsg = '';

  searchText = '';
  searchDate = '';
  eventDates: string[] = [];

  // ✅ DELETE MODAL (same as clubs)
  confirmOpen = false;
  selectedEvent: EventModel | null = null;

  constructor(
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: EventsRefreshService
  ) {}

  ngOnInit(): void {
    this.loadAll();

    this.refreshService.refresh$.subscribe(() => {
      this.loadAll();
    });
  }

  loadAll() {
    this.loadingList = true;
    this.errorMsg = '';

    this.eventsService.getAll()
      .pipe(finalize(() => (this.loadingList = false)))
      .subscribe({
        next: (data) => {
          this.events = data || [];
          this.rebuildDates();
          this.applyFilters();
        },
        error: () => {
          this.errorMsg = "Erreur lors du chargement des événements.";
        }
      });
  }

  applyFilters() {
    const q = (this.searchText || '').toLowerCase();

    this.filteredEvents = (this.events || []).filter(ev => {
      const matchDate = !this.searchDate || ev.eventDate === this.searchDate;
      const text = `${ev.title || ''} ${ev.location || ''} ${ev.description || ''}`.toLowerCase();
      return matchDate && text.includes(q);
    });
  }

  resetFilters() {
    this.searchText = '';
    this.searchDate = '';
    this.applyFilters();
  }

  openCreate() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  openEdit(ev: EventModel) {
    if (!ev.idEvent) return;
    this.router.navigate([ev.idEvent, 'edit'], { relativeTo: this.route });
  }

  // ✅ OPEN DELETE MODAL
  openDeleteModal(ev: EventModel) {
    this.selectedEvent = ev;
    this.confirmOpen = true;
  }

  // ✅ CONFIRM DELETE
  confirmDelete() {
    if (!this.selectedEvent?.idEvent) return;

    this.loadingAction = true;
    this.errorMsg = '';

    this.eventsService.deleteById(this.selectedEvent.idEvent)
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => {
          const id = this.selectedEvent!.idEvent!;
          this.events = this.events.filter(e => e.idEvent !== id);
          this.applyFilters();

          this.confirmOpen = false;
          this.selectedEvent = null;
        },
        error: () => {
          this.errorMsg = "Erreur lors de la suppression.";
          this.confirmOpen = false;
          this.selectedEvent = null;
        }
      });
  }

  cancelDelete() {
    this.confirmOpen = false;
    this.selectedEvent = null;
  }

  private rebuildDates() {
    this.eventDates = Array.from(
      new Set((this.events || []).map(e => e.eventDate).filter(Boolean) as string[])
    );
  }
}