import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AbonnementService } from '../../services/abonnement.service';
import { AuthService } from '../../services/auth.service';
import { Abonnement, HistoriqueAbonnement } from '../../models/abonnement.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private abonnementService = inject(AbonnementService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  loading = signal(true);
  abonnements = signal<Abonnement[]>([]);
  paiements = signal<HistoriqueAbonnement[]>([]);
  
  stats = signal([
    {
      label: 'Total Subscriptions',
      value: '0',
      change: '+0%',
      positive: true,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      label: 'Active Plans',
      value: '0',
      change: '+0%',
      positive: true,
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      label: 'Total Revenue',
      value: '$0',
      change: '+0%',
      positive: true,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Validated Payments',
      value: '0',
      change: '+0%',
      positive: true,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    }
  ]);

  ngOnInit() {
    // Check if token is in URL (from cross-origin redirect)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        console.log('Token received from URL, saving...');
        // Save token to localStorage
        this.authService.saveToken(token);
        // Update authentication state
        this.authService['isAuthenticatedSubject'].next(true);
        // Remove token from URL and reload page
        this.router.navigate([], {
          queryParams: {},
          replaceUrl: true
        }).then(() => {
          // Reload page to reinitialize AuthService with token
          window.location.reload();
        });
        return; // Don't load data yet, wait for reload
      }
    });
    
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    // Load abonnements
    this.abonnementService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements.set(data);
        this.updateStats();
      },
      error: (err) => console.error('Error loading abonnements:', err)
    });

    // Load paiements
    this.abonnementService.getAllPaiements().subscribe({
      next: (data) => {
        this.paiements.set(data);
        this.updateStats();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading paiements:', err);
        this.loading.set(false);
      }
    });
  }

  updateStats() {
    const abonnements = this.abonnements();
    const paiements = this.paiements();
    
    const totalAbonnements = abonnements.length;
    const activeAbonnements = abonnements.filter(a => a.statut === 'Actif').length;
    const totalRevenue = paiements.reduce((sum, p) => sum + p.montant, 0);
    const validatedPayments = paiements.filter(p => p.statut === 'Validé').length;
    
    this.stats.set([
      {
        label: 'Total Subscriptions',
        value: totalAbonnements.toString(),
        change: '+12.5%',
        positive: true,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      },
      {
        label: 'Active Plans',
        value: activeAbonnements.toString(),
        change: '+8.2%',
        positive: true,
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      },
      {
        label: 'Total Revenue',
        value: `$${totalRevenue.toFixed(2)}`,
        change: '+23.1%',
        positive: true,
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        label: 'Validated Payments',
        value: validatedPayments.toString(),
        change: '+2.4%',
        positive: true,
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      }
    ]);
  }

  getRecentPayments() {
    return this.paiements().slice(0, 4);
  }
}
