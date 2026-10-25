'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Tag, ArrowLeft, Edit3, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { Category } from '@/types';

export default function CategoriesPage() {
  const { categories, tasks, setSelectedCategory, deleteCategory } = useTasks();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to My Day
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Custom Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your life into tailored buckets with custom icons and color palettes.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const pendingCount = tasks.filter((t) => t.category_id === cat.id && t.status === 'pending').length;
          const completedCount = tasks.filter((t) => t.category_id === cat.id && t.status === 'completed').length;

          return (
            <div
              key={cat.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <CategoryIcon name={cat.icon} color={cat.color} className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {!cat.is_default && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{pendingCount} pending</span>
                    <span>•</span>
                    <span>{completedCount} completed</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View Tasks</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>

                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  title={`Color: ${cat.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <CategoryModal
        category={editingCategory}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
