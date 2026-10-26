export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'completed';

export type RecurrencePattern = 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_default?: boolean;
  created_at?: string;
  task_count?: number;
}

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description?: string;
  due_date: string | null; // ISO 'YYYY-MM-DD'
  due_time: string | null; // 'HH:mm'
  priority: PriorityLevel;
  status: TaskStatus;
  completed_at?: string | null;
  is_recurring: boolean;
  recurrence_pattern?: RecurrencePattern | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
  snooze_until?: string | null;
  reminder_at?: string | null;
  reminder_lead_minutes?: number; // e.g. 0, 10, 15, 30, 60
  notification_sent?: boolean;
  google_calendar_event_id?: string | null;
  created_at: string;
  updated_at?: string;
  category?: Category;
}

export interface NotificationPreference {
  id?: string;
  user_id: string;
  browser_notifications: boolean;
  sound_enabled: boolean;
  daily_summary_time: string; // 'HH:mm', default '08:00'
  daily_summary_enabled: boolean;
  prevent_duplicate_reminders: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // '22:00'
  quiet_hours_end: string; // '07:00'
  created_at?: string;
  updated_at?: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  task_id?: string | null;
  title: string;
  message: string;
  type: 'reminder' | 'overdue' | 'summary' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  time_zone: string;
  created_at?: string;
}

export type SnoozeOption = 
  | '1hour'
  | '3hours'
  | 'thisEvening'
  | 'tomorrowMorning'
  | 'nextWeek'
  | 'custom';

export type TaskFilterType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'category';
