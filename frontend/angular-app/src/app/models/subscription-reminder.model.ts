export interface SubscriptionReminder {
  id?: string;
  userId: number;
  userName: string;
  userEmail: string;
  subscriptionName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  reminderType: 'EXPIRING_SOON' | 'EXPIRED' | 'EXPIRING_TODAY';
  message: string;
  severity?: 'high' | 'medium' | 'low';
  isRead?: boolean;
}
