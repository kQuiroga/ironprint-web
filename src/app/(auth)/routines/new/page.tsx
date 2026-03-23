'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRoutine } from '@/hooks/useRoutines';
import { cn } from '@/lib/cn';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  weeksDuration: z.number().int().min(1).max(52),
});
type RoutineForm = z.infer<typeof schema>;

export default function NewRoutinePage() {
  const router = useRouter();
  const createRoutine = useCreateRoutine();

  const { register, handleSubmit, formState: { errors } } = useForm<RoutineForm>({
    resolver: zodResolver(schema),
    defaultValues: { weeksDuration: 4 },
  });

  function onSubmit(values: RoutineForm) {
    createRoutine.mutate(values, {
      onSuccess: (id) => router.push(`/routines/${id}`),
    });
  }

  return (
    <div className="max-w-sm">
      <div className="mb-6">
        <Link
          href="/routines"
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Rutinas
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Nueva rutina
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            placeholder="Ej: Push / Pull / Legs"
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100',
              errors.name ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Duración (semanas)
          </label>
          <input
            type="number"
            {...register('weeksDuration', { valueAsNumber: true })}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100',
              errors.weeksDuration ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
            )}
          />
          {errors.weeksDuration && (
            <p className="mt-1 text-xs text-red-500">{errors.weeksDuration.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={createRoutine.isPending}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {createRoutine.isPending ? 'Creando...' : 'Crear rutina'}
        </button>
      </form>
    </div>
  );
}
