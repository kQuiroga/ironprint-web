'use client';

import { useState } from 'react';
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
  getWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutCalendar } from '@/hooks/useWorkout';
import { DayLogPopover } from '@/components/ui/DayLogPopover';
import { DayLogStatus } from '@/types/api.types';
import { cn } from '@/lib/cn';

enum CalendarView {
  Month = 'month',
  Week = 'week',
}

const WEEK_DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const WEEK_DAYS_FULL = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>(CalendarView.Month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    (calendarDays ?? []).filter((d) => d.routineDayId !== null).map((d) => d.date),
  );
  const routineDayIds = new Map(
    (calendarDays ?? [])
      .filter((d) => d.routineDayId !== null)
      .map((d) => [d.date, d.routineDayId as string]),
  );

  const today = startOfDay(new Date());

  const allDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  // Week view: current week only
  const currentWeekDays = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 }),
  });

  function handleDayClick(dateStr: string, day: Date) {
    if (isAfter(startOfDay(day), today)) return;
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  function handleClosePopover() {
    setSelectedDate(null);
  }

  const selectedStatus = selectedDate ? (dayLogStatuses.get(selectedDate) ?? null) : null;
  const selectedRoutineDayId = selectedDate ? (routineDayIds.get(selectedDate) ?? null) : null;
  const selectedHasSession = selectedDate ? workoutDates.has(selectedDate) : false;

  function getDayCellClasses(day: Date, dateStr: string) {
    const hasWorkout = workoutDates.has(dateStr);
    const dayLogStatus = dayLogStatuses.get(dateStr) ?? null;
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isDayToday = isToday(day);
    const isFuture = isAfter(startOfDay(day), today);

    const base = 'aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-150 text-sm select-none';
    const todayRing = isDayToday ? 'ring-4 ring-primary/20 ring-offset-1' : '';

    if (!isCurrentMonth) return cn(base, 'opacity-20 text-on-surface-variant');
    if (isFuture && plannedDates.has(dateStr)) return cn(base, 'bg-primary-fixed-dim text-on-primary-fixed-variant opacity-60', todayRing);
    if (isFuture) return cn(base, 'bg-surface-container-highest text-on-surface-variant opacity-40', todayRing);

    if (hasWorkout || dayLogStatus === DayLogStatus.Completed) {
      return cn(base, 'bg-tertiary-container text-on-tertiary-container font-bold hover:scale-105 cursor-pointer', todayRing);
    }
    if (dayLogStatus === DayLogStatus.NotCompleted) {
      return cn(base, 'bg-error-container text-on-error-container font-bold hover:scale-105 cursor-pointer', todayRing);
    }
    if (plannedDates.has(dateStr)) {
      return cn(base, 'bg-primary-fixed-dim text-on-primary-fixed-variant font-bold hover:scale-105 cursor-pointer', todayRing);
    }

    return cn(base, 'bg-surface-container-highest text-on-surface-variant opacity-60', todayRing);
  }

  // Insights data (derived from loaded days)
  const completedCount = (calendarDays ?? []).filter(
    (d) => d.hasSession || d.dayLogStatus === DayLogStatus.Completed,
  ).length;
  const totalDays = (calendarDays ?? []).length;

  // Mini streak chart — last 7 completed days as relative bar heights
  const recentDays = allDays.slice(-14).map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const done = workoutDates.has(dateStr) || dayLogStatuses.get(dateStr) === DayLogStatus.Completed;
    return done;
  });

  return (
    <div>
      {/* Header */}
      <section className="mb-8 flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h1>
            {!isLoading && (
              <p className="text-on-surface-variant font-medium mt-1 text-sm">
                {completedCount} de {totalDays} días completados
              </p>
            )}
          </div>

          {/* Month navigation */}
          <div className="flex gap-1">
            <button
              onClick={() => { setCurrentMonth((m) => subMonths(m, 1)); setSelectedDate(null); }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => { setCurrentMonth(new Date()); setSelectedDate(null); }}
              className="px-3 h-9 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => { setCurrentMonth((m) => addMonths(m, 1)); setSelectedDate(null); }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div className="inline-flex self-start bg-surface-container-high p-1 rounded-full">
          <button
            onClick={() => setView(CalendarView.Month)}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
              view === CalendarView.Month
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            Mes
          </button>
          <button
            onClick={() => setView(CalendarView.Week)}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
              view === CalendarView.Week
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            Semana
          </button>
        </div>
      </section>

      {/* Calendar container */}
      <div className="bg-surface-container-low rounded-3xl p-4 md:p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {(view === CalendarView.Month ? WEEK_DAYS_SHORT : WEEK_DAYS_FULL).map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-bold uppercase tracking-widest text-on-surface-variant py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {view === CalendarView.Month ? (
          <div className="grid grid-cols-7 gap-1.5">
            {isLoading
              ? allDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="aspect-square animate-pulse rounded-xl bg-surface-container-high"
                  />
                ))
              : allDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const hasWorkout = workoutDates.has(dateStr);
                  const dayLogStatus = dayLogStatuses.get(dateStr) ?? null;
                  const isPlanned = plannedDates.has(dateStr);
                  const isFutureDay = isAfter(startOfDay(day), today);
                  const isClickable =
                    isSameMonth(day, currentMonth) &&
                    !isFutureDay &&
                    (isPlanned || hasWorkout);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => isClickable && handleDayClick(dateStr, day)}
                      disabled={!isClickable}
                      className={getDayCellClasses(day, dateStr)}
                    >
                      <span>{format(day, 'd')}</span>
                      {isSameMonth(day, currentMonth) && (() => {
                        if (!isPlanned)
                          return <span className="text-[9px] uppercase font-bold opacity-60 mt-0.5">Descanso</span>;
                        if (isFutureDay) return null;
                        if (hasWorkout || dayLogStatus === DayLogStatus.Completed)
                          return <span className="text-[9px] uppercase font-bold opacity-60 mt-0.5">Entreno</span>;
                        if (dayLogStatus === DayLogStatus.NotCompleted)
                          return <span className="text-[9px] uppercase font-bold opacity-60 mt-0.5">Faltó</span>;
                        return null;
                      })()}
                    </button>
                  );
                })}
          </div>
        ) : (
          /* Week view */
          <div className="grid grid-cols-7 gap-2">
            {currentWeekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasWorkout = workoutDates.has(dateStr);
              const dayLogStatus = dayLogStatuses.get(dateStr) ?? null;
              const isPlanned = plannedDates.has(dateStr);
              const isDayToday = isToday(day);
              const isFuture = isAfter(startOfDay(day), today);
              const isClickable = !isFuture && (isPlanned || hasWorkout);

              const weekDayColor = (() => {
                if (hasWorkout || dayLogStatus === DayLogStatus.Completed)
                  return 'bg-tertiary-container text-on-tertiary-container';
                if (dayLogStatus === DayLogStatus.NotCompleted)
                  return 'bg-error-container text-on-error-container';
                if (isPlanned) return isFuture
                  ? 'bg-primary-fixed-dim text-on-primary-fixed-variant opacity-60'
                  : 'bg-primary-fixed-dim text-on-primary-fixed-variant';
                return isFuture
                  ? 'bg-surface-container-highest text-on-surface-variant opacity-40'
                  : 'bg-surface-container-highest text-on-surface-variant opacity-60';
              })();

              const weekDayLabel = (() => {
                if (!isPlanned) return 'Descanso';
                if (isFuture) return null;
                if (hasWorkout || dayLogStatus === DayLogStatus.Completed) return 'Entreno';
                if (dayLogStatus === DayLogStatus.NotCompleted) return 'Faltó';
                return null;
              })();

              return (
                <button
                  key={dateStr}
                  onClick={() => isClickable && handleDayClick(dateStr, day)}
                  disabled={!isClickable}
                  className={cn(
                    'flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-150',
                    weekDayColor,
                    isDayToday && 'ring-4 ring-primary/20',
                    isClickable && 'hover:scale-105',
                  )}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className="text-2xl font-extrabold">{format(day, 'd')}</span>
                  {weekDayLabel && (
                    <span className="text-[9px] uppercase font-bold opacity-60">{weekDayLabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Streak card */}
        <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-3xl shadow-[0_8px_32px_rgba(57,56,47,0.04)] relative overflow-hidden">
          <h3 className="text-lg font-bold text-on-surface mb-1">Consistencia</h3>
          <p className="text-on-surface-variant text-sm mb-5">
            {completedCount > 0
              ? `${completedCount} días completados este mes`
              : 'Empezá a registrar tus entrenamientos'}
          </p>
          <div className="flex items-end gap-1 h-12">
            {recentDays.map((done, i) => {
              const heights = [40, 52, 36, 56, 44, 48, 32, 60, 40, 52, 44, 36, 56, 48];
              const h = done ? heights[i % heights.length] : 8;
              return (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={cn(
                    'flex-1 rounded-full transition-all',
                    done ? (i >= 7 ? 'bg-primary' : 'bg-tertiary') : 'bg-surface-container-high',
                  )}
                />
              );
            })}
          </div>
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-secondary-container rounded-full opacity-20 blur-2xl" />
        </div>

        {/* Weekly win card */}
        <div className="bg-secondary-container p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <span
              className="material-symbols-outlined text-secondary text-3xl mb-3 block"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              celebration
            </span>
            <h3 className="text-base font-bold text-on-secondary-container">Semana actual</h3>
            <p className="text-on-secondary-container/80 text-sm mt-1">
              Semana {getWeek(today)} del año
            </p>
          </div>
          <div className="mt-4 text-2xl font-extrabold text-on-secondary-container">
            {currentWeekDays.filter((d) => workoutDates.has(format(d, 'yyyy-MM-dd'))).length}
            <span className="text-sm font-medium opacity-70 ml-1">/ 7 días</span>
          </div>
        </div>
      </section>

      {/* Day log bottom sheet */}
      {selectedDate && (
        <DayLogPopover
          date={selectedDate}
          currentStatus={selectedStatus}
          routineDayId={selectedRoutineDayId}
          hasSession={selectedHasSession}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}
