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
      <h1 className="mb-6 text-2xl font-bold text-on-surface">
        Estadísticas
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {months.map(({ date, count }) => (
          <div
            key={date.toISOString()}
            className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 text-center"
          >
            <p className="text-3xl font-bold text-on-surface">
              {count}
            </p>
            <p className="mt-1 text-sm capitalize text-on-surface-variant">
              {format(date, 'MMMM', { locale: es })}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs text-on-surface-variant">sesiones registradas</p>

      {/* Barras comparativas */}
      <div className="mt-8">
        <h2 className="mb-4 font-semibold text-on-surface">
          Comparativa mensual
        </h2>
        <div className="space-y-3">
          {months.map(({ date, count }) => (
            <div key={date.toISOString()} className="flex items-center gap-3">
              <span className="w-20 text-right text-sm capitalize text-on-surface-variant">
                {format(date, 'MMM', { locale: es })}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-6 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-sm font-medium text-on-surface-variant">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
