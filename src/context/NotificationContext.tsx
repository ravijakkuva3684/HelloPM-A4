'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { NotificationPreference, InAppNotification, Task } from '@/types';
import { INITIAL_PREFERENCES } from '@/lib/mockData';
import { useAuth } from './AuthContext';
import { useTasks } from './TaskContext';
import { soundManager } from '@/lib/sound';
import { createClient } from '@/lib/supabase/client';
import { isTaskOverdue, isTaskDueToday } from '@/lib/utils';
import { parseISO, subMinutes, isPast } from 'date-fns';

interface NotificationContextType {
  preferences: NotificationPreference;
  notifications: InAppNotification[];
  unreadCount: number;
  browserPermission: NotificationPermission;
  requestBrowserPermission: () => Promise<boolean>;
  updatePreferences: (updates: Partial<NotificationPreference>) => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  showDailySummaryModal: boolean;
  setShowDailySummaryModal: (show: boolean) => void;
  triggerManualSummary: () => void;
  sendCustomTestNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFS_KEY = 'remindly_notification_prefs_v1';
const LOCAL_STORAGE_NOTIFS_KEY = 'remindly_notifications_history_v1';
const SENT_KEYS_STORAGE_KEY = 'remindly_sent_alert_keys_v1';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode, isConfigured } = useAuth();
  const { tasks } = useTasks();

  const [preferences, setPreferences] = useState<NotificationPreference>(INITIAL_PREFERENCES);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [showDailySummaryModal, setShowDailySummaryModal] = useState(false);

  // Keep track of sent notifications to eliminate duplicate spam
  const sentNotificationKeysRef = useRef<Set<string>>(new Set());

  // Initialize permission state
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Load preferences and notification history
  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem(SENT_KEYS_STORAGE_KEY);
      if (storedKeys) {
        sentNotificationKeysRef.current = new Set(JSON.parse(storedKeys));
      }

      if (isDemoMode || !isConfigured || !user) {
        const storedPrefs = localStorage.getItem(LOCAL_STORAGE_PREFS_KEY);
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        }
        const storedNotifs = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
        if (storedNotifs) {
          setNotifications(JSON.parse(storedNotifs));
        }
        return;
      }

      // Fetch from Supabase
      const supabase = createClient();
      if (!supabase) return;

      supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setPreferences(data as NotificationPreference);
          }
        });

      supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
        .then(({ data }) => {
          if (data) {
            setNotifications(data as InAppNotification[]);
          }
        });
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    }
  }, [user, isDemoMode, isConfigured]);

  const requestBrowserPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      return permission === 'granted';
    } catch (e) {
      console.error('Permission error:', e);
      return false;
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreference>): Promise<boolean> => {
    const updated = { ...preferences, ...updates };
    setPreferences(updated);

    if (isDemoMode || !isConfigured || !user) {
      localStorage.setItem(LOCAL_STORAGE_PREFS_KEY, JSON.stringify(updated));
      return true;
    }

    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ ...updated, user_id: user.id, updated_at: new Date().toISOString() });

    return !error;
  };

  // Helper to check if current time is within Quiet Hours
  const isInsideQuietHours = useCallback((): boolean => {
    if (!preferences.quiet_hours_enabled) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = preferences.quiet_hours_start.split(':').map(Number);
    const [endH, endM] = preferences.quiet_hours_end.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal <= endTotal) {
      return currentMins >= startTotal && currentMins <= endTotal;
    } else {
      // Overnight (e.g. 22:00 to 07:00)
      return currentMins >= startTotal || currentMins <= endTotal;
    }
  }, [preferences]);

  // Dispatch an alert (In-app + Browser Notification + Sound)
  const dispatchAlert = useCallback(
    (title: string, message: string, task?: Task, type: InAppNotification['type'] = 'reminder') => {
      // 1. Play Sound if enabled and not quiet hours
      if (preferences.sound_enabled && !isInsideQuietHours()) {
        soundManager.playReminder();
      }

      // 2. Browser Push Notification
      if (
        preferences.browser_notifications &&
        browserPermission === 'granted' &&
        !isInsideQuietHours() &&
        typeof window !== 'undefined' &&
        'Notification' in window
      ) {
        try {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
          });
        } catch {
          // Fallback if blocked
        }
      }

      // 3. Add to In-app notifications
      const newNotif: InAppNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user_id: user?.id || 'mock-user-1',
        task_id: task?.id || null,
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => {
        const next = [newNotif, ...prev.slice(0, 49)];
        if (isDemoMode || !isConfigured || !user) {
          localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(next));
        }
        return next;
      });

      if (!isDemoMode && isConfigured && user) {
        const supabase = createClient();
        if (supabase) {
          supabase.from('notification_history').insert({
            user_id: user.id,
            task_id: task?.id || null,
            title,
            message,
            type,
            is_read: false,
          }).then();
        }
      }
    },
    [preferences, browserPermission, isInsideQuietHours, user, isDemoMode, isConfigured]
  );

  // Background Reminder Watcher (Runs every 30 seconds to check due tasks & reminders)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      tasks.forEach((task) => {
        if (task.status === 'completed') return;

        // Determine if reminder target time has arrived
        let targetTime: Date | null = null;

        if (task.snooze_until) {
          targetTime = new Date(task.snooze_until);
        } else if (task.due_date) {
          try {
            const parsedDue = parseISO(task.due_date);
            if (task.due_time) {
              const [h, m] = task.due_time.split(':').map(Number);
              parsedDue.setHours(h, m, 0, 0);
            } else {
              parsedDue.setHours(9, 0, 0, 0); // 9 AM default
            }

            const leadMinutes = task.reminder_lead_minutes || 0;
            targetTime = subMinutes(parsedDue, leadMinutes);
          } catch {
            targetTime = null;
          }
        }

        if (!targetTime) return;

        // Has the target time passed recently (within past 2 hours)?
        const diffMs = now.getTime() - targetTime.getTime();
        const isTimeTriggered = diffMs >= 0 && diffMs < 1000 * 60 * 120; // 2 hour window

        if (isTimeTriggered) {
          // Generate deduplication key: task ID + target date formatted
          const dedupeKey = `task-${task.id}-${targetTime.toISOString().slice(0, 16)}`;

          if (preferences.prevent_duplicate_reminders && sentNotificationKeysRef.current.has(dedupeKey)) {
            // Already delivered! Skip to avoid irritating duplicates
            return;
          }

          // Mark as notified
          sentNotificationKeysRef.current.add(dedupeKey);
          localStorage.setItem(
            SENT_KEYS_STORAGE_KEY,
            JSON.stringify(Array.from(sentNotificationKeysRef.current).slice(-200))
          );

          dispatchAlert(
            `Reminder: ${task.title}`,
            task.due_time ? `Scheduled for ${task.due_time}. Tap to view or snooze.` : 'Task is due today.',
            task,
            'reminder'
          );
        }
      });

      // Check daily summary schedule
      if (preferences.daily_summary_enabled && preferences.daily_summary_time) {
        const [sumH, sumM] = preferences.daily_summary_time.split(':').map(Number);
        if (now.getHours() === sumH && now.getMinutes() === sumM) {
          const summaryKey = `summary-${now.toISOString().slice(0, 10)}`;
          if (!sentNotificationKeysRef.current.has(summaryKey)) {
            sentNotificationKeysRef.current.add(summaryKey);
            setShowDailySummaryModal(true);
            dispatchAlert(
              'Your Daily Remindly Digest',
              'Check your pending responsibilities and kick off your day with clarity.',
              undefined,
              'summary'
            );
          }
        }
      }
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [tasks, preferences, dispatchAlert]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerManualSummary = () => {
    setShowDailySummaryModal(true);
  };

  const sendCustomTestNotification = () => {
    dispatchAlert(
      'Remindly Test Notification',
      'Sound and notification alert verified! All systems operational.',
      undefined,
      'system'
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        preferences,
        notifications,
        unreadCount,
        browserPermission,
        requestBrowserPermission,
        updatePreferences,
        markAsRead,
        markAllAsRead,
        clearNotification,
        showDailySummaryModal,
        setShowDailySummaryModal,
        triggerManualSummary,
        sendCustomTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
