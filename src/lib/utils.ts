import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  format, 
  isToday, 
  isTomorrow, 
  isYesterday, 
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
 * Safely parse any date string (ISO, DD-MM-YYYY, or standard formats)
 * Returns null if invalid, NEVER throws.
 */
export function safeParseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === '--' || trimmed === 'null' || trimmed === 'undefined') return null;

  try {
    // 1. Standard ISO: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const d = parseISO(trimmed);
      if (!isNaN(d.getTime())) return d;
    }

    // 2. Format: DD-MM-YYYY (e.g. 26-10-2026)
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed)) {
      const parts = trimmed.split('-').map(Number);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // 3. Format: DD/MM/YYYY or YYYY/MM/DD
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/').map(Number);
      if (parts.length === 3) {
        if (parts[0] > 1000) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          if (!isNaN(d.getTime())) return d;
        } else {
          const d = new Date(parts[2], parts[1] - 1, parts[0]);
          if (!isNaN(d.getTime())) return d;
        }
      }
    }

    // 4. General Date constructor fallback
    const fallback = new Date(trimmed);
    if (!isNaN(fallback.getTime())) return fallback;
  } catch {
    return null;
  }

  return null;
}

/**
 * Format a task due date into human readable text (e.g. "Today", "Tomorrow", "Oct 25")
 * 100% resilient against non-standard or invalid dates.
 */
export function formatDueLabel(
  dateStr: string | null | undefined, 
  timeStr: string | null | undefined
): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateStr) return { text: 'No due date', isOverdue: false, isToday: false };

  try {
    const date = safeParseDate(dateStr);
    if (!date) {
      return { text: String(dateStr), isOverdue: false, isToday: false };
    }

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

    const formattedT = formatTime(timeStr);
    if (formattedT) {
      baseText += ` at ${formattedT}`;
    }

    return {
      text: baseText,
      isOverdue: overdue,
      isToday: dueToday,
    };
  } catch {
    return { text: String(dateStr), isOverdue: false, isToday: false };
  }
}

/**
 * Convert 24h '14:30' into '2:30 PM'
 * Gracefully ignores '--:--', null, undefined, or invalid times.
 */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const trimmed = timeStr.trim();
  if (!trimmed || trimmed.includes('--') || !trimmed.includes(':')) return '';

  try {
    const parts = trimmed.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return '';

    const [hours, minutes] = parts;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';

    const date = setMinutes(setHours(new Date(), hours), minutes);
    if (isNaN(date.getTime())) return '';

    return format(date, 'h:mm a');
  } catch {
    return '';
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
  if (task.snooze_until) {
    const snoozeDate = safeParseDate(task.snooze_until);
    if (snoozeDate && snoozeDate > new Date()) return false;
  }

  const dueDate = safeParseDate(task.due_date);
  if (!dueDate) return false;

  const today = startOfDay(new Date());
  const targetDay = startOfDay(dueDate);
  
  // Only overdue once the day has strictly passed
  return targetDay < today;
}

/**
 * Check if a task is due today
 */
export function isTaskDueToday(task: Task): boolean {
  if (task.status === 'completed' || !task.due_date) return false;
  const dueDate = safeParseDate(task.due_date);
  if (!dueDate) return false;

  const today = startOfDay(new Date());
  return isSameDay(startOfDay(dueDate), today);
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
      target = setHours(setMinutes(now, 0), 19);
      if (target <= now) target = addHours(now, 2);
      break;
    case 'tomorrowMorning':
      target = setHours(setMinutes(addDays(now, 1), 0), 9);
      break;
    case 'nextWeek':
      target = setHours(setMinutes(addWeeks(now, 1), 0), 9);
      break;
    case 'custom':
      if (customDate && !isNaN(customDate.getTime())) {
        target = customDate;
      } else {
        target = addHours(now, 1);
      }
      break;
    default:
      target = addHours(now, 1);
  }

  return target.toISOString();
}

/**
 * Calculate the next recurrence date for repeating responsibilities
 */
export function computeNextRecurringDate(
  currentDueDate: string | null | undefined,
  pattern: RecurrencePattern | null | undefined,
  interval: number = 1
): string {
  const baseDate = safeParseDate(currentDueDate) || new Date();
  let nextDate = new Date(baseDate);

  switch (pattern) {
    case 'daily':
      nextDate = addDays(baseDate, interval || 1);
      break;
    case 'weekdays':
      do {
        nextDate = addDays(nextDate, 1);
      } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
      break;
    case 'weekly':
      nextDate = addWeeks(baseDate, interval || 1);
      break;
    case 'biweekly':
      nextDate = addWeeks(baseDate, (interval || 1) * 2);
      break;
    case 'monthly':
      nextDate = addMonths(baseDate, interval || 1);
      break;
    default:
      nextDate = addDays(baseDate, 1);
  }

  return format(nextDate, 'yyyy-MM-dd');
}

/**
 * Format date and time for iCalendar RFC-5545 (.ics export)
 * e.g. "20261026T143000" or "20261026"
 */
export function formatToICalDate(dateStr: string, timeStr?: string | null): string {
  try {
    const d = safeParseDate(dateStr) || new Date();
    if (timeStr && timeStr.includes(':')) {
      const [h, m] = timeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        d.setHours(h, m, 0, 0);
        return format(d, "yyyyMMdd'T'HHmmss");
      }
    }
    return format(d, 'yyyyMMdd');
  } catch {
    return format(new Date(), 'yyyyMMdd');
  }
}
