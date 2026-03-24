'use client';

import { useState, useRef, useCallback } from 'react';
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
  isAfter,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutCalendar } from '@/hooks/useWorkout';
import { DayLogPopover } from '@/components/ui/DayLogPopover';
import { DayLogStatus } from '@/types/api.types';
import { cn } from '@/lib/cn';

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const from = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const to = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

  const { data: calendarDays, isLoading } = useWorkoutCalendar(from, to);

  const workoutDates = new Set(
    (calendarDays ?? []).filter((d) => d.hasSession).map((d) => d.date),
  );

  const dayLogStatuses = new Map(
    (calendarDays ?? [])
      .filter((d) => d.dayLogStatus !== null)
      .map((d) => [d.date, d.dayLogStatus as DayLogStatus]),
  );

  const plannedDates = new Set(
    (calendarDays ?? []).filter((d) => d.isPlanned).map((d) => d.date),
  );

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const today = startOfDay(new Date());

  const handleDayClick = useCallback(
    (dateStr: string, day: Date, e: React.MouseEvent<HTMLButtonElement>) => {
      if (isAfter(startOfDay(day), today)) return;

      if (selectedDate === dateStr) {
        setSelectedDate(null);
        setPopoverPosition(null);
        return;
      }

      const button = e.currentTarget;
      const container = containerRef.current;
      if (container) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setPopoverPosition({
          top: buttonRect.bottom - containerRect.top + 4,
          left: buttonRect.left - containerRect.left,
        });
      }

      setSelectedDate(dateStr);
    },
    [selectedDate, today],
  );

  const handleClosePopover = useCallback(() => {
    setSelectedDate(null);
    setPopoverPosition(null);
    (document.activeElement as HTMLElement)?.blur();
  }, []);

  const selectedStatus = selectedDate ? (dayLogStatuses.get(selectedDate) ?? null) : null;

  return (
    <div ref={containerRef} className="relative">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize text-zinc-900 dark:text-zinc-100">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => { setCurrentMonth((m) => subMonths(m, 1)); setSelectedDate(null); setPopoverPosition(null); }}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ←
          </button>
          <button
            onClick={() => { setCurrentMonth(() => new Date()); setSelectedDate(null); setPopoverPosition(null); }}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Hoy
          </button>
          <button
            onClick={() => { setCurrentMonth((m) => addMonths(m, 1)); setSelectedDate(null); setPopoverPosition(null); }}
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
              const dayLogStatus = dayLogStatuses.get(dateStr) ?? null;
              const isPlanned = plannedDates.has(dateStr);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);
              const isFuture = isAfter(startOfDay(day), today);
              const isSelected = selectedDate === dateStr;
              const isClickable = isCurrentMonth && !isFuture && (isPlanned || hasWorkout);

              return (
                <button
                  key={dateStr}
                  onClick={(e) => handleDayClick(dateStr, day, e)}
                  disabled={!isClickable}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors focus:outline-none',
                    isClickable
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'cursor-default text-zinc-300 dark:text-zinc-700',
                    isDayToday &&
                      'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-950',
                    hasWorkout
                      ? 'bg-blue-500 font-semibold text-white hover:bg-blue-600'
                      : isClickable
                        ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : '',
                    isSelected && 'ring-2 ring-zinc-400 ring-offset-1 dark:ring-zinc-600',
                  )}
                >
                  {format(day, 'd')}
                  {(isPlanned || dayLogStatus !== null) && (
                    <span className="absolute bottom-1 flex gap-0.5">
                      {isPlanned && !hasWorkout && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      )}
                      {dayLogStatus !== null && (
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          dayLogStatus === DayLogStatus.Completed ? 'bg-green-400' : 'bg-red-400',
                        )} />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
      </div>

      {selectedDate && popoverPosition && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClosePopover} />
          <DayLogPopover
            date={selectedDate}
            currentStatus={selectedStatus}
            onClose={handleClosePopover}
            style={{ top: popoverPosition.top, left: popoverPosition.left }}
          />
        </>
      )}
    </div>
  );
}
