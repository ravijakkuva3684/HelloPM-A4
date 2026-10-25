'use client';

import React from 'react';
import { 
  Sparkles, 
  X, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Check
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useTasks } from '@/context/TaskContext';
import { formatDueLabel, isTaskOverdue, isTaskDueToday, formatTime } from '@/lib/utils';
import { format } from 'date-fns';

export const DailySummaryModal: React.FC = () => {
  const { showDailySummaryModal, setShowDailySummaryModal } = useNotifications();
  const { tasks, toggleTaskStatus, rescheduleTask } = useTasks();

  if (!showDailySummaryModal) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const overdueTasks = tasks.filter((t) => t.status === 'pending' && isTaskOverdue(t));
  const todayTasks = tasks.filter((t) => t.status === 'pending' && isTaskDueToday(t));
  const upcomingTasks = tasks.filter(
    (t) => t.status === 'pending' && t.due_date && t.due_date > todayStr && !isTaskOverdue(t)
  );

  const handleSnoozeAllOverdue = () => {
    overdueTasks.forEach((t) => {
      rescheduleTask(t.id, todayStr, t.due_time || '10:00');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-6 text-white relative">
          <button
            onClick={() => setShowDailySummaryModal(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Daily Clarity Digest</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {format(new Date(), 'EEEE, MMMM d')}
          </h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-md">
            Here is your daily snapshot. Stay focused, tackle the highest priorities first, and conquer your day!
          </p>

          {/* Metric Badges */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur font-semibold">
              {todayTasks.length} Due Today
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-semibold backdrop-blur ${
              overdueTasks.length > 0 ? 'bg-rose-500/80 text-white' : 'bg-white/15'
            }`}>
              {overdueTasks.length} Overdue
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur font-semibold">
              {upcomingTasks.length} Upcoming
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Needs Immediate Attention ({overdueTasks.length})
                  </h3>
                </div>
                <button
                  onClick={handleSnoozeAllOverdue}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Move all to Today
                </button>
              </div>

              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="h-4 w-4 rounded border border-rose-300 dark:border-rose-700 flex items-center justify-center hover:bg-rose-100"
                      >
                        {task.status === 'completed' && <Check className="h-3 w-3 text-rose-600" />}
                      </button>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</span>
                    </div>
                    <span className="text-[11px] text-rose-600 font-medium">
                      Was due {task.due_date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Agenda */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Today&apos;s Focus ({todayTasks.length})
              </h3>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                No tasks scheduled for today yet. Great job or add a new goal!
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-indigo-50"
                      >
                        {task.status === 'completed' && <Check className="h-3 w-3 text-indigo-600" />}
                      </button>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{task.title}</span>
                    </div>
                    {task.due_time && (
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(task.due_time)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Snapshot */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-sky-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Coming Up This Week ({upcomingTasks.slice(0, 4).length})
              </h3>
            </div>

            <div className="space-y-2">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs"
                >
                  <span className="text-slate-700 dark:text-slate-300">{task.title}</span>
                  <span className="text-[11px] text-slate-400">{task.due_date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setShowDailySummaryModal(false)}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
          >
            Start My Day
          </button>
        </div>
      </div>
    </div>
  );
};
