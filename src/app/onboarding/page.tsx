'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Sun, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Layers, 
  Bell, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Check, 
  FolderCheck,
  Zap,
  Flame,
  CalendarDays,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { soundManager } from '@/lib/sound';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Demo task toggle state for interactive preview
  const [demoTaskCompleted, setDemoTaskCompleted] = useState(false);

  // Touch coordinates for swipe gesture
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides = [
    {
      id: 1,
      badge: '01 / DAILY CLARITY',
      title: 'Master Your Day with Intelligent Task Grouping',
      subtitle: 'Eliminate daily overwhelm. Remindly organizes your commitments into Overdue, Due Today, and Upcoming sections.',
      icon: Sun,
      color: 'from-blue-600 to-indigo-600',
      features: [
        {
          title: 'Smart "My Day" Sections',
          desc: 'Tasks auto-sort into Overdue, Due Today, and Upcoming (next 7 days).',
          icon: Zap,
        },
        {
          title: 'Priority Matrix (Low to Urgent)',
          desc: 'Visual color tags prioritize high-impact deadlines first.',
          icon: Flame,
        },
        {
          title: 'Instant Accomplishment',
          desc: 'Synthesized audio chimes & confetti feedback when tasks complete.',
          icon: Sparkles,
        },
      ],
      interactiveType: 'task_completion',
    },
    {
      id: 2,
      badge: '02 / SMART SNOOZING',
      title: 'Intelligent Snoozing & Daily Morning Digest',
      subtitle: 'Reschedule effortlessly with 1-click presets and wake up to a curated morning summary every day.',
      icon: Clock,
      color: 'from-indigo-600 to-violet-600',
      features: [
        {
          title: 'Quick 1-Click Snooze',
          desc: 'Snooze for +1h, +3h, Tonight (7 PM), Tomorrow Morning (9 AM), or Next Week.',
          icon: Clock,
        },
        {
          title: 'Morning Digest at 8:00 AM',
          desc: 'A focused morning overview with a 1-click "Move all overdue to Today".',
          icon: Sparkles,
        },
        {
          title: 'Quiet Hours & Anti-Spam',
          desc: 'Mute alerts during sleep hours (10 PM - 7 AM) with spam suppression.',
          icon: Bell,
        },
      ],
      interactiveType: 'snooze_preview',
    },
    {
      id: 3,
      badge: '03 / CUSTOM WORKSPACES',
      title: 'Organize Life with Custom Categories & Icons',
      subtitle: 'Structure responsibilities across Work, Health, Reading, and Finances with 25+ Lucide icons and vibrant color palettes.',
      icon: Tag,
      color: 'from-emerald-500 to-teal-600',
      features: [
        {
          title: '25+ Lucide Icons',
          desc: 'Curated icons for Work, Fitness, Finances, Education, and Personal.',
          icon: Layers,
        },
        {
          title: 'Vibrant Color Palettes',
          desc: 'Color-code tags to immediately scan and spot priorities.',
          icon: Tag,
        },
        {
          title: 'Instant Sidebar Filtering',
          desc: 'Filter by category in one tap to focus strictly on what matters.',
          icon: FolderCheck,
        },
      ],
      interactiveType: 'category_showcase',
    },
    {
      id: 4,
      badge: '04 / TIME HORIZONS & SYNC',
      title: 'Monthly Calendar & Google Calendar Export',
      subtitle: 'Zoom out to view your workload distribution and export directly to Google Calendar, Apple Calendar, and Outlook.',
      icon: Calendar,
      color: 'from-blue-600 to-purple-600',
      features: [
        {
          title: 'Interactive Monthly Grid',
          desc: 'Inspect deadline clusters and task distribution across the month.',
          icon: CalendarDays,
        },
        {
          title: 'Day Drawer Agenda',
          desc: 'Click any date to see exact schedules or add tasks directly.',
          icon: CheckCircle,
        },
        {
          title: 'RFC-5545 iCalendar (.ics) Export',
          desc: '1-click export compatible with Google Calendar, Apple, & Outlook.',
          icon: Download,
        },
      ],
      interactiveType: 'calendar_preview',
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    try {
      soundManager.playComplete();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
    completeOnboarding();
    router.push('/');
  };

  // Touch Swipe Handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Go Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Go Previous
      handlePrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleDemoToggle = () => {
    const nextState = !demoTaskCompleted;
    setDemoTaskCompleted(nextState);
    if (nextState) {
      try {
        soundManager.playComplete();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.5 },
        });
      } catch {}
    }
  };

  return (
    <div 
      className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-white dark:bg-slate-950 flex flex-col justify-between select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. COMPACT TOP HEADER BAR - DOES NOT BLOCK THE ROW */}
      <header className="px-4 py-3 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur z-20 flex-shrink-0">
        {/* Top Left: Remindly Icon + Text */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
            Remindly
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Tour
          </span>
        </div>

        {/* Top Right: Step Badge & Skip */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 flex-shrink-0">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* 2. MAIN SLIDE CONTENT - GUARANTEED TO FIT ON MOBILE SCREEN */}
      <main className="flex-1 overflow-y-auto px-4 py-3 sm:py-5 max-w-2xl mx-auto w-full flex flex-col justify-center">
        <div className="space-y-4">
          {/* Badge & Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {slide.badge}
              </span>
              <span className="text-[10px] text-slate-400 italic md:hidden">
                Swipe left/right
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {slide.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
              {slide.subtitle}
            </p>
          </div>

          {/* 3 Key Feature Bullets */}
          <div className="space-y-2">
            {slide.features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                >
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {feat.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {feat.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Interactive Demonstration Preview */}
          <div className="rounded-xl p-3 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            {/* Slide 1 Demo */}
            {slide.interactiveType === 'task_completion' && (
              <div 
                onClick={handleDemoToggle}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  demoTaskCompleted 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                    demoTaskCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'
                  }`}>
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold ${demoTaskCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      Review team roadmap & deliverables
                    </span>
                    <div className="text-[10px] text-slate-400">Due Today • Work</div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                  High
                </span>
              </div>
            )}

            {/* Slide 2 Demo */}
            {slide.interactiveType === 'snooze_preview' && (
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  +1 Hour
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Tonight (7 PM)
                </div>
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 font-bold">
                  Tomorrow 9 AM
                </div>
              </div>
            )}

            {/* Slide 3 Demo */}
            {slide.interactiveType === 'category_showcase' && (
              <div className="flex items-center justify-around text-[10px] font-semibold">
                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">💼 Work (8)</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">🏃 Health (4)</span>
                <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">📚 Learning (3)</span>
              </div>
            )}

            {/* Slide 4 Demo */}
            {slide.interactiveType === 'calendar_preview' && (
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" /> Monthly Grid
                </span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Download className="h-3 w-3" /> .ics Google Sync
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR - ALWAYS VISIBLE */}
      <footer className="px-4 py-3 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur flex items-center justify-between flex-shrink-0 z-20">
        {/* Stepper Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide
                  ? 'w-6 bg-blue-600'
                  : i < currentSlide
                  ? 'w-2 bg-blue-400'
                  : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
              title={`Screen ${i + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          )}

          {currentSlide < slides.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="py-2.5 px-4 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <span>Go to Home Screen</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
