import { Category, Task, NotificationPreference, UserProfile } from '@/types';
import { format, addDays, subDays } from 'date-fns';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-work',
    user_id: 'mock-user-1',
    name: 'Work',
    color: '#3b82f6', // Blue
    icon: 'Briefcase',
    is_default: true,
  },
  {
    id: 'cat-personal',
    user_id: 'mock-user-1',
    name: 'Personal',
    color: '#10b981', // Emerald
    icon: 'Heart',
    is_default: true,
  },
  {
    id: 'cat-health',
    user_id: 'mock-user-1',
    name: 'Health & Wellness',
    color: '#ef4444', // Rose
    icon: 'Activity',
    is_default: true,
  },
  {
    id: 'cat-shopping',
    user_id: 'mock-user-1',
    name: 'Shopping',
    color: '#f59e0b', // Amber
    icon: 'ShoppingCart',
    is_default: true,
  },
  {
    id: 'cat-learning',
    user_id: 'mock-user-1',
    name: 'Learning & Books',
    color: '#8b5cf6', // Violet
    icon: 'BookOpen',
    is_default: true,
  },
  {
    id: 'cat-finance',
    user_id: 'mock-user-1',
    name: 'Finance',
    color: '#06b6d4', // Cyan
    icon: 'CreditCard',
    is_default: false,
  },
];

const todayStr = format(new Date(), 'yyyy-MM-dd');
const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const dayAfterStr = format(addDays(new Date(), 2), 'yyyy-MM-dd');
const nextWeekStr = format(addDays(new Date(), 5), 'yyyy-MM-dd');

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    user_id: 'mock-user-1',
    category_id: 'cat-work',
    title: 'Finalize Q4 Product Roadmap & Slide Deck',
    description: 'Sync with design and engineering leads on milestone commitments and OKR alignment.',
    due_date: yesterdayStr,
    due_time: '17:00',
    priority: 'urgent',
    status: 'pending',
    is_recurring: false,
    reminder_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'task-2',
    user_id: 'mock-user-1',
    category_id: 'cat-work',
    title: 'Weekly Team Standup & Sprint Planning',
    description: 'Review current sprint blockers and assign tickets for upcoming sprint items.',
    due_date: todayStr,
    due_time: '10:00',
    priority: 'high',
    status: 'pending',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    reminder_at: new Date().toISOString(),
    reminder_lead_minutes: 15,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-3',
    user_id: 'mock-user-1',
    category_id: 'cat-health',
    title: 'Afternoon 5km Jog & Core Workout',
    description: 'Stretch for 10 minutes beforehand and track heart rate zone.',
    due_date: todayStr,
    due_time: '17:30',
    priority: 'medium',
    status: 'pending',
    is_recurring: true,
    recurrence_pattern: 'weekdays',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-4',
    user_id: 'mock-user-1',
    category_id: 'cat-shopping',
    title: 'Order groceries: Almond milk, avocados, whole grains',
    description: 'Check fridge inventory before confirming Instacart order.',
    due_date: todayStr,
    due_time: '20:00',
    priority: 'low',
    status: 'pending',
    is_recurring: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-5',
    user_id: 'mock-user-1',
    category_id: 'cat-finance',
    title: 'Review monthly cloud server billing and budget forecast',
    description: 'Check AWS/Vercel utilization metrics and set alert threshold.',
    due_date: tomorrowStr,
    due_time: '14:00',
    priority: 'high',
    status: 'pending',
    is_recurring: true,
    recurrence_pattern: 'monthly',
    recurrence_interval: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-6',
    user_id: 'mock-user-1',
    category_id: 'cat-learning',
    title: 'Read 2 chapters of "Designing Data-Intensive Applications"',
    description: 'Take notes on consensus algorithms and Raft protocol.',
    due_date: dayAfterStr,
    due_time: '21:00',
    priority: 'medium',
    status: 'pending',
    is_recurring: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-7',
    user_id: 'mock-user-1',
    category_id: 'cat-personal',
    title: 'Plan family weekend hiking itinerary',
    description: 'Book park trail permits and pack hydration bladders.',
    due_date: nextWeekStr,
    due_time: null,
    priority: 'medium',
    status: 'pending',
    is_recurring: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-8',
    user_id: 'mock-user-1',
    category_id: 'cat-work',
    title: 'Deploy Remindly V1.0 staging release',
    description: 'Verified Supabase Auth flows, task scheduling, and calendar views.',
    due_date: yesterdayStr,
    due_time: '11:00',
    priority: 'high',
    status: 'completed',
    completed_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    is_recurring: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const INITIAL_PREFERENCES: NotificationPreference = {
  user_id: 'mock-user-1',
  browser_notifications: true,
  sound_enabled: true,
  daily_summary_time: '08:00',
  daily_summary_enabled: true,
  prevent_duplicate_reminders: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

export const INITIAL_PROFILE: UserProfile = {
  id: 'mock-user-1',
  email: 'alex@example.com',
  full_name: 'Alex Morgan',
  avatar_url: '',
  time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};
