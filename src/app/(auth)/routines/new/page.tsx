'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRoutine } from '@/hooks/useRoutines';
import { useExercises } from '@/hooks/useExercises';
import { DayOfWeek } from '@/types/api.types';
import type { ExerciseDto } from '@/types/api.types';
import { cn } from '@/lib/cn';

// ── Schemas ───────────────────────────────────────────────────────────────────

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1, 'Seleccioná un ejercicio'),
  targetSets: z.number().int().min(1).max(20),
  targetReps: z.number().int().min(1).max(100),
});

const dayEntrySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  exercises: z.array(exerciseEntrySchema).min(1, 'Agregá al menos un ejercicio'),
});

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  weeksDuration: z.number().int().min(1).max(52),
  days: z.array(dayEntrySchema),
});

type RoutineForm = z.infer<typeof schema>;

// ── Day helpers ───────────────────────────────────────────────────────────────

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'Lunes',
  [DayOfWeek.Tuesday]: 'Martes',
  [DayOfWeek.Wednesday]: 'Miércoles',
  [DayOfWeek.Thursday]: 'Jueves',
  [DayOfWeek.Friday]: 'Viernes',
  [DayOfWeek.Saturday]: 'Sábado',
  [DayOfWeek.Sunday]: 'Domingo',
};

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
  DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday,
];

// ── ExerciseRow ───────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  register: UseFormRegister<RoutineForm>;
  errors: FieldErrors<RoutineForm>;
  dayIndex: number;
  exIndex: number;
  onRemove: () => void;
  catalogExercises: ExerciseDto[];
  showLabels: boolean;
}

function ExerciseRow({ register, errors, dayIndex, exIndex, onRemove, catalogExercises, showLabels }: ExerciseRowProps) {
  const exErrors = errors.days?.[dayIndex]?.exercises?.[exIndex];
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        {showLabels && (
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Ejercicio</label>
        )}
        <select
          {...register(`days.${dayIndex}.exercises.${exIndex}.exerciseId`)}
          className={cn(
            'w-full rounded-lg border px-3 py-1.5 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
            exErrors?.exerciseId ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
          )}
        >
          <option value="">Seleccioná...</option>
          {catalogExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div className="w-20">
        {showLabels && (
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Series</label>
        )}
        <input
          type="number"
          {...register(`days.${dayIndex}.exercises.${exIndex}.targetSets`, { valueAsNumber: true })}
          placeholder="3"
          className={cn(
            'w-full rounded-lg border px-2 py-1.5 text-center text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
            exErrors?.targetSets ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
          )}
        />
      </div>
      <div className="w-20">
        {showLabels && (
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Reps</label>
        )}
        <input
          type="number"
          {...register(`days.${dayIndex}.exercises.${exIndex}.targetReps`, { valueAsNumber: true })}
          placeholder="10"
          className={cn(
            'w-full rounded-lg border px-2 py-1.5 text-center text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100',
            exErrors?.targetReps ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700',
          )}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg px-2 py-1.5 text-sm text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        x
      </button>
    </div>
  );
}

// ── DayPanel ──────────────────────────────────────────────────────────────────

interface DayPanelProps {
  control: Control<RoutineForm>;
  register: UseFormRegister<RoutineForm>;
  errors: FieldErrors<RoutineForm>;
  index: number;
  onRemove: () => void;
  usedDays: DayOfWeek[];
  catalogExercises: ExerciseDto[];
}

function DayPanel({ control, register, errors, index, onRemove, usedDays, catalogExercises }: DayPanelProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${index}.exercises`,
  });

  const dayErrors = errors.days?.[index];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <select
          {...register(`days.${index}.dayOfWeek`)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {DAY_ORDER.map((day) => (
            <option key={day} value={day} disabled={usedDays.includes(day)}>
              {DAY_LABELS[day]}{usedDays.includes(day) ? ' (ya agregado)' : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-zinc-400 hover:text-red-500"
        >
          Eliminar día
        </button>
      </div>

      <div className="space-y-2 px-5 py-3">
        {fields.length === 0 && (
          <p className="text-xs text-zinc-400">Sin ejercicios todavía.</p>
        )}
        {fields.map((field, exIndex) => (
          <ExerciseRow
            key={field.id}
            register={register}
            errors={errors}
            dayIndex={index}
            exIndex={exIndex}
            onRemove={() => remove(exIndex)}
            catalogExercises={catalogExercises}
            showLabels={exIndex === 0}
          />
        ))}
        {dayErrors?.exercises?.root?.message && (
          <p className="text-xs text-red-500">{dayErrors.exercises.root.message}</p>
        )}
        <button
          type="button"
          onClick={() => append({ exerciseId: '', targetSets: 3, targetReps: 10 })}
          className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          + Agregar ejercicio
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewRoutinePage() {
  const router = useRouter();
  const createRoutine = useCreateRoutine();
  const { data: catalogExercises = [] } = useExercises();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<RoutineForm>({
    resolver: zodResolver(schema),
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

  function onSubmit(values: RoutineForm): void {
    createRoutine.mutate(
      {
        name: values.name,
        weeksDuration: values.weeksDuration,
        days: values.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
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
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Rutinas
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Nueva rutina</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
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
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Días</h2>
            <button
              type="button"
              onClick={() => appendDay({ dayOfWeek: getNextAvailableDay(), exercises: [] })}
              disabled={dayFields.length >= 7}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              + Agregar día
            </button>
          </div>

          {dayFields.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
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
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {createRoutine.isPending ? 'Creando...' : 'Crear rutina'}
        </button>
      </form>
    </div>
  );
}
