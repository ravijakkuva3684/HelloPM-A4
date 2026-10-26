'use client';

import React, { useMemo } from 'react';
import { 
  Sparkles, 
  X, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Sun, 
  ArrowDownCircle,
  MoveRight
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { isTaskDueToday, isTaskOverdue, formatTime } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import confetti from 'canvas-confetti';

interface AiPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPlanningModal: React.FC<AiPlanningModalProps> = ({ isOpen, onClose }) => {
  const { tasks, rescheduleTask } = useTasks();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  // Filter today's tasks and overdue tasks
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'pending' && (isTaskDueToday(t) || isTaskOverdue(t)));
  }, [tasks]);

  // AI-suggested ordering logic
  const planningPlan = useMemo(() => {
    const overdue = pendingTasks.filter((t) => isTaskOverdue(t));
    const urgent = pendingTasks.filter((t) => t.priority === 'urgent' && !isTaskOverdue(t));
    const high = pendingTasks.filter((t) => t.priority === 'high' && !isTaskOverdue(t));
    const timed = pendingTasks.filter((t) => Boolean(t.due_time) && t.priority !== 'urgent' && t.priority !== 'high' && !isTaskOverdue(t));
    const medium = pendingTasks.filter((t) => t.priority === 'medium' && !t.due_time && !isTaskOverdue(t));
    const low = pendingTasks.filter((t) => t.priority === 'low' && !isTaskOverdue(t));

    // Suggested sequence: Overdue -> Urgent -> Timed -> High -> Medium
    const ordered = [...overdue, ...urgent, ...timed, ...high, ...medium];
    const deferrableTasks = low.length > 0 ? low : medium.slice(2);

    // AI generated summary text
    let summary = '';
    if (pendingTasks.length === 0) {
      summary = "You have no pending tasks scheduled for today. Your day is completely clear!";
    } else {
      const parts: string[] = [];
      parts.push(`You have ${pendingTasks.length} task${pendingTasks.length > 1 ? 's' : ''} on your radar.`);
      
      if (overdue.length > 0) {
        parts.push(`Prioritize the ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''} right away.`);
      }
      
      if (timed.length > 0) {
        const firstTimed = timed[0];
        parts.push(`Stay mindful of "${firstTimed.title}" at ${formatTime(firstTimed.due_time)}.`);
      }

      if (deferrableTasks.length > 0) {
        parts.push(`Consider deferring "${deferrableTasks[0].title}" to tomorrow to avoid burnout.`);
      }

      summary = parts.join(' ');
    }

    return {
      orderedTasks: ordered,
      deferrableTasks,
      summary,
    };
  }, [pendingTasks]);

  if (!isOpen) return null;

  const handleDeferTask = (taskId: string) => {
    rescheduleTask(taskId, tomorrowStr, '10:00');
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch {}
  };

  const handleDeferAllRecommended = () => {
    planningPlan.deferrableTasks.forEach((t) => {
      rescheduleTask(t.id, tomorrowStr, '10:00');
    });
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>AI Daily Planning Assistant</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Optimal Schedule for Today
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
            AI reviews due dates, priorities, and deadlines to structure a realistic, high-impact sequence.
          </p>
        </div>

        {/* AI Insight Box */}
        <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">AI Day Recommendation:</span>
            <span className="leading-relaxed">{planningPlan.summary}</span>
          </div>
        </div>

        {/* Suggested Task Order List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-slate-400">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 opacity-80" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                You're all caught up!
              </p>
              <p className="text-[11px]">
                No pending tasks left for today. Take time to relax or add a new goal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>SUGGESTED COMPLETION ORDER</span>
                <span>{planningPlan.orderedTasks.length} Planned</span>
              </div>

              <div className="space-y-2">
                {planningPlan.orderedTasks.map((task, idx) => {
                  const isOverdue = isTaskOverdue(task);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Step Number Badge */}
                        <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {task.due_time && (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatTime(task.due_time)}
                              </span>
                            )}
                            {task.category && <span>{task.category.name}</span>}
                            {isOverdue && <span className="text-rose-500 font-bold">Overdue</span>}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {task.priority}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Deferrable Recommendations */}
              {planningPlan.deferrableTasks.length > 0 && (
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      💡 Recommended to Defer to Tomorrow:
                    </span>
                    <button
                      type="button"
                      onClick={handleDeferAllRecommended}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Move to Tomorrow
                    </button>
                  </div>

                  {planningPlan.deferrableTasks.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
                      <button
                        type="button"
                        onClick={() => handleDeferTask(t.id)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Move</span>
                        <MoveRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Remindly AI dynamically adapts as you complete tasks.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Apply Plan & Close
          </button>
        </div>
      </div>
    </div>
  );
};
