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

  // Weekly leaderboard
  weeklyLeaderboard = signal<any[]>([]);
  loadingLeaderboard = signal(false);
  activeTab = signal<'challenges' | 'leaderboard'>('challenges');

  // Filters
  selectedLevel = signal<string>('all');
  selectedType = signal<string>('all');
  searchTerm = signal<string>('');

  // Enums for template
  levels = Object.values(ProficiencyLevel);
  types = Object.values(ChallengeType);

  ngOnInit() {
    this.loadChallenges();
    this.loadWeeklyLeaderboard();
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

  loadWeeklyLeaderboard() {
    this.loadingLeaderboard.set(true);
    this.challengeService.getWeeklyLeaderboard().subscribe({
      next: (data) => {
        this.weeklyLeaderboard.set(data);
        this.loadingLeaderboard.set(false);
      },
      error: () => this.loadingLeaderboard.set(false)
    });
  }

  getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  getPassRateColor(rate: number): string {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-500';
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
    if ((challenge as any).isExpired) return;
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

  getTypeGradient(type: ChallengeType): string {
    const map: { [key in ChallengeType]: string } = {
      VOCABULARY: 'bg-gradient-to-r from-blue-400 to-blue-600',
      GRAMMAR: 'bg-gradient-to-r from-purple-400 to-purple-600',
      READING: 'bg-gradient-to-r from-green-400 to-green-600',
      LISTENING: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      WRITING: 'bg-gradient-to-r from-pink-400 to-rose-500',
      SPEAKING: 'bg-gradient-to-r from-red-400 to-red-600',
      IDIOMS: 'bg-gradient-to-r from-teal-400 to-cyan-500',
      MIXED: 'bg-gradient-to-r from-indigo-400 to-violet-500'
    };
    return map[type] || 'bg-gradient-to-r from-gray-400 to-gray-600';
  }

  getTypeBackground(type: ChallengeType): string {
    const map: { [key in ChallengeType]: string } = {
      VOCABULARY: 'bg-blue-50 dark:bg-blue-900/30',
      GRAMMAR: 'bg-purple-50 dark:bg-purple-900/30',
      READING: 'bg-green-50 dark:bg-green-900/30',
      LISTENING: 'bg-yellow-50 dark:bg-yellow-900/30',
      WRITING: 'bg-pink-50 dark:bg-pink-900/30',
      SPEAKING: 'bg-red-50 dark:bg-red-900/30',
      IDIOMS: 'bg-teal-50 dark:bg-teal-900/30',
      MIXED: 'bg-indigo-50 dark:bg-indigo-900/30'
    };
    return map[type] || 'bg-gray-50 dark:bg-gray-700';
  }

  getSuccessRateBar(rate: number | undefined): string {
    if (!rate) return 'bg-gray-400';
    if (rate >= 70) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (rate >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  }
}
