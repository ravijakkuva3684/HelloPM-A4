'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Tag, 
  Sparkles, 
  Mic, 
  MicOff, 
  ArrowRight, 
  Check, 
  Calendar, 
  Clock, 
  Bell, 
  Layers, 
  Palette,
  RotateCcw,
  Plus
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { parseNaturalLanguageTask, listenToSpeech, ParsedTaskResult } from '@/lib/speech';
import { PriorityLevel } from '@/types';
import confetti from 'canvas-confetti';
import { soundManager } from '@/lib/sound';

interface AddNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#2563eb', // Blue
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#059669', // Emerald
  '#0d9488', // Teal
  '#d97706', // Amber
  '#dc2626', // Red
  '#db2777', // Pink
  '#0284c7', // Sky
  '#475569', // Slate
];

const ICON_OPTIONS = [
  'Tag', 'Briefcase', 'Heart', 'Book', 'Dumbbell', 
  'Code', 'Wallet', 'Home', 'Coffee', 'Music', 
  'Plane', 'ShoppingBag', 'Smile', 'Sun', 'Star'
];

export const AddNewModal: React.FC<AddNewModalProps> = ({ isOpen, onClose }) => {
  const { categories, createTask, createCategory } = useTasks();

  const [step, setStep] = useState<'select' | 'add_task' | 'add_category'>('select');

  // Task Natural Language State
  const [naturalInput, setNaturalInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedTaskResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category State
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [categorySuccess, setCategorySuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (opt: 'add_task' | 'add_category') => {
    setStep(opt);
    setNaturalInput('');
    setParsedPreview(null);
  };

  const handleBackToSelect = () => {
    setStep('select');
    setNaturalInput('');
    setParsedPreview(null);
    setCategoryName('');
  };

  // Natural Language Task Extraction
  const handleInputChange = (val: string) => {
    setNaturalInput(val);
    if (val.trim().length > 3) {
      const parsed = parseNaturalLanguageTask(val, categories);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  const handleMicTaskToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    listenToSpeech({
      onResult: (spokenText) => {
        setNaturalInput(spokenText);
        const parsed = parseNaturalLanguageTask(spokenText, categories);
        setParsedPreview(parsed);
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  const handleApplySamplePrompt = (prompt: string) => {
    setNaturalInput(prompt);
    const parsed = parseNaturalLanguageTask(prompt, categories);
    setParsedPreview(parsed);
  };

  const handleConfirmTask = async () => {
    if (!parsedPreview || !parsedPreview.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: parsedPreview.title,
        category_id: parsedPreview.category_id,
        due_date: parsedPreview.due_date,
        due_time: parsedPreview.due_time,
        priority: parsedPreview.priority,
        reminder_lead_minutes: parsedPreview.reminder_lead_minutes,
      });

      try {
        soundManager.playComplete();
        confetti({ particleCount: 50, spread: 60 });
      } catch {}

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const newCat = await createCategory(categoryName.trim(), selectedColor, selectedIcon);
    if (newCat) {
      setCategorySuccess(true);
      setTimeout(() => {
        setCategorySuccess(false);
        setCategoryName('');
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-pop-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'select' && (
              <button
                type="button"
                onClick={handleBackToSelect}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
              >
                ← Back
              </button>
            )}
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {step === 'select' && 'Add New'}
              {step === 'add_task' && 'AI Task Creation'}
              {step === 'add_category' && 'New Category'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* STEP 1: CHOOSE "ADD TASK" OR "ADD CATEGORY" */}
        {step === 'select' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              What would you like to create?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: Add Task */}
              <button
                type="button"
                onClick={() => handleSelectOption('add_task')}
                className="p-5 rounded-2xl border-2 border-slate-200/90 dark:border-slate-700 bg-white hover:border-blue-600 dark:hover:border-blue-500 dark:bg-slate-800/80 hover:bg-blue-50/40 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Add Task</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Type or speak naturally with AI date & time extraction.
                </div>
              </button>

              {/* Option 2: Add Category */}
              <button
                type="button"
                onClick={() => handleSelectOption('add_category')}
                className="p-5 rounded-2xl border-2 border-slate-200/90 dark:border-slate-700 bg-white hover:border-emerald-600 dark:hover:border-emerald-500 dark:bg-slate-800/80 hover:bg-emerald-50/40 text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Add Category</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Create a custom workspace with icons & color swatches.
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2A: ADD TASK WITH NATURAL SPEECH & AI PARSER */}
        {step === 'add_task' && (
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Type or speak your task naturally:
              </label>

              {/* Input with Mic button */}
              <div className="relative">
                <textarea
                  value={naturalInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="e.g., Pay electricity bill this Friday at 6 PM and remind me two hours before"
                  rows={3}
                  className={`w-full text-xs p-3.5 pr-12 rounded-2xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                    isListening ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  autoFocus
                />

                <button
                  type="button"
                  onClick={handleMicTaskToggle}
                  className={`absolute right-3 top-3 p-2 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                      : 'bg-white dark:bg-slate-700 text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-600'
                  }`}
                  title={isListening ? "Listening... click to finish" : "Click to speak naturally"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>

              {isListening && (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-500 animate-pulse pt-0.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Listening... Speak your task clearly</span>
                </div>
              )}
            </div>

            {/* Sample Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Try an example:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplySamplePrompt("Pay electricity bill this Friday at 6 PM and remind me two hours before")}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  ⚡ Electricity bill this Friday 6 PM
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySamplePrompt("Review project roadmap tomorrow at 2 PM high priority")}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  💼 Roadmap review tomorrow 2 PM
                </button>
              </div>
            </div>

            {/* AI EXTRACTED CONFIRMATION PREVIEW CARD */}
            {parsedPreview && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3 animate-pop-in">
                <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>AI Extracted Details (Confirmation Preview)</span>
                  </span>
                  <span className="bg-blue-200/60 dark:bg-blue-900/80 px-2 py-0.5 rounded text-[10px]">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="col-span-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 block">Title</span>
                    <span className="font-bold text-slate-900 dark:text-white">{parsedPreview.title}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 block">Due Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      {parsedPreview.due_date || 'None'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 block">Due Time</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {parsedPreview.due_time || 'No specific time'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 block">Category</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Tag className="h-3 w-3 text-blue-500" />
                      {parsedPreview.category_name || 'General / None'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 block">Reminder Lead</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Bell className="h-3 w-3 text-blue-500" />
                      {parsedPreview.reminder_lead_minutes} minutes before
                    </span>
                  </div>
                </div>

                {/* Confirmation Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmTask}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirm & Create Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setParsedPreview(null);
                      setNaturalInput('');
                    }}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2B: ADD CATEGORY MODAL */}
        {step === 'add_category' && (
          <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Work, Health, Finances, Side Project"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                autoFocus
                required
              />
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Color Swatch
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${
                      selectedColor === c ? 'scale-110 ring-2 ring-offset-2 ring-emerald-500' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1">
                {ICON_OPTIONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      selectedIcon === iconName
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon name={iconName} color={selectedColor} className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {categorySuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200 animate-pop-in">
                ✓ Category created and added to all dropdowns!
              </div>
            )}

            <button
              type="submit"
              disabled={!categoryName.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              <span>Create Category</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
