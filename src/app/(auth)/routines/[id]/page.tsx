'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRoutine } from '@/hooks/useRoutines';

const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function RoutineDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: routine, isLoading, isError } = useRoutine(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (isError || !routine) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Rutina no encontrada.</p>
        <Link
          href="/routines"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Volver a rutinas
        </Link>
      </div>
    );
  }

  const sortedDays = [...(routine.days ?? [])].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek,
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/routines"
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Rutinas
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {routine.name}
          </h1>
          <Link
            href={`/routines/${id}/edit`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Editar
          </Link>
        </div>
        {routine.description && (
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {routine.description}
          </p>
        )}
      </div>

      {sortedDays.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Esta rutina no tiene días configurados.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => (
            <div
              key={day.id}
              className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {DAY_LABELS[day.dayOfWeek] ?? `Día ${day.dayOfWeek}`}
                </h2>
              </div>

              {day.exercises.length === 0 ? (
                <p className="px-5 py-3 text-sm text-zinc-500">
                  Sin ejercicios.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[...day.exercises]
                    .sort((a, b) => a.order - b.order)
                    .map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {exercise.exerciseName}
                        </span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          {exercise.sets} × {exercise.reps}
                          {exercise.weight ? ` @ ${exercise.weight} kg` : ''}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
