'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Tag, Mic, MicOff } from 'lucide-react';
import { Category } from '@/types';
import { useTasks } from '@/context/TaskContext';
import { CategoryIcon, AVAILABLE_ICON_NAMES, PRESET_COLORS } from './CategoryIcon';
import { listenToSpeech } from '@/lib/speech';

interface CategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, isOpen, onClose }) => {
  const { createCategory, updateCategory, deleteCategory } = useTasks();

  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState('Tag');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    listenToSpeech({
      onResult: (spokenText) => {
        setName(spokenText);
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color || PRESET_COLORS[0]);
      setIcon(category.icon || 'Tag');
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
      setIcon('Tag');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategory(category.id, {
          name: name.trim(),
          color,
          icon,
        });
      } else {
        await createCategory(name.trim(), color, icon);
      }
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    if (confirm(`Delete "${category.name}" category? Tasks will be retained with no category.`)) {
      await deleteCategory(category.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <CategoryIcon name={icon} color={color} className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {category ? 'Edit Category' : 'New Custom Category'}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {category && !category.is_default && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                title="Delete Category"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              Category Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Finance, Learning, Health, Side Project..."
                required
                className={`w-full text-sm font-medium pl-3.5 pr-11 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isListening ? 'border-rose-500 ring-2 ring-rose-500/20 animate-pulse' : 'border-slate-200 dark:border-slate-700'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="Speak category name"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform hover:scale-110 ${
                    color === hex ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color === hex && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
              {AVAILABLE_ICON_NAMES.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    icon === iconName
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={iconName}
                >
                  <CategoryIcon name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
