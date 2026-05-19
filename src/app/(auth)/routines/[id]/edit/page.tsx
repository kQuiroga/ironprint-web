'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoutine, useUpdateRoutine } from '@/hooks/useRoutines';
import { cn } from '@/lib/cn';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  weeksDuration: z.number().int().min(1).max(52),
});
type RoutineForm = z.infer<typeof schema>;

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditRoutinePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: routine, isLoading } = useRoutine(id);
  const updateRoutine = useUpdateRoutine();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoutineForm>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!routine) return;
    reset({ name: routine.name, weeksDuration: routine.weeksDuration });
  }, [routine, reset]);

  function onSubmit(values: RoutineForm) {
    updateRoutine.mutate(
      { id, body: values },
      { onSuccess: () => router.push(`/routines/${id}`) },
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-sm space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-10 animate-pulse rounded-xl bg-surface-container-high" />
        <div className="h-10 animate-pulse rounded-xl bg-surface-container-high" />
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      <div className="mb-6">
        <Link
          href={`/routines/${id}`}
          className="mb-3 inline-block text-sm text-on-surface-variant hover:text-on-surface"
        >
          ← {routine?.name ?? 'Rutina'}
        </Link>
        <h1 className="text-2xl font-bold text-on-surface">
          Editar rutina
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            Nombre <span className="text-error">*</span>
          </label>
          <input
            {...register('name')}
            className={cn(
              'w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
              errors.name ? 'border-error' : 'border-outline-variant/20',
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-error">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            Duración (semanas)
          </label>
          <input
            type="number"
            {...register('weeksDuration', { valueAsNumber: true })}
            className={cn(
              'w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
              errors.weeksDuration ? 'border-error' : 'border-outline-variant/20',
            )}
          />
        </div>

        <button
          type="submit"
          disabled={updateRoutine.isPending}
          className="w-full rounded-full signature-gradient py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
        >
          {updateRoutine.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
