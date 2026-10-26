'use client';

import React, { useState } from 'react';
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
  ShieldCheck,
  Zap,
  Flame,
  Volume2,
  CalendarDays,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { soundManager } from '@/lib/sound';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Demo state for interactive preview on Slide 1
  const [demoTaskCompleted, setDemoTaskCompleted] = useState(false);

  // Slides definition (4 informative screens)
  const slides = [
    {
      id: 1,
      badge: '01 / DAILY CLARITY',
      title: 'Master Your Day with Intelligent Task Grouping',
      subtitle: 'Eliminate daily overwhelm. Remindly structures your responsibilities into focused sections so you always know what matters right now.',
      icon: Sun,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40',
      features: [
        {
          title: 'Smart "My Day" Sections',
          desc: 'Tasks are automatically partitioned into Overdue (urgent alerts), Due Today (timed schedule), and Upcoming (next 7 days).',
          icon: Zap,
        },
        {
          title: 'Priority Flags (Low to Urgent)',
          desc: 'Color-coded visual flags keep high-impact deadlines at the top of your visual field.',
          icon: Flame,
        },
        {
          title: 'Instant Dopamine & Celebrations',
          desc: 'Completing tasks triggers synthesized Web Audio chimes and celebratory confetti bursts.',
          icon: Sparkles,
        },
      ],
      interactiveType: 'task_completion',
    },
    {
      id: 2,
      badge: '02 / SMART SNOOZING',
      title: 'Intelligent Snoozing & Daily Morning Digest',
      subtitle: 'Life happens. Reschedule effortlessly with one-click presets and wake up to a curated morning summary every day.',
      icon: Clock,
      color: 'from-indigo-600 to-violet-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40',
      features: [
        {
          title: 'Quick 1-Click Snooze Presets',
          desc: 'Snooze tasks for +1 Hour, +3 Hours, This Evening (7 PM), Tomorrow Morning (9 AM), or Next Week in a single tap.',
          icon: Clock,
        },
        {
          title: 'Morning Digest at 8:00 AM',
          desc: 'Start your day with a focused summary modal and a 1-click "Move all overdue to Today" action.',
          icon: Sparkles,
        },
        {
          title: 'Quiet Hours & Anti-Duplicate System',
          desc: 'Customize quiet hours (e.g. 10 PM - 7 AM) to prevent alerts while sleeping, with built-in spam suppression.',
          icon: Bell,
        },
      ],
      interactiveType: 'snooze_preview',
    },
    {
      id: 3,
      badge: '03 / CUSTOM WORKSPACES',
      title: 'Organize Life with Custom Categories & Icons',
      subtitle: 'Tailor Remindly to your exact routine with custom categories, 25+ Lucide icons, and modern color palettes.',
      icon: Tag,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40',
      features: [
        {
          title: '25+ Expressive Lucide Icons',
          desc: 'Assign distinctive icons for Work, Health, Reading, Finances, Family, and Side Hustles.',
          icon: Layers,
        },
        {
          title: '10 Vibrant Color Palettes',
          desc: 'Color-code your categories to visually scan your day and immediately spot what requires your energy.',
          icon: Tag,
        },
        {
          title: 'Instant 1-Click Filtering',
          desc: 'Filter your dashboard by category in one tap to focus strictly on work tasks, fitness goals, or personal chores.',
          icon: FolderCheck,
        },
      ],
      interactiveType: 'category_showcase',
    },
    {
      id: 4,
      badge: '04 / TIME HORIZONS & SYNC',
      title: 'Monthly Calendar & Universal Google Calendar Export',
      subtitle: 'Zoom out to view your monthly distribution and export your tasks directly to Google Calendar, Apple Calendar, and Outlook.',
      icon: Calendar,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40',
      features: [
        {
          title: 'Interactive Monthly Grid',
          desc: 'Inspect deadline clusters and task distribution across all weeks of the month.',
          icon: CalendarDays,
        },
        {
          title: 'Day Drawer Details',
          desc: 'Click any date to see exact scheduled responsibilities or add tasks directly into that day.',
          icon: CheckCircle,
        },
        {
          title: 'RFC-5545 iCalendar (.ics) Export',
          desc: 'Download universal calendar feeds or sync with Google Calendar and external scheduling apps.',
          icon: Download,
        },
      ],
      interactiveType: 'calendar_preview',
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
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
    } catch {
      // Audio or confetti fallback
    }
    completeOnboarding();
    router.push('/');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/60 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Remindly</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Product Tour
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Welcome, {profile?.full_name || 'Member'}!
            </div>
          </div>
        </div>

        {/* Stepper counter & skip */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Screen <span className="text-indigo-600 dark:text-indigo-400">{currentSlide + 1}</span> of {slides.length}
          </span>
          <button
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Skip to Home
          </button>
        </div>
      </header>

      {/* Main Slide Card Container */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Slide Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-10 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Information & Key Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-black tracking-wider uppercase px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                {slide.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {slide.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {slide.subtitle}
              </p>
            </div>

            {/* Feature Bullet Cards */}
            <div className="space-y-3">
              {slide.features.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-start gap-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {feat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Visual Interactive Demonstrations */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl p-5 border shadow-inner bg-gradient-to-b from-slate-50 to-indigo-50/20 dark:from-slate-800/50 dark:to-slate-900 border-slate-200 dark:border-slate-700/70 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-slate-400">
                <span>INTERACTIVE PREVIEW</span>
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-3 w-3" /> Live Feature
                </span>
              </div>

              {/* SLIDE 1 INTERACTIVE PREVIEW: My Day Task Card */}
              {slide.interactiveType === 'task_completion' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Try completing a task:</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Click checkmark</span>
                  </div>

                  <div 
                    onClick={handleDemoToggle}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      demoTaskCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-colors ${
                        demoTaskCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-300 dark:border-slate-600 text-transparent'
                      }`}>
                        <Check className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${demoTaskCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          Review team roadmap & deliverables
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-rose-500 font-semibold">Today • 10:30 AM</span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">Work</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      High Priority
                    </span>
                  </div>

                  {demoTaskCompleted && (
                    <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Nice job! Audio chime + confetti fired.</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 text-[11px] text-slate-500">
                    💡 Remindly automatically groups Overdue items with warning badges and lets you reschedule them in bulk.
                  </div>
                </div>
              )}

              {/* SLIDE 2 INTERACTIVE PREVIEW: Smart Snooze Presets */}
              {slide.interactiveType === 'snooze_preview' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quick Snooze Presets:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:border-indigo-400 transition-colors">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>+1 Hour</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:border-indigo-400 transition-colors">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>+3 Hours</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:border-indigo-400 transition-colors">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>Tonight (7 PM)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:border-indigo-400 transition-colors">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <span>Tomorrow (9 AM)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-bold text-indigo-700 dark:text-indigo-300">
                      🌅 Daily Morning Digest
                    </div>
                    <div>
                      Every morning at 8:00 AM, a focused digest modal greets you with today’s priorities and any rollover tasks.
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3 INTERACTIVE PREVIEW: Custom Categories */}
              {slide.interactiveType === 'category_showcase' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category Palette Preview:
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full bg-indigo-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">💼 Work & Projects</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        8 tasks
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">🏃 Health & Habits</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        4 tasks
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">📚 Learning & Books</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                        3 tasks
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 text-[11px] text-slate-500">
                    🎨 Create unlimited categories with custom hex colors and icons in the Categories tab.
                  </div>
                </div>
              )}

              {/* SLIDE 4 INTERACTIVE PREVIEW: Calendar & Export */}
              {slide.interactiveType === 'calendar_preview' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Monthly Calendar Grid</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">RFC-5545</span>
                  </div>

                  {/* Mini Calendar Mock */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {[12, 13, 14, 15, 16, 17, 18].map((d, i) => (
                      <div
                        key={i}
                        className={`p-1.5 rounded-lg border font-medium ${
                          d === 15
                            ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {d}
                        {d === 15 && <div className="h-1 w-1 bg-amber-300 rounded-full mx-auto mt-0.5" />}
                        {d === 16 && <div className="h-1 w-1 bg-emerald-500 rounded-full mx-auto mt-0.5" />}
                      </div>
                    ))}
                  </div>

                  {/* Export Button Mock */}
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-1.5">
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      <span>One-Click .ics Calendar Export</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Import directly into Google Calendar, Outlook, and Apple Calendar.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stepper Dots & Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  i === currentSlide
                    ? 'w-8 bg-indigo-600'
                    : i < currentSlide
                    ? 'w-2.5 bg-indigo-400'
                    : 'w-2.5 bg-slate-300 dark:bg-slate-700'
                }`}
                title={`Go to Screen ${i + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}

            {currentSlide < slides.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 group cursor-pointer"
              >
                <span>Next Screen</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="py-3 px-6 text-xs font-black text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Go to Home Screen & Start Using Remindly</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-[11px] text-slate-400 pt-4 border-t border-slate-200/60 dark:border-slate-800">
        Remindly Workspace • Fast, focused task management
      </footer>
    </div>
  );
}
