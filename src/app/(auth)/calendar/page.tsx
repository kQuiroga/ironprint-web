'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutCalendar } from '@/hooks/useWorkout';
import { cn } from '@/lib/cn';

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const from = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const to = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const { data: calendarDays, isLoading } = useWorkoutCalendar(from, to);

  const workoutDates = new Set(
    (calendarDays ?? []).filter((d) => d.hasSession).map((d) => d.date),
  );

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize text-zinc-900 dark:text-zinc-100">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentMonth(() => new Date())}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Hoy
          </button>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-zinc-500"
          >
            {d}
          </div>
        ))}

        {isLoading
          ? days.map((day) => (
              <div
                key={day.toISOString()}
                className="aspect-square animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"
              />
            ))
          : days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasWorkout = workoutDates.has(dateStr);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <Link
                  key={dateStr}
                  href={`/workout/${dateStr}`}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors',
                    isCurrentMonth
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'pointer-events-none text-zinc-300 dark:text-zinc-700',
                    isDayToday &&
                      'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-950',
                    hasWorkout
                      ? 'bg-blue-500 font-semibold text-white hover:bg-blue-600'
                      : isCurrentMonth &&
                          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  )}
                >
                  {format(day, 'd')}
                </Link>
              );
            })}
      </div>
    </div>
  );
}
