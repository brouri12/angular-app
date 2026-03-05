import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { Challenge, ProficiencyLevel, ChallengeType } from '../../models/challenge.model';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './challenges.html',
  styleUrl: './challenges.css'
})
export class Challenges implements OnInit {
  private challengeService = inject(ChallengeService);
  private router = inject(Router);

  challenges = signal<Challenge[]>([]);
  filteredChallenges = signal<Challenge[]>([]);
  loading = signal(true);
  
  // Filters
  selectedLevel = signal<string>('all');
  selectedType = signal<string>('all');
  searchTerm = signal<string>('');
  
  // Enums for template
  levels = Object.values(ProficiencyLevel);
  types = Object.values(ChallengeType);

  ngOnInit() {
    this.loadChallenges();
  }

  loadChallenges() {
    this.loading.set(true);
    this.challengeService.getAllChallenges().subscribe({
      next: (data) => {
        this.challenges.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading challenges:', err);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = this.challenges();

    // Filter by level
    if (this.selectedLevel() !== 'all') {
      filtered = filtered.filter(c => c.level === this.selectedLevel());
    }

    // Filter by type
    if (this.selectedType() !== 'all') {
      filtered = filtered.filter(c => c.type === this.selectedType());
    }

    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search)
      );
    }

    this.filteredChallenges.set(filtered);
  }

  onLevelChange(level: string) {
    this.selectedLevel.set(level);
    this.applyFilters();
  }

  onTypeChange(type: string) {
    this.selectedType.set(type);
    this.applyFilters();
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  startChallenge(challenge: Challenge) {
    this.router.navigate(['/challenge', challenge.id]);
  }

  getLevelLabel(level: ProficiencyLevel): string {
    return this.challengeService.getLevelLabel(level);
  }

  getLevelColor(level: ProficiencyLevel): string {
    return this.challengeService.getLevelColor(level);
  }

  getTypeIcon(type: ChallengeType): string {
    return this.challengeService.getTypeIcon(type);
  }

  getSuccessRateColor(rate: number | undefined): string {
    if (!rate) return 'text-gray-500';
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
}
