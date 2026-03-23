'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoutine, useUpdateRoutine } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { cn } from '@/lib/cn';
import type { Control } from 'react-hook-form';

// ─── Esquemas (idénticos al formulario de creación) ────────────────────────────

const exerciseSchema = z.object({
  exerciseId: z.string().min(1, 'Seleccioná un ejercicio'),
  sets: z.coerce.number().int().positive('Mínimo 1'),
  reps: z.coerce.number().int().positive('Mínimo 1'),
  weight: z.coerce.number().nonnegative().optional(),
});

const daySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  exercises: z.array(exerciseSchema).min(1, 'Agregá al menos un ejercicio'),
});

const routineSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(300).optional(),
  days: z.array(daySchema).min(1, 'Agregá al menos un día'),
});

type RoutineForm = z.infer<typeof routineSchema>;

// ─── Opciones ─────────────────────────────────────────────────────────────────

const DAY_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

// ─── Componente: ejercicios de un día ────────────────────────────────────────

function DayExercises({
  dayIndex,
  control,
  register,
  exerciseOptions,
}: {
  dayIndex: number;
  control: Control<RoutineForm>;
  register: ReturnType<typeof useForm<RoutineForm>>['register'];
  exerciseOptions: { id: string; name: string }[];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${dayIndex}.exercises`,
  });

  return (
    <div className="mt-3 space-y-2">
      {fields.map((field, exIdx) => (
        <div
          key={field.id}
          className="flex flex-wrap items-end gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50"
        >
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-xs text-zinc-500">Ejercicio</label>
            <select
              {...register(`days.${dayIndex}.exercises.${exIdx}.exerciseId`)}
              className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">Seleccioná</option>
              {exerciseOptions.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-16">
            <label className="mb-1 block text-xs text-zinc-500">Series</label>
            <input
              type="number"
              {...register(`days.${dayIndex}.exercises.${exIdx}.sets`)}
              className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="w-16">
            <label className="mb-1 block text-xs text-zinc-500">Reps</label>
            <input
              type="number"
              {...register(`days.${dayIndex}.exercises.${exIdx}.reps`)}
              className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="w-20">
            <label className="mb-1 block text-xs text-zinc-500">Peso (kg)</label>
            <input
              type="number"
              step="0.5"
              placeholder="—"
              {...register(`days.${dayIndex}.exercises.${exIdx}.weight`)}
              className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <button
            type="button"
            onClick={() => remove(exIdx)}
            className="rounded-lg px-2 py-1.5 text-sm text-zinc-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ exerciseId: '', sets: 3, reps: 10, weight: undefined })}
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        + Agregar ejercicio
      </button>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditRoutinePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: routine, isLoading: isLoadingRoutine } = useRoutine(id);
  const { data: exercises } = useExercises();
  const updateRoutine = useUpdateRoutine();

  const exerciseOptions = (exercises ?? []).map((e) => ({ id: e.id, name: e.name }));

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoutineForm>({
    resolver: zodResolver(routineSchema),
    defaultValues: { name: '', description: '', days: [] },
  });

  // Pre-popular el formulario cuando carga la rutina
  useEffect(() => {
    if (!routine) return;
    reset({
      name: routine.name,
      description: routine.description ?? '',
      days: [...(routine.days ?? [])]
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((day) => ({
          dayOfWeek: day.dayOfWeek,
          exercises: [...day.exercises]
            .sort((a, b) => a.order - b.order)
            .map((ex) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight ?? undefined,
            })),
        })),
    });
  }, [routine, reset]);

  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control,
    name: 'days',
  });

  const usedDays = useWatch({ control, name: 'days' })?.map((d) => d.dayOfWeek) ?? [];

  function onSubmit(values: RoutineForm) {
    updateRoutine.mutate(
      {
        id,
        body: {
          name: values.name,
          description: values.description || undefined,
          days: values.days.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            exercises: day.exercises.map((ex, exIdx) => ({
              exerciseId: ex.exerciseId,
              order: exIdx + 1,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight || undefined,
            })),
          })),
        },
      },
      { onSuccess: () => router.push(`/routines/${id}`) },
    );
  }

  if (isLoadingRoutine) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/routines/${id}`}
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← {routine?.name ?? 'Rutina'}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Editar rutina
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre y descripción */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100',
                errors.name
                  ? 'border-red-400'
                  : 'border-zinc-200 dark:border-zinc-700',
              )}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Días */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Días</h2>
            {errors.days && !Array.isArray(errors.days) && (
              <p className="text-xs text-red-500">{errors.days.message}</p>
            )}
          </div>

          <div className="space-y-4">
            {dayFields.map((field, dayIdx) => (
              <div
                key={field.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <select
                    {...register(`days.${dayIdx}.dayOfWeek`)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {DAY_OPTIONS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={
                          usedDays.includes(opt.value) &&
                          usedDays.indexOf(opt.value) !== dayIdx
                        }
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeDay(dayIdx)}
                    className="text-sm text-zinc-400 hover:text-red-500"
                  >
                    Eliminar día
                  </button>
                </div>

                <DayExercises
                  dayIndex={dayIdx}
                  control={control}
                  register={register}
                  exerciseOptions={exerciseOptions}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              appendDay({
                dayOfWeek: DAY_OPTIONS.find((d) => !usedDays.includes(d.value))?.value ?? 1,
                exercises: [],
              })
            }
            disabled={dayFields.length >= 7}
            className="mt-3 rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-500 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 dark:border-zinc-700"
          >
            + Agregar día
          </button>
        </div>

        <button
          type="submit"
          disabled={updateRoutine.isPending}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {updateRoutine.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
