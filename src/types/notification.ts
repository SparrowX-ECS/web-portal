export type NotificationChannel = 'email' | 'sms' | 'push';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface NotificationRead {
  id: number;
  recipient: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  created_at: string;
}

export interface NotificationCreate {
  recipient: string;
  message: string;
  channel: NotificationChannel;
}

export interface NotificationStatusUpdate {
  status: NotificationStatus;
}

export interface NotificationListParams {
  channel?: NotificationChannel | null;
  status?: NotificationStatus | null;
}
