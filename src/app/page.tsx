'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Filter, 
  Search,
  CheckCircle,
  Inbox
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { TaskCard } from '@/components/tasks/TaskCard';
import { QuickTaskInput } from '@/components/tasks/QuickTaskInput';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { Task, Category } from '@/types';
import { isTaskOverdue, isTaskDueToday } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { 
    tasks, 
    categories, 
    activeFilter, 
    setActiveFilter, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery, 
    stats 
  } = useTasks();
  const { triggerManualSummary } = useNotifications();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(false);

  // Filter tasks based on search and active category / view
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesCat = task.category?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // 2. Category Filter
      if (selectedCategory && task.category_id !== selectedCategory) {
        return false;
      }

      // 3. View Filter
      if (activeFilter === 'completed') {
        return task.status === 'completed';
      }

      if (activeFilter === 'today') {
        if (task.status === 'completed') return false;
        return isTaskDueToday(task) || isTaskOverdue(task);
      }

      if (activeFilter === 'upcoming') {
        if (task.status === 'completed') return false;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        return Boolean(task.due_date && task.due_date > todayStr && !isTaskOverdue(task));
      }

      // 'all' filter shows pending tasks in sections
      return true;
    });
  }, [tasks, searchQuery, selectedCategory, activeFilter]);

  // Split into My Day sections
  const overdueTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending' && isTaskOverdue(t)),
    [filteredTasks]
  );

  const todayTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending' && isTaskDueToday(t)),
    [filteredTasks]
  );

  const upcomingTasks = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return filteredTasks.filter(
      (t) => t.status === 'pending' && t.due_date && t.due_date > todayStr && !isTaskOverdue(t)
    );
  }, [filteredTasks]);

  const noDateTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending' && !t.due_date),
    [filteredTasks]
  );

  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'completed'),
    [filteredTasks]
  );

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* Hero Welcome / My Day Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-1">
              <Sun className="h-4 w-4 text-amber-400" />
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {profile?.full_name?.split(' ')[0] || 'Friend'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 max-w-md leading-relaxed">
              {stats.overdue > 0
                ? `You have ${stats.overdue} overdue task${stats.overdue > 1 ? 's' : ''} and ${stats.dueToday} scheduled for today.`
                : stats.dueToday > 0
                ? `You have ${stats.dueToday} task${stats.dueToday > 1 ? 's' : ''} on your agenda today.`
                : 'Your schedule is clear for today! Kick back or plan ahead.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerManualSummary}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs backdrop-blur border border-white/10 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Review Daily Digest</span>
            </button>
          </div>
        </div>

        {/* Mini progress tracker */}
        {stats.total > 0 && (
          <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
            <span>
              {stats.completed} of {stats.total} total completed ({Math.round((stats.completed / stats.total) * 100)}%)
            </span>
            <div className="w-36 h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            !selectedCategory
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>All Categories</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <CategoryIcon name={cat.icon} color={cat.color} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-dashed border-indigo-300 dark:border-indigo-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Quick Task Entry Input */}
      <div>
        <QuickTaskInput />
      </div>

      {/* Active Filter Header (if searching or category selected) */}
      {(selectedCategoryObj || searchQuery) && (
        <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Filtered by:</span>
            {selectedCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                <CategoryIcon name={selectedCategoryObj.icon} color={selectedCategoryObj.color} className="w-3 h-3" />
                {selectedCategoryObj.name}
              </span>
            )}
            {searchQuery && (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedCategory(null);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 1. Overdue Tasks Section */}
      {overdueTasks.length > 0 && activeFilter !== 'completed' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Overdue ({overdueTasks.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-500 font-medium">Action needed</span>
          </div>
          <div className="space-y-2.5">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        </section>
      )}

      {/* 2. Due Today Tasks Section */}
      {activeFilter !== 'completed' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <Sun className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Due Today ({todayTasks.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">{format(new Date(), 'MMM d')}</span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400 bg-white/40 dark:bg-slate-900/40">
              <CheckCircle2 className="h-7 w-7 text-emerald-500 mx-auto mb-2 opacity-80" />
              No pending tasks due today. You&apos;re all clear!
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Upcoming Tasks Section (visible in 'all' and 'upcoming' filter) */}
      {(activeFilter === 'all' || activeFilter === 'upcoming') && upcomingTasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Upcoming Responsibilities ({upcomingTasks.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {upcomingTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        </section>
      )}

      {/* 4. No Due Date Section */}
      {activeFilter === 'all' && noDateTasks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Inbox className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              No Due Date ({noDateTasks.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {noDateTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Completed Tasks Section (Collapsible) */}
      {(activeFilter === 'completed' || completedTasks.length > 0) && (
        <section className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => setShowCompletedSection(!showCompletedSection)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {showCompletedSection ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Completed Tasks ({completedTasks.length})</span>
          </button>

          {(showCompletedSection || activeFilter === 'completed') && (
            <div className="space-y-2.5 animate-fade-in">
              {completedTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No completed tasks yet. Check off items as you finish them!
                </div>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Category Modal */}
      <CategoryModal
        category={editingCategory}
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
