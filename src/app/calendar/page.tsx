'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { Task, Category } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { QuickTaskInput } from '@/components/tasks/QuickTaskInput';

export default function CalendarPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to My Day
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendar Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View all your responsibilities organized by date. Click any date to view or schedule tasks.
          </p>
        </div>
      </div>

      <CalendarView onSelectTask={handleSelectTask} />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Category Modal */}
      <CategoryModal
        category={null}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
