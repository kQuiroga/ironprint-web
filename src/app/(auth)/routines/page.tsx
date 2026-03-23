'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRoutines, useDeleteRoutine } from '@/hooks/useRoutines';

export default function RoutinesPage() {
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();

  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la rutina "${name}"?`)) return;
    deleteRoutine.mutate(id);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Rutinas
        </h1>
        <Link
          href="/routines/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Nueva rutina
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      )}

      {!isLoading && routines?.length === 0 && (
        <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
          <p className="text-lg font-medium">No tenés rutinas todavía.</p>
          <p className="mt-1 text-sm">Creá tu primera rutina para empezar.</p>
        </div>
      )}

      {!isLoading && routines && routines.length > 0 && (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Link href={`/routines/${routine.id}`} className="flex-1">
                <p className="font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">
                  {routine.name}
                </p>
                {routine.description && (
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {routine.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  Creada el{' '}
                  {format(new Date(routine.createdAt), "d 'de' MMMM yyyy", {
                    locale: es,
                  })}
                </p>
              </Link>

              <button
                onClick={() => handleDelete(routine.id, routine.name)}
                disabled={deleteRoutine.isPending}
                className="ml-4 rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
