import { Pipe, PipeTransform } from '@angular/core';

/** Returns a Tailwind text-color class based on a 0-100 score */
@Pipe({ name: 'scoreColor', standalone: true })
export class ScoreColorPipe implements PipeTransform {
  transform(score: number): string {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  }
}

/** Returns a label for a 0-100 score */
@Pipe({ name: 'scoreLabel', standalone: true })
export class ScoreLabelPipe implements PipeTransform {
  transform(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 55) return 'Fair';
    if (score >= 35) return 'Needs Work';
    return 'Weak';
  }
}

/** Returns bg-color class for CECRL level badge */
@Pipe({ name: 'levelColor', standalone: true })
export class LevelColorPipe implements PipeTransform {
  transform(niveau: string): string {
    const map: Record<string, string> = {
      A1: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      A2: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      B1: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      B2: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      C1: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      C2: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };
    return map[niveau] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  }
}

/** Returns bg-color class for status badge */
@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-300',
      EVALUATED: 'bg-emerald-500/20 text-emerald-300',
      FAILED: 'bg-red-500/20 text-red-300',
    };
    return map[status] ?? 'bg-slate-500/20 text-slate-300';
  }
}