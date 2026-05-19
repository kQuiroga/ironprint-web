'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRoutine, useUpdateRoutine } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { DayOfWeek } from '@/types/api.types';
import { cn } from '@/lib/cn';
import { DAY_ORDER } from '@/components/routines/constants';
import { routineFormSchema, RoutineFormValues, routineDtoToForm } from '@/components/routines/schema';
import { DayPanel } from '@/components/routines/DayPanel';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditRoutinePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: routine, isLoading } = useRoutine(id);
  const { data: catalogExercises = [] } = useExercises();
  const updateRoutine = useUpdateRoutine();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: { weeksDuration: 4, days: [] },
  });

  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control,
    name: 'days',
  });

  // T-10 — populate form from loaded DTO
  useEffect(() => {
    if (!routine) return;
    reset(routineDtoToForm(routine));
  }, [routine, reset]);

  const watchDays = watch('days');

  function getNextAvailableDay(): DayOfWeek {
    const used = (watchDays ?? []).map((d) => d.dayOfWeek);
    return DAY_ORDER.find((d) => !used.includes(d)) ?? DayOfWeek.Monday;
  }

  // T-13 — submit with full days tree
  function onSubmit(values: RoutineFormValues): void {
    updateRoutine.mutate(
      {
        id,
        body: {
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
      },
      { onSuccess: () => router.push(`/routines/${id}`) },
    );
  }

  // Loading skeleton (keep from original edit/page.tsx)
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/routines/${id}`}
          className="mb-3 inline-block text-sm text-on-surface-variant hover:text-on-surface"
        >
          ← {routine?.name ?? 'Rutina'}
        </Link>
        <h1 className="text-2xl font-bold text-on-surface">Editar rutina</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name + weeksDuration row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        {/* Days section — T-12 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-on-surface">Días</h2>
            <button
              type="button"
              onClick={() =>
                appendDay({
                  dayOfWeek: getNextAvailableDay(),
                  name: '',
                  muscleGroups: [],
                  exercises: [],
                })
              }
              disabled={dayFields.length >= 7}
              className="rounded-2xl border border-outline-variant/20 px-3 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              + Agregar día
            </button>
          </div>

          {dayFields.length === 0 && (
            <p className="text-sm text-on-surface-variant">
              Sin días configurados. Podés agregar uno con el botón de arriba.
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
          disabled={updateRoutine.isPending}
          className="w-full rounded-full signature-gradient py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
        >
          {updateRoutine.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
