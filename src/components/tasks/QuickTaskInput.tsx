'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  Flag, 
  Repeat, 
  Bell, 
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { PriorityLevel, RecurrencePattern } from '@/types';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { format, addDays } from 'date-fns';

interface QuickTaskInputProps {
  onSuccess?: () => void;
  defaultDate?: string;
}

export const QuickTaskInput: React.FC<QuickTaskInputProps> = ({ onSuccess, defaultDate }) => {
  const { categories, createTask, selectedCategory } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [categoryId, setCategoryId] = useState<string>(selectedCategory || '');
  const [dueDate, setDueDate] = useState(defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || null,
        due_date: dueDate || null,
        due_time: dueTime || null,
        priority,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        reminder_lead_minutes: reminderMinutes,
      });

      setTitle('');
      setDescription('');
      setShowDetails(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek' | 'someday') => {
    const today = new Date();
    if (type === 'today') setDueDate(format(today, 'yyyy-MM-dd'));
    if (type === 'tomorrow') setDueDate(format(addDays(today, 1), 'yyyy-MM-dd'));
    if (type === 'nextWeek') setDueDate(format(addDays(today, 7), 'yyyy-MM-dd'));
    if (type === 'someday') setDueDate('');
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all focus-within:shadow-md focus-within:border-indigo-500/50 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Input Row */}
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Plus className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to get done? (e.g. Schedule doctor checkup, File taxes...)"
            className="flex-1 text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Add'}
          </button>
        </div>

        {/* Expandable Description */}
        {showDetails && (
          <div className="animate-fade-in pt-1">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes, links, or subtasks..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Quick Attribute Badges & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Selector */}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Due Date Input */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <Calendar className="h-3 w-3 text-slate-400" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent border-none text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none p-0 cursor-pointer"
              />
            </div>

            {/* Due Time Input */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <Clock className="h-3 w-3 text-slate-400" />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="Time"
                className="bg-transparent border-none text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none p-0 cursor-pointer"
              />
            </div>

            {/* Priority Selector */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Recurrence Toggle */}
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium text-[11px] transition-colors ${
                isRecurring
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Repeat className="h-3 w-3" />
              <span>{isRecurring ? 'Recurring' : 'Repeat'}</span>
            </button>

            {isRecurring && (
              <select
                value={recurrencePattern}
                onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                className="px-2 py-1 text-[11px] rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-none font-medium cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Every Weekday (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}

            {/* Reminder Lead Selector */}
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="px-2 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Reminder notification lead time"
            >
              <option value={0}>Remind at time</option>
              <option value={10}>10 mins before</option>
              <option value={15}>15 mins before</option>
              <option value={30}>30 mins before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>

          {/* Toggle details link */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {showDetails ? 'Hide Notes' : '+ Add Notes'}
          </button>
        </div>
      </form>
    </div>
  );
};
