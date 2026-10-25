'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Moon, Sun, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { SnoozeOption } from '@/types';

interface SnoozeDropdownProps {
  onSnooze: (option: SnoozeOption, customDate?: Date) => void;
  className?: string;
}

export const SnoozeDropdown: React.FC<SnoozeDropdownProps> = ({ onSnooze, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customDateTime, setCustomDateTime] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SnoozeOption) => {
    if (option === 'custom') {
      setShowCustom(true);
      return;
    }
    onSnooze(option);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDateTime) return;
    const date = new Date(customDateTime);
    onSnooze('custom', date);
    setIsOpen(false);
    setShowCustom(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors"
        title="Snooze task reminder"
      >
        <Clock className="h-3 w-3" />
        <span>Snooze</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5 animate-pop-in">
          {!showCustom ? (
            <div className="space-y-0.5 text-xs">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Snooze Reminder
              </div>
              <button
                type="button"
                onClick={() => handleSelect('1hour')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>+ 1 hour</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('3hours')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left"
              >
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>+ 3 hours</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('thisEvening')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left"
              >
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span>This Evening (7 PM)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('tomorrowMorning')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Tomorrow Morning (9 AM)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelect('nextWeek')}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors text-left"
              >
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span>Next Week</span>
              </button>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <span>Pick Date & Time...</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                Custom Snooze Time
              </div>
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                required
                className="w-full text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
                >
                  Apply
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
