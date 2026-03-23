'use client';

import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useWorkoutCalendar } from '@/hooks/useWorkout';

function useMonthStats(date: Date) {
  const from = format(startOfMonth(date), 'yyyy-MM-dd');
  const to = format(endOfMonth(date), 'yyyy-MM-dd');
  const { data } = useWorkoutCalendar(from, to);
  return (data ?? []).filter((d) => d.hasSession).length;
}

export default function StatsPage() {
  const now = new Date();
  const thisMonth = now;
  const lastMonth = subMonths(now, 1);
  const twoMonthsAgo = subMonths(now, 2);

  const thisMonthCount = useMonthStats(thisMonth);
  const lastMonthCount = useMonthStats(lastMonth);
  const twoMonthsAgoCount = useMonthStats(twoMonthsAgo);

  const months = useMemo(
    () => [
      { date: twoMonthsAgo, count: twoMonthsAgoCount },
      { date: lastMonth, count: lastMonthCount },
      { date: thisMonth, count: thisMonthCount },
    ],
    [thisMonthCount, lastMonthCount, twoMonthsAgoCount],
  );

  const maxCount = Math.max(...months.map((m) => m.count), 1);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Estadísticas
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {months.map(({ date, count }) => (
          <div
            key={date.toISOString()}
            className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {count}
            </p>
            <p className="mt-1 text-sm capitalize text-zinc-500 dark:text-zinc-400">
              {format(date, 'MMMM', { locale: es })}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">sesiones registradas</p>

      {/* Barras comparativas */}
      <div className="mt-8">
        <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
          Comparativa mensual
        </h2>
        <div className="space-y-3">
          {months.map(({ date, count }) => (
            <div key={date.toISOString()} className="flex items-center gap-3">
              <span className="w-20 text-right text-sm capitalize text-zinc-500">
                {format(date, 'MMM', { locale: es })}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-6 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
