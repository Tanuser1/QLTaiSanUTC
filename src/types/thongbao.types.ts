export type NotificationEventType = 'YEUCAU_MOI' | 'YEUCAU_DUYET' | 'YEUCAU_TUCHOI' | 'BIENBAN_MOI' | 'PHEDUYET_MOI' | 'PHANCONG_MOI';

export interface AppNotification {
  id: number;
  eventType: NotificationEventType;
  targetId: number | null;
  userId: number;
  content: string | null;
  isRead: boolean;
  createdAt: string;
}
