'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DailySummaryModal } from '@/components/tasks/DailySummaryModal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { QuickTaskInput } from '@/components/tasks/QuickTaskInput';
import { X, Sun, Calendar, Inbox, CheckCircle2, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveFilter, setSelectedCategory } = useTasks();
  const { isLoggedIn, hasCompletedOnboarding, loading } = useAuth();

  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Authentication & Onboarding Guards
  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname?.startsWith('/auth');
    const isOnboardingPage = pathname === '/onboarding';

    if (!isLoggedIn) {
      if (!isAuthPage) {
        router.push('/auth/login');
      }
    } else {
      // User is logged in
      if (!hasCompletedOnboarding && !isOnboardingPage) {
        router.push('/onboarding');
      } else if (hasCompletedOnboarding && isAuthPage) {
        router.push('/');
      }
    }
  }, [isLoggedIn, hasCompletedOnboarding, loading, pathname, router]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 mb-3 animate-pulse">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
          Loading Remindly...
        </p>
      </div>
    );
  }

  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname === '/onboarding';

  // Dedicated full-page view for Auth and 4-Slide Onboarding
  if (isAuthPage || isOnboardingPage) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  // If not authenticated and not on auth page yet (waiting for redirect)
  if (!isLoggedIn) {
    return null;
  }

  // If authenticated but haven't finished onboarding yet (waiting for redirect)
  if (!hasCompletedOnboarding) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation */}
      <Navbar onOpenQuickAdd={() => setShowQuickAddModal(true)} />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar onOpenNewCategory={() => setShowCategoryModal(true)} />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur py-2 px-4 z-40">
        <Link
          href="/"
          onClick={() => {
            setActiveFilter('today');
            setSelectedCategory(null);
          }}
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600"
        >
          <Sun className="h-4 w-4" />
          <span>My Day</span>
        </Link>
        <Link
          href="/"
          onClick={() => {
            setActiveFilter('all');
            setSelectedCategory(null);
          }}
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600"
        >
          <Inbox className="h-4 w-4" />
          <span>Tasks</span>
        </Link>
        <button
          onClick={() => setShowQuickAddModal(true)}
          className="flex h-9 w-9 -mt-3 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
        >
          <Plus className="h-5 w-5" />
        </button>
        <Link
          href="/calendar"
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600"
        >
          <Calendar className="h-4 w-4" />
          <span>Calendar</span>
        </Link>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600"
        >
          <Plus className="h-4 w-4" />
          <span>Category</span>
        </button>
      </div>

      {/* Floating Quick Add Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-pop-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Quick Task Entry
              </h3>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <QuickTaskInput onSuccess={() => setShowQuickAddModal(false)} />
          </div>
        </div>
      )}

      {/* Global Category Modal */}
      <CategoryModal
        category={null}
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Global Daily Summary Modal */}
      <DailySummaryModal />
    </div>
  );
};
