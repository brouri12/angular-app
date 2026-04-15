import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeType = 'PERFECT_MASTER' | 'STREAK_KING' | 'CENTURION' | 'GOLDEN_TONGUE' | 'PHONEME_CONQUEROR' | 'DAILY_WARRIOR' | 'CHALLENGE_MASTER';

const BADGE_CONFIG = {
  PERFECT_MASTER: { color: 'from-amber-400 to-orange-400', icon: '🏆', label: 'Perfect Master' },
  STREAK_KING: { color: 'from-emerald-400 to-teal-400', icon: '🔥', label: 'Streak King' },
  CENTURION: { color: 'from-slate-400 to-gray-400', icon: '⚔️', label: 'Centurion' },
  GOLDEN_TONGUE: { color: 'from-yellow-400 to-amber-500', icon: '👅', label: 'Golden Tongue' },
  PHONEME_CONQUEROR: { color: 'from-indigo-400 to-purple-400', icon: '🎯', label: 'Phoneme Conqueror' },
  DAILY_WARRIOR: { color: 'from-rose-400 to-pink-400', icon: '⚡', label: 'Daily Warrior' },
  CHALLENGE_MASTER: { color: 'from-violet-400 to-fuchsia-400', icon: '👑', label: 'Challenge Master' }
} as Record<BadgeType, { color: string, icon: string, label: string }>;

@Component({
  selector: 'app-gamification-badges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-slate-900/50 to-black/50 rounded-2xl border border-white/10 backdrop-blur-sm">
      <ng-container *ngFor="let badge of badges()">
        <div class="group relative p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-emerald-500/10">
          <span class="text-xl">{{ config[badge].icon }}</span>
          <div>
            <p class="font-bold text-sm capitalize">{{ config[badge].label }}</p>
          </div>
        </div>
      </ng-container>
      <div *ngIf="badges().length === 0" class="col-span-full text-center py-8 text-slate-500">
        <p class="text-lg">No badges yet</p>
        <p class="text-sm mt-1">Complete challenges to unlock!</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GamificationBadgesComponent {
  badges = input<BadgeType[]>([]);

  config = BADGE_CONFIG;
}

