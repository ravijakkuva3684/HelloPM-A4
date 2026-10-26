'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DailySummaryModal } from '@/components/tasks/DailySummaryModal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { AddNewModal } from '@/components/common/AddNewModal';
import { AiPlanningModal } from '@/components/common/AiPlanningModal';
import { VoiceAssistantModal } from '@/components/common/VoiceAssistantModal';
import LoginPage from '@/app/auth/login/page';
import OnboardingPage from '@/app/onboarding/page';
import { X, Sun, Calendar, Inbox, CheckCircle2, Plus, Mic, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveFilter, setSelectedCategory } = useTasks();
  const { isLoggedIn, hasCompletedOnboarding, loading } = useAuth();

  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAiPlanModal, setShowAiPlanModal] = useState(false);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3 animate-pulse">
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

  // If not authenticated, render LoginPage directly (eliminates blank redirect screen)
  if (!isLoggedIn) {
    return <main className="flex-1 min-h-screen"><LoginPage /></main>;
  }

  // If authenticated but haven't finished onboarding yet, render OnboardingPage directly
  if (!hasCompletedOnboarding) {
    return <main className="flex-1 min-h-screen"><OnboardingPage /></main>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-slate-950">
      {/* Top Navigation */}
      <Navbar 
        onOpenQuickAdd={() => setShowAddNewModal(true)} 
        onOpenVoice={() => setShowVoiceModal(true)}
        onOpenAiPlanner={() => setShowAiPlanModal(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar onOpenNewCategory={() => setShowCategoryModal(true)} />

        {/* Dynamic Content Area (40%+ Free White Space) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-white dark:bg-slate-950">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar with Open Mic & Add New */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur py-2 px-3 z-40">
        <Link
          href="/"
          onClick={() => {
            setActiveFilter('today');
            setSelectedCategory(null);
          }}
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600"
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
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <Inbox className="h-4 w-4" />
          <span>Tasks</span>
        </Link>

        {/* Center: Add New Action Button */}
        <button
          type="button"
          onClick={() => setShowAddNewModal(true)}
          className="flex h-11 w-11 -mt-4 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/35 active:scale-95 transition-transform cursor-pointer"
          title="Add New (Task or Category)"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        {/* Open Mic Voice Assistant */}
        <button
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="flex flex-col items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold"
          title="Open Mic - Speak to ask or check updates"
        >
          <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-950">
            <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span>Open Mic</span>
        </button>

        <Link
          href="/calendar"
          className="flex flex-col items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600"
        >
          <Calendar className="h-4 w-4" />
          <span>Calendar</span>
        </Link>
      </div>

      {/* Global Add New Modal (Pop-up with 2 options: Add Task / Add Category) */}
      <AddNewModal
        isOpen={showAddNewModal}
        onClose={() => setShowAddNewModal(false)}
      />

      {/* Global AI Daily Planning Assistant Modal */}
      <AiPlanningModal
        isOpen={showAiPlanModal}
        onClose={() => setShowAiPlanModal(false)}
      />

      {/* Global Voice Assistant & Open Mic Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

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
