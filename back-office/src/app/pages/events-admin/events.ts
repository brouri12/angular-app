import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/event.model';
import { EventsRefreshService } from '../../services/events-refresh.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-events-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, JoinConfirmModalComponent],
  templateUrl: './events.html',
  styleUrls: ['./events.css'],
})
export class Events implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loadingList = false;
  loadingAction = false;
  errorMsg = '';
  searchText = '';
  searchDate = '';
  eventDates: string[] = [];
  confirmOpen = false;
  selectedEvent: Event | null = null;
  total = 0;
  byStatus: { label: string; total: number }[] = [];
  byType: { label: string; total: number }[] = [];
  byMode: { label: string; total: number }[] = [];
  loadingStats = false;

  constructor(
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: EventsRefreshService
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadStats();
    this.refreshService.refresh$.subscribe(() => { this.loadAll(); this.loadStats(); });
  }

  loadAll() {
    this.loadingList = true; this.errorMsg = '';
    this.eventsService.getAll().pipe(finalize(() => (this.loadingList = false))).subscribe({
      next: (data) => { this.events = data || []; this.rebuildDates(); this.applyFilters(); },
      error: () => { this.errorMsg = 'Error loading events.'; }
    });
  }

  loadStats() {
    this.loadingStats = true;
    this.eventsService.totalEvents().subscribe({ next: (v) => this.total = Number(v || 0), error: () => this.total = 0 });
    this.eventsService.statsByStatus().subscribe({ next: (rows: any[]) => { this.byStatus = (rows || []).map(r => ({ label: String(r[0]), total: Number(r[1]) })); }, error: () => this.byStatus = [] });
    this.eventsService.statsByType().subscribe({ next: (rows: any[]) => { this.byType = (rows || []).map(r => ({ label: String(r[0]), total: Number(r[1]) })); }, error: () => this.byType = [] });
    this.eventsService.statsByMode().subscribe({ next: (rows: any[]) => { this.byMode = (rows || []).map(r => ({ label: String(r[0]), total: Number(r[1]) })); }, error: () => this.byMode = [], complete: () => this.loadingStats = false });
  }

  applyFilters() {
    const q = (this.searchText || '').toLowerCase();
    this.filteredEvents = (this.events || []).filter(ev => {
      const matchDate = !this.searchDate || ev.eventDate === this.searchDate;
      const text = `${ev.title || ''} ${ev.location || ''} ${ev.description || ''}`.toLowerCase();
      return matchDate && text.includes(q);
    });
  }

  resetFilters() { this.searchText = ''; this.searchDate = ''; this.applyFilters(); }
  private rebuildDates() { this.eventDates = Array.from(new Set((this.events || []).map(e => e.eventDate).filter(Boolean) as string[])); }
  openCreate() { this.router.navigate(['new'], { relativeTo: this.route }); }
  openEdit(ev: Event) { if (!ev.idEvent) return; this.router.navigate([ev.idEvent, 'edit'], { relativeTo: this.route }); }
  openDeleteModal(ev: Event) { this.selectedEvent = ev; this.confirmOpen = true; }

  confirmDelete() {
    if (!this.selectedEvent?.idEvent) return;
    this.loadingAction = true; this.errorMsg = '';
    this.eventsService.deleteById(this.selectedEvent.idEvent).pipe(finalize(() => (this.loadingAction = false))).subscribe({
      next: () => {
        const id = this.selectedEvent!.idEvent!;
        this.events = this.events.filter(e => e.idEvent !== id);
        this.applyFilters(); this.rebuildDates(); this.loadStats();
        this.confirmOpen = false; this.selectedEvent = null;
      },
      error: () => { this.errorMsg = 'Delete error.'; this.confirmOpen = false; this.selectedEvent = null; }
    });
  }

  cancelDelete() { this.confirmOpen = false; this.selectedEvent = null; }
  isClosed(ev: Event): boolean { return (String(ev?.status || '').toUpperCase() === 'CLOSED') || (Number(ev?.capacity) <= 0); }
  statusLabel(ev: Event): string { return this.isClosed(ev) ? 'CLOSED' : 'OPEN'; }
  statusClass(ev: Event): string { return this.isClosed(ev) ? 'pill-status-closed' : 'pill-status-open'; }
  displayLocation(raw: string | undefined | null): string {
    if (raw == null || !String(raw).trim()) return '—';
    const s = String(raw).replace(/\|@[-.\d]+,[-.\d]+\s*$/, '').trim();
    return s || '—';
  }
}
