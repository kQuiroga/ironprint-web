'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRoutines, useDeleteRoutine, useActivateRoutine, useDeactivateRoutine } from '@/hooks/useRoutines';
import { cn } from '@/lib/cn';

export default function RoutinesPage() {
  const router = useRouter();
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const activateRoutine = useActivateRoutine();
  const deactivateRoutine = useDeactivateRoutine();

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
              className={cn(
                'flex items-center justify-between rounded-xl border bg-white px-5 py-4 dark:bg-zinc-900',
                routine.isActive
                  ? 'border-blue-500 dark:border-blue-500'
                  : 'border-zinc-200 dark:border-zinc-800',
              )}
            >
              <Link href={`/routines/${routine.id}`} className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">
                    {routine.name}
                  </p>
                  {routine.isActive && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                      Activa
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-600">
                  {routine.weeksDuration} semanas · {routine.days.length} días
                </p>
              </Link>

              <div className="ml-4 flex gap-1">
                {routine.isActive ? (
                  <button
                    onClick={() => deactivateRoutine.mutate(routine.id)}
                    disabled={deactivateRoutine.isPending}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => activateRoutine.mutate(routine.id, { onSuccess: () => router.push('/calendar') })}
                    disabled={activateRoutine.isPending}
                    className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                  >
                    Activar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(routine.id, routine.name)}
                  disabled={deleteRoutine.isPending}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
