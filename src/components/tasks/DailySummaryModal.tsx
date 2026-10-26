'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  X, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Check,
  Search,
  Mic,
  MicOff,
  Filter,
  RotateCcw,
  Sun,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useTasks } from '@/context/TaskContext';
import { formatDueLabel, isTaskOverdue, isTaskDueToday, formatTime, safeParseDate } from '@/lib/utils';
import { format, addDays, startOfDay } from 'date-fns';
import { listenToSpeech } from '@/lib/speech';

type DigestTab = 'today' | 'next7' | 'next30';

export const DailySummaryModal: React.FC = () => {
  const { showDailySummaryModal, setShowDailySummaryModal } = useNotifications();
  const { tasks, categories, toggleTaskStatus, rescheduleTask } = useTasks();

  const [activeTab, setActiveTab] = useState<DigestTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isListening, setIsListening] = useState(false);

  const today = startOfDay(new Date());
  const todayStr = format(today, 'yyyy-MM-dd');
  const next7DaysLimit = startOfDay(addDays(today, 7));
  const next30DaysLimit = startOfDay(addDays(today, 30));

  // Tab tasks partitioning
  const overdueTasks = (tasks || []).filter((t) => t.status === 'pending' && isTaskOverdue(t));
  const todayTasks = (tasks || []).filter((t) => t.status === 'pending' && isTaskDueToday(t));

  const next7Count = (tasks || []).filter((t) => {
    if (t.status !== 'pending' || !t.due_date) return false;
    const d = safeParseDate(t.due_date);
    if (!d) return false;
    const targetDay = startOfDay(d);
    return targetDay >= today && targetDay <= next7DaysLimit;
  }).length;

  const next30Count = (tasks || []).filter((t) => {
    if (t.status !== 'pending' || !t.due_date) return false;
    const d = safeParseDate(t.due_date);
    if (!d) return false;
    const targetDay = startOfDay(d);
    return targetDay >= today && targetDay <= next30DaysLimit;
  }).length;

  const tabFilteredTasks = useMemo(() => {
    try {
      return (tasks || []).filter((task) => {
        // 1. Tab criteria
        if (activeTab === 'today') {
          const isToday = isTaskDueToday(task);
          const isOverdue = isTaskOverdue(task);
          if (!isToday && !isOverdue) return false;
        } else if (activeTab === 'next7') {
          if (!task.due_date) return false;
          const d = safeParseDate(task.due_date);
          if (!d) return false;
          const targetDay = startOfDay(d);
          if (targetDay < today || targetDay > next7DaysLimit) return false;
        } else if (activeTab === 'next30') {
          if (!task.due_date) return false;
          const d = safeParseDate(task.due_date);
          if (!d) return false;
          const targetDay = startOfDay(d);
          if (targetDay < today || targetDay > next30DaysLimit) return false;
        }

        // 2. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title ? task.title.toLowerCase().includes(q) : false;
          const matchesDesc = task.description ? task.description.toLowerCase().includes(q) : false;
          const matchesCat = task.category?.name ? task.category.name.toLowerCase().includes(q) : false;
          if (!matchesTitle && !matchesDesc && !matchesCat) return false;
        }

        // 3. Category filter
        if (selectedCategory !== 'all') {
          if (task.category_id !== selectedCategory) return false;
        }

        // 4. Status filter
        if (statusFilter !== 'all') {
          if (task.status !== statusFilter) return false;
        }

        // 5. Date range filter
        if (startDate || endDate) {
          const d = safeParseDate(task.due_date);
          if (!d) return false;
          const targetDay = startOfDay(d);
          if (startDate) {
            const s = safeParseDate(startDate);
            if (s && targetDay < startOfDay(s)) return false;
          }
          if (endDate) {
            const e = safeParseDate(endDate);
            if (e && targetDay > startOfDay(e)) return false;
          }
        }

        return true;
      });
    } catch (err) {
      console.error('Error filtering digest tasks:', err);
      return [];
    }
  }, [tasks, activeTab, searchQuery, selectedCategory, statusFilter, startDate, endDate, today, next7DaysLimit, next30DaysLimit]);

  const handleSnoozeAllOverdue = () => {
    overdueTasks.forEach((t) => {
      rescheduleTask(t.id, todayStr, t.due_time || '10:00');
    });
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    listenToSpeech({
      onResult: (spokenText) => {
        setSearchQuery(spokenText);
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Boolean(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' || startDate || endDate);

  // Unconditional hook safety: guard modal render right before JSX return
  if (!showDailySummaryModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative">
          <button
            onClick={() => setShowDailySummaryModal(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Review Daily Digest</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Schedule Overview & Digest
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-lg leading-relaxed">
            Review your priorities, search across time horizons, or filter tasks by category and status.
          </p>

          {/* 3 CLICKABLE SECTION TABS AT TOP */}
          <div className="mt-4 grid grid-cols-3 gap-2 bg-white/10 p-1 rounded-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Today</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'today' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}`}>
                {todayTasks.length + overdueTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('next7')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'next7'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Next 7 Days</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'next7' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}`}>
                {next7Count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('next30')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'next30'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>Next 30 Days</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'next30' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}`}>
                {next30Count}
              </span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar with Mic */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
          {/* Search bar with Mic button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isListening ? "Listening... speak now" : "Search in digest by keyword, note, or tag..."}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mic Option */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse shadow-md shadow-rose-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-blue-600'
              }`}
              title={isListening ? "Listening... click to stop" : "Search with voice"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>

          {/* Secondary Filters: Date Range, Category, Status */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {(categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Completed Only</option>
            </select>

            {/* Date Range: From / To */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none p-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none p-0 cursor-pointer"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Tasks Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Overdue alert if on Today tab */}
          {activeTab === 'today' && overdueTasks.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
                  {overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} overdue from previous days
                </span>
              </div>
              <button
                type="button"
                onClick={handleSnoozeAllOverdue}
                className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-rose-200 shadow-xs hover:shadow"
              >
                Move all to Today
              </button>
            </div>
          )}

          {/* Filtered Tasks Listing */}
          {tabFilteredTasks.length === 0 ? (
            <div className="text-center py-12 space-y-2 text-slate-400">
              <CheckCircle2 className="h-10 w-10 mx-auto opacity-30 text-blue-500" />
              <p className="text-xs font-medium">
                {hasActiveFilters ? 'No tasks match your search and filter criteria.' : 'No tasks scheduled in this section.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {tabFilteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const dueInfo = formatDueLabel(task.due_date, task.due_time);

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 opacity-60'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`h-6 w-6 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 text-slate-300 hover:text-emerald-600'
                        }`}
                        title={isCompleted ? 'Mark as pending' : 'Click to complete task'}
                      >
                        <Check className={`h-3.5 w-3.5 stroke-[3] ${isCompleted ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />
                      </button>

                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {task.due_date && <span>{dueInfo.text}</span>}
                          {task.category && <span>• {task.category.name}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Explicit Complete / Completed button & Priority badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                        title={isCompleted ? 'Click to reopen' : 'Click to complete'}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>{isCompleted ? 'Completed' : 'Complete'}</span>
                      </button>

                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setShowDailySummaryModal(false)}
            className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Digest
          </button>
        </div>
      </div>
    </div>
  );
};
