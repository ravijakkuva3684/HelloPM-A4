'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sun, 
  Calendar, 
  Inbox, 
  CheckCircle, 
  Clock, 
  Plus, 
  Layers, 
  Database,
  CalendarCheck,
  Settings,
  Download
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { TaskFilterType } from '@/types';

interface SidebarProps {
  onOpenNewCategory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewCategory }) => {
  const pathname = usePathname();
  const { 
    categories, 
    tasks, 
    activeFilter, 
    setActiveFilter, 
    selectedCategory, 
    setSelectedCategory,
    stats,
    exportTasksJson
  } = useTasks();
  const { isConfigured, isDemoMode } = useAuth();

  const isMainPage = pathname === '/';

  const handleFilterClick = (filter: TaskFilterType) => {
    setActiveFilter(filter);
    setSelectedCategory(null);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? null : catId);
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between p-4 hidden md:flex transition-colors">
      <div className="space-y-6">
        {/* Main Views */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
            Focus & Views
          </div>
          <nav className="space-y-1">
            {/* My Day */}
            <Link
              href="/"
              onClick={() => handleFilterClick('today')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isMainPage && activeFilter === 'today' && !selectedCategory
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sun className={`h-4 w-4 ${isMainPage && activeFilter === 'today' && !selectedCategory ? 'text-white' : 'text-amber-500'}`} />
                <span>My Day</span>
              </div>
              {(stats.dueToday > 0 || stats.overdue > 0) && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  isMainPage && activeFilter === 'today' && !selectedCategory
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                }`}>
                  {stats.dueToday + stats.overdue}
                </span>
              )}
            </Link>

            {/* All Tasks */}
            <Link
              href="/"
              onClick={() => handleFilterClick('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isMainPage && activeFilter === 'all' && !selectedCategory
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className={`h-4 w-4 ${isMainPage && activeFilter === 'all' && !selectedCategory ? 'text-white' : 'text-indigo-500'}`} />
                <span>All Tasks</span>
              </div>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                isMainPage && activeFilter === 'all' && !selectedCategory
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400'
              }`}>
                {stats.pending}
              </span>
            </Link>

            {/* Upcoming */}
            <Link
              href="/"
              onClick={() => handleFilterClick('upcoming')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isMainPage && activeFilter === 'upcoming' && !selectedCategory
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className={`h-4 w-4 ${isMainPage && activeFilter === 'upcoming' && !selectedCategory ? 'text-white' : 'text-sky-500'}`} />
                <span>Upcoming</span>
              </div>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                isMainPage && activeFilter === 'upcoming' && !selectedCategory
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400'
              }`}>
                {stats.upcoming}
              </span>
            </Link>

            {/* Calendar */}
            <Link
              href="/calendar"
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                pathname === '/calendar'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className={`h-4 w-4 ${pathname === '/calendar' ? 'text-white' : 'text-purple-500'}`} />
                <span>Calendar Schedule</span>
              </div>
            </Link>

            {/* Completed */}
            <Link
              href="/"
              onClick={() => handleFilterClick('completed')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isMainPage && activeFilter === 'completed' && !selectedCategory
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className={`h-4 w-4 ${isMainPage && activeFilter === 'completed' && !selectedCategory ? 'text-white' : 'text-emerald-500'}`} />
                <span>Completed</span>
              </div>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                isMainPage && activeFilter === 'completed' && !selectedCategory
                  ? 'bg-white/20 text-white'
                  : 'text-slate-400'
              }`}>
                {stats.completed}
              </span>
            </Link>
          </nav>
        </div>

        {/* Custom Categories Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Custom Categories
            </span>
            <button
              onClick={onOpenNewCategory}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Add New Category"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const count = tasks.filter((t) => t.category_id === cat.id && t.status === 'pending').length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <CategoryIcon name={cat.icon} color={cat.color} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full ml-1">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer & Cloud Persistence Status */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Storage:</span>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            isConfigured && !isDemoMode
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {isConfigured && !isDemoMode ? 'Supabase DB' : 'Local Persistence'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-slate-400" />
            <span>Settings</span>
          </Link>
          <button
            onClick={exportTasksJson}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Export Tasks JSON Backup"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
