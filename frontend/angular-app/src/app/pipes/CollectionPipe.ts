import { Pipe, PipeTransform } from '@angular/core';
import { UserRecording } from '../../shared/models/pronunciation.types';

export type CollectionType = 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'PRACTICE' | 'STREAK' | 'ALL';

export const getCollectionLabel = (collection: string): { label: string; badge: string; color: string } => {
  const collections: Record<string, { label: string; badge: string; color: string }> = {
    'PERFECT': { label: 'Perfect ⭐⭐⭐', badge: '🏆 Perfect Master', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    'EXCELLENT': { label: 'Excellent ⭐⭐', badge: '🎯 Precision Pro', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    'GOOD': { label: 'Good ⭐', badge: '📈 Rising Star', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    'PRACTICE': { label: 'Needs Practice', badge: '💪 Practice Mode', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    'STREAK': { label: 'Streak 🔥', badge: '⚡ Momentum', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    'ALL': { label: 'All Recordings', badge: '', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' }
  };
  return collections[collection as keyof typeof collections] || collections['ALL'];
};

// Unused pipe (warnings only) - kept for future
// CollectionFilterPipe - no longer needed (linter warnings fixed by removing usage)
@Pipe({ name: 'collectionFilter', standalone: true })
export class CollectionFilterPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value; // noop - unused pipe, kept for future
  }
}

