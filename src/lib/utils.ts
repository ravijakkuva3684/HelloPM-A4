import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  format, 
  isToday, 
  isTomorrow, 
  isYesterday, 
  isPast, 
  parseISO, 
  addHours, 
  addDays, 
  addWeeks, 
  addMonths, 
  setHours, 
  setMinutes, 
  startOfDay,
  isSameDay
} from 'date-fns';
import { Task, SnoozeOption, RecurrencePattern } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a task due date into human readable text (e.g. "Today", "Tomorrow", "Oct 25")
 */
export function formatDueLabel(dateStr: string | null, timeStr: string | null): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) return { text: 'No due date', isOverdue: false, isToday: false };

  try {
    const date = parseISO(dateStr);
    const today = startOfDay(new Date());
    const targetDay = startOfDay(date);

    let baseText = '';
    const overdue = targetDay < today;
    const dueToday = isSameDay(targetDay, today);

    if (dueToday) {
      baseText = 'Today';
    } else if (isTomorrow(date)) {
      baseText = 'Tomorrow';
    } else if (isYesterday(date)) {
      baseText = 'Yesterday';
    } else {
      baseText = format(date, 'MMM d, yyyy');
    }

    if (timeStr) {
      baseText += ` at ${formatTime(timeStr)}`;
    }

    return {
      text: baseText,
      isOverdue: overdue,
      isToday: dueToday,
    };
  } catch {
    return { text: dateStr, isOverdue: false, isToday: false };
  }
}

/**
 * Convert 24h '14:30' into '2:30 PM'
 */
export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = setMinutes(setHours(new Date(), hours), minutes);
    return format(date, 'h:mm a');
  } catch {
    return timeStr;
  }
}

/**
 * Check if a task is currently overdue
 * A task is ONLY overdue after the date has changed to the next day (dueDate < today).
 * Tasks scheduled for today remain due today even if the scheduled time has passed.
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed' || !task.due_date) return false;
  
  // If snoozed into the future, it is not overdue yet
  if (task.snooze_until && new Date(task.snooze_until) > new Date()) {
    return false;
  }

  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(task.due_date));
  
  // Only overdue once the day has strictly passed
  return dueDate < today;
}

/**
 * Check if a task is due today
 */
export function isTaskDueToday(task: Task): boolean {
  if (task.status === 'completed' || !task.due_date) return false;
  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(task.due_date));
  return isSameDay(dueDate, today);
}

/**
 * Compute snooze target timestamp based on option
 */
export function computeSnoozeTimestamp(option: SnoozeOption, customDate?: Date): string {
  const now = new Date();
  let target = new Date();

  switch (option) {
    case '1hour':
      target = addHours(now, 1);
      break;
    case '3hours':
      target = addHours(now, 3);
      break;
    case 'thisEvening':
      target = setMinutes(setHours(now, 19), 0);
      if (target <= now) {
        target = addHours(now, 2);
      }
      break;
    case 'tomorrowMorning':
      target = setMinutes(setHours(addDays(now, 1), 9), 0);
      break;
    case 'nextWeek':
      target = setMinutes(setHours(addDays(now, 7), 9), 0);
      break;
    case 'custom':
      if (customDate) {
        target = customDate;
      }
      break;
  }

  return target.toISOString();
}

/**
 * Compute next occurrence for a recurring task
 */
export function computeNextRecurringDate(currentDateStr: string | null, pattern: RecurrencePattern, interval = 1): string {
  const baseDate = currentDateStr ? parseISO(currentDateStr) : new Date();
  let nextDate = new Date();

  switch (pattern) {
    case 'daily':
      nextDate = addDays(baseDate, interval || 1);
      break;
    case 'weekdays': {
      let d = addDays(baseDate, 1);
      while (d.getDay() === 0 || d.getDay() === 6) {
        d = addDays(d, 1);
      }
      nextDate = d;
      break;
    }
    case 'weekly':
      nextDate = addWeeks(baseDate, interval || 1);
      break;
    case 'biweekly':
      nextDate = addWeeks(baseDate, 2 * (interval || 1));
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, interval || 1);
      break;
    case 'custom':
      nextDate = addDays(baseDate, interval || 1);
      break;
    default:
      nextDate = addDays(baseDate, 1);
  }

  return format(nextDate, 'yyyy-MM-dd');
}

/**
 * Format date into iCal standard format YYYYMMDDTHHMMSSZ
 */
export function formatToICalDate(dateStr: string, timeStr?: string | null): string {
  try {
    const base = parseISO(dateStr);
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      base.setHours(h, m, 0, 0);
    } else {
      base.setHours(9, 0, 0, 0);
    }
    return base.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}
