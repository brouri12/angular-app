export type EventType = 'WORKSHOP' | 'SPEAKING' | 'EXAM';
export type EventMode = 'ONLINE' | 'PRESENTIEL';
export type EventLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface EventModel {
  idEvent?: number;         // backend: idEvent
  title: string;
  description: string;
  type: EventType;
  mode: EventMode;
  eventDate: string;        // "yyyy-MM-dd"
  startTime: string;        // "HH:mm:ss"
  endTime: string;          // "HH:mm:ss"
  location: string;
  capacity: number;
  requiredLevel: EventLevel;
  clubId?: number;
}
