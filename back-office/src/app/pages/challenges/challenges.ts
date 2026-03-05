import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService } from '../../services/challenge.service';
import { NotificationService } from '../../services/notification.service';
import { Challenge, Question, ProficiencyLevel, ChallengeType, SkillFocus, QuestionType } from '../../models/challenge.model';

@Component({
  selector: 'app-challenges',
  imports: [CommonModule, FormsModule],
  templateUrl: './challenges.html',
  styleUrl: './challenges.css'
})
export class Challenges implements OnInit {
  private challengeService = inject(ChallengeService);
  private notificationService = inject(NotificationService);

  challenges = signal<Challenge[]>([]);
  filteredChallenges = signal<Challenge[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editMode = signal(false);

  searchTerm = signal('');
  filterLevel = signal('all');
  filterType = signal('all');

  currentChallenge: Challenge = this.getEmptyChallenge();

  // Enums for template
  levels = Object.values(ProficiencyLevel);
  types = Object.values(ChallengeType);
  skills = Object.values(SkillFocus);
  questionTypes = Object.values(QuestionType);

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
        this.notificationService.error('Load Failed', 'Failed to load challenges');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = this.challenges();

    if (this.filterLevel() !== 'all') {
      filtered = filtered.filter(c => c.level === this.filterLevel());
    }

    if (this.filterType() !== 'all') {
      filtered = filtered.filter(c => c.type === this.filterType());
    }

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search)
      );
    }

    this.filteredChallenges.set(filtered);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  openAddModal() {
    this.editMode.set(false);
    this.currentChallenge = this.getEmptyChallenge();
    this.showModal.set(true);
  }

  openEditModal(challenge: Challenge) {
    this.editMode.set(true);
    this.currentChallenge = JSON.parse(JSON.stringify(challenge)); // Deep copy
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentChallenge = this.getEmptyChallenge();
  }

  saveChallenge() {
    // Validate
    if (!this.currentChallenge.title || !this.currentChallenge.description) {
      this.notificationService.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (this.currentChallenge.questions.length === 0) {
      this.notificationService.warning('Validation Error', 'Please add at least one question');
      return;
    }

    if (this.editMode()) {
      // Update
      this.challengeService.updateChallenge(this.currentChallenge.id!, this.currentChallenge).subscribe({
        next: () => {
          this.notificationService.success('Challenge Updated', 'Challenge has been updated successfully');
          this.loadChallenges();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating challenge:', err);
          this.notificationService.error('Update Failed', 'Failed to update challenge');
        }
      });
    } else {
      // Create
      this.challengeService.createChallenge(this.currentChallenge).subscribe({
        next: () => {
          this.notificationService.success('Challenge Created', 'Challenge has been created successfully');
          this.loadChallenges();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating challenge:', err);
          this.notificationService.error('Creation Failed', 'Failed to create challenge');
        }
      });
    }
  }

  deleteChallenge(challenge: Challenge) {
    this.notificationService.confirm(
      'Delete Challenge',
      `Are you sure you want to delete "${challenge.title}"? This action cannot be undone.`,
      () => {
        this.challengeService.deleteChallenge(challenge.id!).subscribe({
          next: () => {
            this.notificationService.success('Challenge Deleted', 'Challenge has been deleted successfully');
            this.loadChallenges();
          },
          error: (err) => {
            console.error('Error deleting challenge:', err);
            this.notificationService.error('Delete Failed', 'Failed to delete challenge');
          }
        });
      }
    );
  }

  addQuestion() {
    const newQuestion: Question = {
      type: QuestionType.MULTIPLE_CHOICE,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      orderIndex: this.currentChallenge.questions.length
    };
    this.currentChallenge.questions.push(newQuestion);
  }

  removeQuestion(index: number) {
    this.currentChallenge.questions.splice(index, 1);
    // Update order indices
    this.currentChallenge.questions.forEach((q, i) => q.orderIndex = i);
  }

  addOption(question: Question) {
    if (!question.options) question.options = [];
    question.options.push('');
  }

  removeOption(question: Question, index: number) {
    question.options?.splice(index, 1);
  }

  getEmptyChallenge(): Challenge {
    return {
      title: '',
      description: '',
      type: ChallengeType.VOCABULARY,
      skillFocus: SkillFocus.VOCABULARY,
      level: ProficiencyLevel.A1,
      category: '',
      points: 30,
      timeLimit: 10,
      content: '',
      questions: [],
      isPublic: true,
      tags: ''
    };
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
}
