'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Search, 
  Plus, 
  Sparkles, 
  Check, 
  Trash2, 
  Clock, 
  AlertCircle, 
  User as UserIcon,
  LogOut,
  Sliders,
  Calendar as CalendarIcon,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { formatTime } from '@/lib/utils';

interface NavbarProps {
  onOpenQuickAdd: () => void;
  onOpenVoice?: () => void;
  onOpenAiPlanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd, onOpenVoice, onOpenAiPlanner }) => {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useTasks();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    triggerManualSummary 
  } = useNotifications();
  const { user, profile, isDemoMode, isConfigured, signOut } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors">
      {/* Brand & Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white tracking-tight group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg leading-tight font-extrabold bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Remindly
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-normal -mt-0.5">
              Personal Clarity
            </span>
          </div>
        </Link>

        {/* Global Search */}
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or tags..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Summary Button */}
        <button
          onClick={triggerManualSummary}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-lg transition-colors border border-indigo-200/50 dark:border-indigo-800/40"
          title="Open Daily Summary & Digest"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Daily Digest</span>
        </button>

        {/* Open Mic Voice Assistant */}
        {onOpenVoice && (
          <button
            onClick={onOpenVoice}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open Voice Assistant & Mic"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        {/* Add New Button */}
        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-all hover:shadow active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            title="Notifications & Reminders"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-3 animate-pop-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Reminders & Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Clock className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                    No reminders yet. You&apos;re all caught up!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                        n.is_read
                          ? 'bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-800 dark:text-slate-100 border border-indigo-100/60 dark:border-indigo-900/40'
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'overdue' ? (
                          <AlertCircle className="h-4 w-4 text-rose-500" />
                        ) : n.type === 'summary' ? (
                          <Sparkles className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Bell className="h-4 w-4 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{n.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {n.message}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(n.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href="/settings"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 inline-flex items-center gap-1"
                >
                  <Sliders className="h-3 w-3" /> Notification & Quiet Hours Settings
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Status Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/20">
              {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 'RM'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 animate-pop-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {profile?.full_name || 'Personal Account'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {profile?.email || (user ? user.email : 'demo@remindly.app')}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${isConfigured && !isDemoMode ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {isConfigured && !isDemoMode ? 'Supabase Cloud Connected' : 'Local / Demo Mode'}
                  </span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                Settings & Preferences
              </Link>

              <Link
                href="/calendar"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                Calendar Schedule
              </Link>

              <Link
                href="/onboarding"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-medium transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Product Tour (4 Slides)
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

              {user || isDemoMode || profile ? (
                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    await signOut();
                    router.push('/auth/login');
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-medium transition-colors"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  Sign In / Register
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
