'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRoutine } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { DayOfWeek } from '@/types/api.types';
import { cn } from '@/lib/cn';
import { DAY_ORDER } from '@/components/routines/constants';
import { routineFormSchema, RoutineFormValues } from '@/components/routines/schema';
import { DayPanel } from '@/components/routines/DayPanel';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewRoutinePage() {
  const router = useRouter();
  const createRoutine = useCreateRoutine();
  const { data: catalogExercises = [] } = useExercises();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: { weeksDuration: 4, days: [] },
  });

  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control,
    name: 'days',
  });

  const watchDays = watch('days');

  function getNextAvailableDay(): DayOfWeek {
    const used = (watchDays ?? []).map((d) => d.dayOfWeek);
    return DAY_ORDER.find((d) => !used.includes(d)) ?? DayOfWeek.Monday;
  }

  function onSubmit(values: RoutineFormValues): void {
    createRoutine.mutate(
      {
        name: values.name,
        weeksDuration: values.weeksDuration,
        days: values.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          name: day.name || undefined,
          muscleGroups: day.muscleGroups,
          exercises: day.exercises.map((ex, j) => ({
            exerciseId: ex.exerciseId,
            order: j + 1,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
          })),
        })),
      },
      { onSuccess: (id) => router.push(`/routines/${id}`) },
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/routines"
          className="mb-3 inline-block text-sm text-on-surface-variant hover:text-on-surface"
        >
          Rutinas
        </Link>
        <h1 className="text-2xl font-bold text-on-surface">Nueva rutina</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-on-surface-variant">
              Nombre <span className="text-error">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ej: Push / Pull / Legs"
              className={cn(
                'w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
                errors.name ? 'border-error' : 'border-outline-variant/20',
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-on-surface">Días</h2>
            <button
              type="button"
              onClick={() => appendDay({ dayOfWeek: getNextAvailableDay(), name: '', muscleGroups: [], exercises: [] })}
              disabled={dayFields.length >= 7}
              className="rounded-2xl border border-outline-variant/20 px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              + Agregar día
            </button>
          </div>

          {dayFields.length === 0 && (
            <p className="text-sm text-on-surface-variant">
              Podés crear la rutina sin días y configurarlos después.
            </p>
          )}

          {dayFields.map((field, index) => (
            <DayPanel
              key={field.id}
              control={control}
              register={register}
              errors={errors}
              index={index}
              onRemove={() => removeDay(index)}
              usedDays={(watchDays ?? []).map((d) => d.dayOfWeek).filter((_, i) => i !== index)}
              catalogExercises={catalogExercises}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={createRoutine.isPending}
          className="w-full rounded-full signature-gradient py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
        >
          {createRoutine.isPending ? 'Creando...' : 'Crear rutina'}
        </button>
      </form>
    </div>
  );
}
