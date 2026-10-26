'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  User, 
  Bell, 
  Moon, 
  Volume2, 
  Calendar, 
  Database, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTasks } from '@/context/TaskContext';
import { soundManager } from '@/lib/sound';
import { downloadCalendarICS } from '@/lib/ical';

export default function SettingsPage() {
  const { profile, updateProfile, isConfigured, isDemoMode } = useAuth();
  const { 
    preferences, 
    updatePreferences, 
    browserPermission, 
    requestBrowserPermission, 
    sendCustomTestNotification 
  } = useNotifications();
  const { tasks, clearCompletedTasks, exportTasksJson } = useTasks();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [timeZone, setTimeZone] = useState(profile?.time_zone || 'UTC');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Common time zones
  const timeZones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      time_zone: timeZone,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestSound = () => {
    soundManager.playReminder();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Tasks
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-indigo-500" /> Replay 4-Slide Tour
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, notification delivery rules, quiet hours, and data export.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 animate-pop-in">
            <Check className="h-4 w-4" />
            <span>Saved successfully!</span>
          </div>
        )}
      </div>

      {/* 1. Profile & Time Zone */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Profile & Regional
            </h2>
            <p className="text-xs text-slate-400">
              Customize how your profile appears and set your local time zone.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || 'demo@remindly.app'}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Zone
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full sm:w-1/2 text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {timeZones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for computing accurate reminder trigger windows and recurring schedule rollovers.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
            >
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* 2. Notification Management & Duplicate Prevention */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Notification Delivery & Deduplication
              </h2>
              <p className="text-xs text-slate-400">
                Choose how and when Remindly alerts you, avoiding redundant notifications.
              </p>
            </div>
          </div>

          <button
            onClick={sendCustomTestNotification}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 rounded-xl transition-colors border border-indigo-200/50"
          >
            Send Test Alert
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* Browser Desktop Notifications */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Browser Desktop Notifications
              </div>
              <div className="text-slate-400 text-[11px]">
                Receive instant pop-ups even when Remindly is open in the background.
              </div>
            </div>
            <div className="flex items-center gap-3">
              {browserPermission !== 'granted' && (
                <button
                  onClick={requestBrowserPermission}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Request Permission
                </button>
              )}
              <input
                type="checkbox"
                checked={preferences.browser_notifications}
                onChange={(e) => updatePreferences({ browser_notifications: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sound Alerts */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Sound Chimes
              </div>
              <div className="text-slate-400 text-[11px]">
                Play gentle tones when reminders trigger and when tasks are completed.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestSound}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Test Audio Chime"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <input
                type="checkbox"
                checked={preferences.sound_enabled}
                onChange={(e) => updatePreferences({ sound_enabled: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Prevent Duplicate Notifications */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Avoid Duplicate Reminders</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  Active
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Suppresses redundant repeated alerts if you have already been notified for this time slot.
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.prevent_duplicate_reminders}
              onChange={(e) => updatePreferences({ prevent_duplicate_reminders: e.target.checked })}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Daily Summary Digest */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Daily Morning Digest
              </div>
              <div className="text-slate-400 text-[11px]">
                Automatically surfaces an overview of due and overdue items to jumpstart your day.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={preferences.daily_summary_time}
                onChange={(e) => updatePreferences({ daily_summary_time: e.target.value })}
                className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="checkbox"
                checked={preferences.daily_summary_enabled}
                onChange={(e) => updatePreferences({ daily_summary_enabled: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Quiet Hours (Do Not Disturb)</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Mute all notification sounds and popups during your sleep window.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.quiet_hours_enabled}
                onChange={(e) => updatePreferences({ quiet_hours_enabled: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="flex items-center gap-3 pt-2 pl-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Start:</span>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => updatePreferences({ quiet_hours_start: e.target.value })}
                    className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">End:</span>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => updatePreferences({ quiet_hours_end: e.target.value })}
                    className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Calendar Sync Architecture */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Calendar Integration (Google Calendar Ready)
            </h2>
            <p className="text-xs text-slate-400">
              Synchronize responsibilities with Google Calendar or Apple Calendar.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Architecture Status: Google Calendar Sync Ready
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                The database schema includes <code>google_calendar_event_id</code> and supports RFC 5545 iCalendar serialization. You can export your tasks as an <code>.ics</code> calendar feed right now, or connect Google OAuth when you want automated two-way synchronization.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => downloadCalendarICS(tasks)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Remindly Calendar (.ics)</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Import this file directly into Google Calendar (Settings &gt; Import & Export).
            </span>
          </div>
        </div>
      </section>

      {/* 4. Persistence & Supabase Connection */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Persistence & Supabase Setup
            </h2>
            <p className="text-xs text-slate-400">
              Cloud PostgreSQL database configuration with Row-Level Security.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Connection Status
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              isConfigured && !isDemoMode
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {isConfigured && !isDemoMode ? 'Connected to Supabase PostgreSQL' : 'Interactive Local / Demo Mode'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isConfigured && !isDemoMode ? (
              'All tasks, custom categories, and notification preferences are securely synced in real time to your cloud PostgreSQL database with user-isolated RLS policies.'
            ) : (
              'Remindly is operating in zero-friction Local Mode with persistent browser storage. To connect your live Supabase cloud project, paste your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY into your .env.local file and run supabase/schema.sql in your Supabase SQL Editor.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={exportTasksJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export Full JSON Backup</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Delete all completed tasks to clean up your workspace?')) {
                  clearCompletedTasks();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Completed Tasks</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
