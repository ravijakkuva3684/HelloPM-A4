'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Clock, 
  Calendar, 
  Tag, 
  Repeat, 
  AlertCircle, 
  Check, 
  Moon, 
  CheckCircle2, 
  Bell,
  Mic,
  MicOff
} from 'lucide-react';
import { Task, PriorityLevel, RecurrencePattern } from '@/types';
import { useTasks } from '@/context/TaskContext';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { SnoozeDropdown } from './SnoozeDropdown';
import { listenToSpeech } from '@/lib/speech';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const { categories, updateTask, deleteTask, toggleTaskStatus, snoozeTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [isListeningTitle, setIsListeningTitle] = useState(false);

  const handleVoiceTitle = () => {
    if (isListeningTitle) {
      setIsListeningTitle(false);
      return;
    }
    setIsListeningTitle(true);
    listenToSpeech({
      onResult: (spokenText) => {
        setTitle(spokenText);
      },
      onError: () => setIsListeningTitle(false),
      onEnd: () => setIsListeningTitle(false),
    });
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategoryId(task.category_id || '');
      setDueDate(task.due_date || '');
      setDueTime(task.due_time || '');
      setPriority(task.priority);
      setIsRecurring(task.is_recurring);
      setRecurrencePattern(task.recurrence_pattern || 'daily');
      setRecurrenceInterval(task.recurrence_interval || 1);
      setReminderMinutes(task.reminder_lead_minutes || 0);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId || null,
      due_date: dueDate || null,
      due_time: dueTime || null,
      priority,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_interval: recurrenceInterval,
      reminder_lead_minutes: reminderMinutes,
    });

    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toggleTaskStatus(task.id)}
              className={`flex h-6 w-6 items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
                task.status === 'completed'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50'
              }`}
              title={task.status === 'completed' ? 'Mark as pending' : 'Click to complete task'}
            >
              {task.status === 'completed' && <Check className="h-4 w-4 stroke-[3]" />}
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {task.status === 'completed' ? 'Completed Task' : 'Edit Task'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SnoozeDropdown onSnooze={(opt, custom) => snoozeTask(task.id, opt, custom)} />
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Title
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full text-base font-semibold pl-3 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isListeningTitle ? 'border-rose-500 ring-2 ring-rose-500/20 animate-pulse' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              <button
                type="button"
                onClick={handleVoiceTitle}
                className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                  isListeningTitle
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-indigo-600'
                }`}
                title="Speak task title"
              >
                {isListeningTitle ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Notes / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add details, checklists, or reference links..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Due Date
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white border-none focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Due Time
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white border-none focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reminder & Recurrence Options */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Recurring Task
                </span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <select
                  value={recurrencePattern}
                  onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
                  className="text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every 2 Weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
                <div className="flex items-center gap-1.5 px-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                    className="w-12 p-1 bg-transparent text-center font-bold text-slate-800 dark:text-slate-200 border-none focus:outline-none"
                  />
                  <span className="text-slate-400">cycle</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Notification Alert
                </span>
              </div>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="text-xs p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value={0}>At scheduled time</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          </div>

          {/* Footer Save & Complete Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                toggleTaskStatus(task.id);
                onClose();
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                task.status === 'completed'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25'
              }`}
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>{task.status === 'completed' ? 'Mark as Pending' : 'Complete Task'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
