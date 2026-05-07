import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'levelColor', standalone: true })
export class LevelColorPipe implements PipeTransform {
  transform(level?: string | null): string {
    switch ((level || '').toUpperCase()) {
      case 'A1':
      case 'A2':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'B1':
      case 'B2':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'C1':
      case 'C2':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  }
}

@Pipe({ name: 'scoreColor', standalone: true })
export class ScoreColorPipe implements PipeTransform {
  transform(score?: number | null): string {
    const value = score ?? 0;
    if (value >= 90) return 'text-emerald-400';
    if (value >= 80) return 'text-lime-400';
    if (value >= 70) return 'text-yellow-400';
    if (value >= 60) return 'text-orange-400';
    return 'text-rose-400';
  }
}

@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(status?: string | null): string {
    switch ((status || '').toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'PROCESSING':
      case 'PENDING':
        return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30';
      case 'FAILED':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border border-slate-500/30';
    }
  }
}
