'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  parseISO 
} from 'date-fns';
import { Task } from '@/types';
import { useTasks } from '@/context/TaskContext';
import { downloadCalendarICS } from '@/lib/ical';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { QuickTaskInput } from '@/components/tasks/QuickTaskInput';

interface CalendarViewProps {
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectTask }) => {
  const { tasks } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDayDrawer, setShowDayDrawer] = useState(false);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDay = (day: Date): Task[] => {
    const formatted = format(day, 'yyyy-MM-dd');
    return tasks.filter((t) => t.due_date === formatted);
  };

  const selectedDateTasks = getTasksForDay(selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-slate-400">
              {tasks.filter((t) => t.due_date && isSameMonth(parseISO(t.due_date), currentMonth)).length} tasks scheduled this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Navigation */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Export to Google Calendar / .ics */}
          <button
            onClick={() => downloadCalendarICS(tasks)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-xl transition-colors border border-indigo-200/50"
            title="Export .ics file for Google Calendar or Apple Calendar sync"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .ICS</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold uppercase text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setShowDayDrawer(true);
                }}
                className={`min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-colors ${
                  !isCurrentMonth ? 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-400' : ''
                } ${
                  isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isDayToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isSelected
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                {/* Task Pills */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-24">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center gap-1.5 transition-transform hover:scale-[1.02] ${
                        task.status === 'completed'
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through'
                          : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/40'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.category?.color || '#6366f1' }}
                      />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold px-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Drawer / Side Panel */}
      {showDayDrawer && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedDateTasks.length} tasks scheduled for this day
              </p>
            </div>
            <button
              onClick={() => setShowDayDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              Close
            </button>
          </div>

          {/* Quick Add for this specific date */}
          <div>
            <QuickTaskInput
              defaultDate={format(selectedDate, 'yyyy-MM-dd')}
              onSuccess={() => {}}
            />
          </div>

          {/* List of Tasks on Selected Date */}
          <div className="space-y-2 pt-2">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No responsibilities scheduled for this date.
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: task.category?.color || '#6366f1' }}
                    />
                    <span className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.due_time && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      {task.due_time}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
