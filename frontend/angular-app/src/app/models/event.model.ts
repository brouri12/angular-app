export type EventType = 'WORKSHOP' | 'SPEAKING' | 'EXAM';
export type EventMode = 'ONLINE' | 'PRESENTIEL';
export type EventLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Event {
  idEvent?: number;
  title: string;
  description: string;
  type: EventType;
  mode: EventMode;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  requiredLevel: EventLevel;
  clubId?: number;
}
