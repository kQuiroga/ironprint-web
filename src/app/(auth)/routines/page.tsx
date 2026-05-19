'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRoutines, useDeleteRoutine, useActivateRoutine } from '@/hooks/useRoutines';
import { cn } from '@/lib/cn';

export default function RoutinesPage() {
  const router = useRouter();
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const activateRoutine = useActivateRoutine();


  function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la rutina "${name}"?`)) return;
    deleteRoutine.mutate(id);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">
          Rutinas
        </h1>
        <Link
          href="/routines/new"
          className="rounded-full signature-gradient px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98]"
        >
          + Nueva rutina
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-surface-container-high"
            />
          ))}
        </div>
      )}

      {!isLoading && routines?.length === 0 && (
        <div className="py-16 text-center text-on-surface-variant">
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
                'flex items-center justify-between rounded-xl border bg-surface-container-lowest px-5 py-4',
                routine.isActive
                  ? 'border-primary'
                  : 'border-outline-variant/20',
              )}
            >
              <Link href={`/routines/${routine.id}`} className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-on-surface hover:text-primary">
                    {routine.name}
                  </p>
                  {routine.isActive && (
                    <span className="rounded-full bg-primary-container px-2 py-0.5 text-xs font-medium text-on-primary-container">
                      Activa
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  {routine.weeksDuration} semanas · {routine.days.length} días
                </p>
              </Link>

              <div className="ml-4 flex gap-1">
                {routine.isActive ? (
                  <button
                    disabled
                    className="rounded-2xl px-3 py-1.5 text-sm text-on-surface-variant/40 cursor-not-allowed"
                  >
                    Activa
                  </button>
                ) : (
                  <button
                    onClick={() => activateRoutine.mutate(routine.id, { onSuccess: () => router.push('/calendar') })}
                    disabled={activateRoutine.isPending}
                    className="rounded-2xl px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                  >
                    Activar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(routine.id, routine.name)}
                  disabled={deleteRoutine.isPending}
                  className="rounded-2xl px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-error-container/20 hover:text-error"
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
