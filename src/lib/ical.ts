import { Task } from '@/types';
import { formatToICalDate } from './utils';

/**
 * Generates an RFC-5545 compliant iCalendar (.ics) string from tasks
 * Compatible with Google Calendar, Apple Calendar, Outlook, and web feeds.
 */
export function generateICS(tasks: Task[], calendarName = 'Remindly Tasks'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Remindly//Task Calendar 1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
  ];

  tasks.forEach((task) => {
    if (!task.due_date) return;

    const dtStart = formatToICalDate(task.due_date, task.due_time);
    const summary = task.title.replace(/[,;]/g, '\\$&');
    const description = (task.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&');
    const status = task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:task-${task.id}@remindly.app`);
    lines.push(`DTSTAMP:${formatToICalDate(new Date().toISOString())}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`SUMMARY:${summary}`);
    if (description) {
      lines.push(`DESCRIPTION:${description}`);
    }
    lines.push(`STATUS:${status}`);

    // If recurring
    if (task.is_recurring && task.recurrence_pattern) {
      let rrule = '';
      if (task.recurrence_pattern === 'daily') rrule = 'FREQ=DAILY';
      else if (task.recurrence_pattern === 'weekdays') rrule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
      else if (task.recurrence_pattern === 'weekly') rrule = 'FREQ=WEEKLY';
      else if (task.recurrence_pattern === 'biweekly') rrule = 'FREQ=WEEKLY;INTERVAL=2';
      else if (task.recurrence_pattern === 'monthly') rrule = 'FREQ=MONTHLY';

      if (rrule) {
        lines.push(`RRULE:${rrule}`);
      }
    }

    // Alarm reminder
    if (task.reminder_lead_minutes !== undefined && task.reminder_lead_minutes >= 0) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${summary}`);
      lines.push(`TRIGGER:-PT${task.reminder_lead_minutes}M`);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Initiates download of .ics file directly in browser
 */
export function downloadCalendarICS(tasks: Task[]): void {
  const icsData = generateICS(tasks);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `remindly_calendar_${new Date().toISOString().slice(0, 10)}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
