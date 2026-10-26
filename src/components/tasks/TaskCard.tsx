'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  Repeat, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Bell,
  Sun,
  Moon,
  Mic,
  RotateCcw
} from 'lucide-react';
import { Task, SnoozeOption } from '@/types';
import { useTasks } from '@/context/TaskContext';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { SnoozeDropdown } from './SnoozeDropdown';
import { formatDueLabel, isTaskOverdue, isTaskDueToday, formatTime } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTaskStatus, deleteTask, snoozeTask, rescheduleTask } = useTasks();
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(task.due_date || '');
  const [rescheduleTime, setRescheduleTime] = useState(task.due_time || '');

  const isCompleted = task.status === 'completed';
  const isOverdue = isTaskOverdue(task);
  const isToday = isTaskDueToday(task);
  const dueInfo = formatDueLabel(task.due_date, task.due_time);

  const handleToggle = () => {
    toggleTaskStatus(task.id);
  };

  const handleApplyReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    rescheduleTask(task.id, rescheduleDate || null, rescheduleTime || null);
    setShowReschedule(false);
  };

  const priorityStyles = {
    urgent: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    high: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    medium: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
  };

  return (
    <div
      className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
          : isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50 shadow-sm hover:shadow-md'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Prominent, Highly-Clickable Completion Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/60 hover:border-emerald-500 hover:bg-emerald-50 text-slate-300 hover:text-emerald-600'
          }`}
          title={isCompleted ? 'Mark as pending' : 'Click to complete task'}
          aria-label={isCompleted ? 'Mark as pending' : 'Click to complete task'}
        >
          <Check className={`h-4 w-4 stroke-[3] transition-all ${isCompleted ? 'opacity-100 text-white' : 'opacity-40 hover:opacity-100'}`} />
        </button>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              onClick={() => onEdit(task)}
              className={`text-sm font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h4>

            {/* Quick Actions & Explicit Complete Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Dedicated Complete / Reopen Action Button */}
              <button
                type="button"
                onClick={handleToggle}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                  isCompleted
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-sm'
                }`}
                title={isCompleted ? 'Mark task as pending' : 'Mark task as completed'}
              >
                {isCompleted ? (
                  <>
                    <RotateCcw className="h-3 w-3 stroke-[2.5]" />
                    <span>Reopen</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Complete</span>
                  </>
                )}
              </button>

              {!isCompleted && (
                <>
                  <SnoozeDropdown onSnooze={(opt, custom) => snoozeTask(task.id, opt, custom)} />
                  <button
                    onClick={() => setShowReschedule(!showReschedule)}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Reschedule Due Date"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Edit Details"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges & Metadata */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
            {/* Category Pill */}
            {task.category && (
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  color: task.category.color,
                }}
              >
                <CategoryIcon name={task.category.icon} color={task.category.color} className="w-3 h-3" />
                <span>{task.category.name}</span>
              </div>
            )}

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border text-[10px] uppercase tracking-wider ${
                priorityStyles[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {/* Due Date & Time */}
            {task.due_date && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                  isOverdue
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-semibold'
                    : isToday
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="h-3 w-3 text-rose-600" />
                ) : isToday ? (
                  <Sun className="h-3 w-3 text-amber-600" />
                ) : (
                  <Clock className="h-3 w-3 text-slate-400" />
                )}
                <span>{dueInfo.text}</span>
              </span>
            )}

            {/* Recurring Badge */}
            {task.is_recurring && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-medium border border-purple-200/50 dark:border-purple-900/40"
                title={`Repeats ${task.recurrence_pattern}`}
              >
                <Repeat className="h-3 w-3" />
                <span className="capitalize">{task.recurrence_pattern || 'Recurring'}</span>
              </span>
            )}

            {/* Snoozed State Indicator */}
            {task.snooze_until && new Date(task.snooze_until) > new Date() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200/50">
                <Moon className="h-3 w-3" />
                <span>Snoozed until {format(new Date(task.snooze_until), 'h:mm a')}</span>
              </span>
            )}

            {/* Reminder Setting Indicator */}
            {task.reminder_lead_minutes !== undefined && task.reminder_lead_minutes > 0 && (
              <span
                className="inline-flex items-center gap-1 text-slate-400 text-[10px]"
                title={`Reminder set ${task.reminder_lead_minutes}m before due`}
              >
                <Bell className="h-3 w-3" />
                <span>-{task.reminder_lead_minutes}m</span>
              </span>
            )}
          </div>

          {/* Inline Reschedule Drawer */}
          {showReschedule && (
            <form
              onSubmit={handleApplyReschedule}
              className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 animate-fade-in"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Reschedule
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
