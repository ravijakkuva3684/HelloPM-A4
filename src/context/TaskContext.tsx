'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Task, Category, PriorityLevel, RecurrencePattern, SnoozeOption, TaskFilterType } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_TASKS } from '@/lib/mockData';
import { useAuth } from './AuthContext';
import { createClient } from '@/lib/supabase/client';
import { 
  isTaskOverdue, 
  isTaskDueToday, 
  computeSnoozeTimestamp, 
  computeNextRecurringDate 
} from '@/lib/utils';
import { soundManager } from '@/lib/sound';

interface CreateTaskInput {
  title: string;
  description?: string;
  category_id?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority?: PriorityLevel;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
  reminder_lead_minutes?: number;
}

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  activeFilter: TaskFilterType;
  selectedCategory: string | null;
  searchQuery: string;
  setActiveFilter: (filter: TaskFilterType) => void;
  setSelectedCategory: (catId: string | null) => void;
  setSearchQuery: (query: string) => void;
  createTask: (input: CreateTaskInput) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<void>;
  snoozeTask: (id: string, option: SnoozeOption, customDate?: Date) => Promise<void>;
  rescheduleTask: (id: string, newDate: string | null, newTime?: string | null) => Promise<void>;
  createCategory: (name: string, color: string, icon: string) => Promise<Category | null>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearCompletedTasks: () => Promise<void>;
  exportTasksJson: () => void;
  stats: {
    total: number;
    pending: number;
    completed: number;
    dueToday: number;
    overdue: number;
    upcoming: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_STORAGE_TASKS_KEY = 'remindly_tasks_v1';
const LOCAL_STORAGE_CATEGORIES_KEY = 'remindly_categories_v1';

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode, isConfigured } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TaskFilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load Categories & Tasks
  const loadData = useCallback(async () => {
    setLoading(true);

    if (isDemoMode || !isConfigured || !user) {
      // LocalStorage or Mock data
      try {
        const storedCats = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
        const storedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);

        if (storedCats) {
          setCategories(JSON.parse(storedCats));
        } else {
          setCategories(INITIAL_CATEGORIES);
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
        }

        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          setTasks(INITIAL_TASKS);
          localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
        }
      } catch (err) {
        console.error('Failed to load local storage data:', err);
        setCategories(INITIAL_CATEGORIES);
        setTasks(INITIAL_TASKS);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Load from Supabase
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const [catRes, taskRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      ]);

      if (catRes.data) {
        setCategories(catRes.data as Category[]);
      }
      if (taskRes.data) {
        setTasks(taskRes.data as Task[]);
      }
    } catch (err) {
      console.error('Error fetching Supabase tasks/categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, isConfigured]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize category objects with tasks
  const tasksWithCategory = useMemo(() => {
    const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
    return tasks.map((t) => ({
      ...t,
      category: t.category_id ? catMap.get(t.category_id) : undefined,
    }));
  }, [tasks, categories]);

  // Create Task
  const createTask = async (input: CreateTaskInput): Promise<Task | null> => {
    const newTask: Task = {
      id: isConfigured && !isDemoMode ? '' : `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: user?.id || 'mock-user-1',
      category_id: input.category_id || null,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      due_date: input.due_date || null,
      due_time: input.due_time || null,
      priority: input.priority || 'medium',
      status: 'pending',
      is_recurring: Boolean(input.is_recurring),
      recurrence_pattern: input.recurrence_pattern || null,
      recurrence_interval: input.recurrence_interval || 1,
      recurrence_end_date: input.recurrence_end_date || null,
      reminder_lead_minutes: input.reminder_lead_minutes ?? 0,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode || !isConfigured || !user) {
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updated));
      return newTask;
    }

    const supabase = createClient();
    if (!supabase) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = newTask;
    const { data, error } = await supabase.from('tasks').insert(payload).select().single();

    if (error) {
      console.error('Error creating task in Supabase:', error);
      return null;
    }

    const created = data as Task;
    setTasks((prev) => [created, ...prev]);
    return created;
  };

  // Update Task
  const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
    const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    setTasks(updatedTasks);

    if (isDemoMode || !isConfigured || !user) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updatedTasks));
      return true;
    }

    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      console.error('Error updating task in Supabase:', error);
      return false;
    }
    return true;
  };

  // Delete Task
  const deleteTask = async (id: string): Promise<boolean> => {
    const filtered = tasks.filter((t) => t.id !== id);
    setTasks(filtered);

    if (isDemoMode || !isConfigured || !user) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(filtered));
      return true;
    }

    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task in Supabase:', error);
      return false;
    }
    return true;
  };

  // Toggle Task Completion (with celebration and recurring recurrence handling!)
  const toggleTaskStatus = async (id: string): Promise<void> => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextStatus = target.status === 'pending' ? 'completed' : 'pending';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

    if (nextStatus === 'completed') {
      soundManager.playComplete();
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Safe fallback if confetti isn't available
      }
    }

    // If this was a recurring task and is now marked complete, spawn next recurring instance
    if (nextStatus === 'completed' && target.is_recurring && target.recurrence_pattern) {
      const nextDueDate = computeNextRecurringDate(
        target.due_date,
        target.recurrence_pattern,
        target.recurrence_interval
      );

      // Create next occurrence if within recurrence_end_date
      let canSpawn = true;
      if (target.recurrence_end_date && nextDueDate > target.recurrence_end_date) {
        canSpawn = false;
      }

      if (canSpawn) {
        await createTask({
          title: target.title,
          description: target.description,
          category_id: target.category_id,
          due_date: nextDueDate,
          due_time: target.due_time,
          priority: target.priority,
          is_recurring: true,
          recurrence_pattern: target.recurrence_pattern,
          recurrence_interval: target.recurrence_interval,
          recurrence_end_date: target.recurrence_end_date,
          reminder_lead_minutes: target.reminder_lead_minutes,
        });
      }
    }

    await updateTask(id, {
      status: nextStatus,
      completed_at: completedAt,
      // clear snooze once completed
      snooze_until: null,
    });
  };

  // Snooze Task
  const snoozeTask = async (id: string, option: SnoozeOption, customDate?: Date): Promise<void> => {
    const snoozeUntil = computeSnoozeTimestamp(option, customDate);
    soundManager.playSnooze();
    await updateTask(id, { snooze_until: snoozeUntil });
  };

  // Reschedule Task
  const rescheduleTask = async (id: string, newDate: string | null, newTime?: string | null): Promise<void> => {
    await updateTask(id, {
      due_date: newDate,
      due_time: newTime !== undefined ? newTime : null,
      snooze_until: null,
    });
  };

  // Create Category
  const createCategory = async (name: string, color: string, icon: string): Promise<Category | null> => {
    const newCat: Category = {
      id: isConfigured && !isDemoMode ? '' : `cat-${Date.now()}`,
      user_id: user?.id || 'mock-user-1',
      name: name.trim(),
      color,
      icon,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode || !isConfigured || !user) {
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
      return newCat;
    }

    const supabase = createClient();
    if (!supabase) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = newCat;
    const { data, error } = await supabase.from('categories').insert(payload).select().single();

    if (error) {
      console.error('Error creating category in Supabase:', error);
      return null;
    }

    const created = data as Category;
    setCategories((prev) => [...prev, created]);
    return created;
  };

  // Update Category
  const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);

    if (isDemoMode || !isConfigured || !user) {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
      return true;
    }

    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating category:', error);
      return false;
    }
    return true;
  };

  // Delete Category
  const deleteCategory = async (id: string): Promise<boolean> => {
    const filtered = categories.filter((c) => c.id !== id);
    setCategories(filtered);

    // Also null out category_id on tasks that had this category
    const updatedTasks = tasks.map((t) => (t.category_id === id ? { ...t, category_id: null } : t));
    setTasks(updatedTasks);

    if (isDemoMode || !isConfigured || !user) {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(filtered));
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(updatedTasks));
      return true;
    }

    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    return !error;
  };

  // Clear Completed Tasks
  const clearCompletedTasks = async (): Promise<void> => {
    const activeOnly = tasks.filter((t) => t.status !== 'completed');
    setTasks(activeOnly);

    if (isDemoMode || !isConfigured || !user) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(activeOnly));
      return;
    }

    const supabase = createClient();
    if (supabase) {
      await supabase.from('tasks').delete().eq('status', 'completed');
    }
  };

  // Export Tasks as JSON
  const exportTasksJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ tasks, categories }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `remindly_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Computed Statistics for My Day and Dashboard
  const stats = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed') {
        completed++;
      } else {
        pending++;
        if (isTaskOverdue(t)) {
          overdue++;
        } else if (isTaskDueToday(t)) {
          dueToday++;
        } else if (t.due_date) {
          upcoming++;
        }
      }
    });

    return {
      total: tasks.length,
      pending,
      completed,
      dueToday,
      overdue,
      upcoming,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks: tasksWithCategory,
        categories,
        loading,
        activeFilter,
        selectedCategory,
        searchQuery,
        setActiveFilter,
        setSelectedCategory,
        setSearchQuery,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        snoozeTask,
        rescheduleTask,
        createCategory,
        updateCategory,
        deleteCategory,
        clearCompletedTasks,
        exportTasksJson,
        stats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
