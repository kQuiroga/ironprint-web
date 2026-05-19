'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray, useController, useWatch, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateRoutine } from '@/hooks/useRoutines';
import { useExercises, useCreateExercise } from '@/hooks/useExercises';
import { DayOfWeek, MuscleGroup } from '@/types/api.types';
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
  name: z.string().max(100).optional(),
  muscleGroups: z.array(z.nativeEnum(MuscleGroup)),
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

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.Chest]: 'Pecho',
  [MuscleGroup.Back]: 'Espalda',
  [MuscleGroup.Shoulders]: 'Hombros',
  [MuscleGroup.Biceps]: 'Bíceps',
  [MuscleGroup.Triceps]: 'Tríceps',
  [MuscleGroup.Forearms]: 'Antebrazos',
  [MuscleGroup.Abs]: 'Abdominales',
  [MuscleGroup.Quads]: 'Cuádriceps',
  [MuscleGroup.Hamstrings]: 'Isquiotibiales',
  [MuscleGroup.Glutes]: 'Glúteos',
  [MuscleGroup.Calves]: 'Gemelos',
  [MuscleGroup.FullBody]: 'Cuerpo completo',
  [MuscleGroup.Cardio]: 'Cardio',
  [MuscleGroup.Other]: 'Otro',
};

const ALL_MUSCLE_GROUPS = Object.values(MuscleGroup);

// ── ExerciseRow ───────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  register: UseFormRegister<RoutineForm>;
  errors: FieldErrors<RoutineForm>;
  dayIndex: number;
  exIndex: number;
  onRemove: () => void;
  availableExercises: ExerciseDto[];
  showLabels: boolean;
}

function ExerciseRow({ register, errors, dayIndex, exIndex, onRemove, availableExercises, showLabels }: ExerciseRowProps) {
  const exErrors = errors.days?.[dayIndex]?.exercises?.[exIndex];
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        {showLabels && (
          <label className="mb-1 block text-xs text-on-surface-variant">Ejercicio</label>
        )}
        <select
          {...register(`days.${dayIndex}.exercises.${exIndex}.exerciseId`)}
          className={cn(
            'w-full rounded-xl border px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
            exErrors?.exerciseId ? 'border-error' : 'border-outline-variant/20',
          )}
        >
          <option value="">Seleccioná...</option>
          {availableExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>
      <div className="w-20">
        {showLabels && (
          <label className="mb-1 block text-xs text-on-surface-variant">Series</label>
        )}
        <input
          type="number"
          {...register(`days.${dayIndex}.exercises.${exIndex}.targetSets`, { valueAsNumber: true })}
          placeholder="3"
          className={cn(
            'w-full rounded-xl border px-2 py-1.5 text-center text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
            exErrors?.targetSets ? 'border-error' : 'border-outline-variant/20',
          )}
        />
      </div>
      <div className="w-20">
        {showLabels && (
          <label className="mb-1 block text-xs text-on-surface-variant">Reps</label>
        )}
        <input
          type="number"
          {...register(`days.${dayIndex}.exercises.${exIndex}.targetReps`, { valueAsNumber: true })}
          placeholder="10"
          className={cn(
            'w-full rounded-xl border px-2 py-1.5 text-center text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high',
            exErrors?.targetReps ? 'border-error' : 'border-outline-variant/20',
          )}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-2xl px-2 py-1.5 text-sm text-on-surface-variant hover:bg-error-container/20 hover:text-error"
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
  const [showAll, setShowAll] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExGroup, setNewExGroup] = useState<MuscleGroup | ''>('');
  const createExercise = useCreateExercise();

  const { fields, append, remove } = useFieldArray({ control, name: `days.${index}.exercises` });

  const { field: muscleGroupsField } = useController({
    control,
    name: `days.${index}.muscleGroups`,
  });

  const selectedMuscleGroups = useWatch({ control, name: `days.${index}.muscleGroups` }) ?? [];

  const availableExercises =
    showAll || selectedMuscleGroups.length === 0
      ? catalogExercises
      : catalogExercises.filter((ex) => selectedMuscleGroups.includes(ex.muscleGroup));

  const noExercisesForGroups = selectedMuscleGroups.length > 0 && availableExercises.length === 0 && !showAll;

  function handleInlineCreate() {
    if (!newExName.trim()) return;
    const group = (newExGroup || selectedMuscleGroups[0] || MuscleGroup.Other) as MuscleGroup;
    createExercise.mutate(
      { name: newExName.trim(), muscleGroup: group },
      {
        onSuccess: () => {
          setNewExName('');
          setShowCreateForm(false);
        },
      },
    );
  }

  function toggleMuscleGroup(group: MuscleGroup) {
    const current = muscleGroupsField.value ?? [];
    muscleGroupsField.onChange(
      current.includes(group)
        ? current.filter((g) => g !== group)
        : [...current, group],
    );
  }

  const dayErrors = errors.days?.[index];

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest">
      {/* Header: día de semana + eliminar */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 px-5 py-3">
        <select
          {...register(`days.${index}.dayOfWeek`)}
          className="rounded-xl border border-outline-variant/20 px-3 py-1.5 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high"
        >
          {DAY_ORDER.map((day) => (
            <option key={day} value={day} disabled={usedDays.includes(day)}>
              {DAY_LABELS[day]}{usedDays.includes(day) ? ' (ya agregado)' : ''}
            </option>
          ))}
        </select>
        <button type="button" onClick={onRemove} className="text-sm text-on-surface-variant hover:text-error">
          Eliminar día
        </button>
      </div>

      {/* Nombre del día */}
      <div className="border-b border-outline-variant/10 px-5 py-3">
        <input
          {...register(`days.${index}.name`)}
          placeholder="Nombre del día (ej: Push, Pierna, Full Body)"
          className="w-full rounded-xl border border-outline-variant/20 px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 bg-surface-container-high"
        />
      </div>

      {/* Grupos musculares */}
      <div className="border-b border-outline-variant/10 px-5 py-3">
        <p className="mb-2 text-xs font-medium text-on-surface-variant">
          Grupos musculares (filtra los ejercicios disponibles)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => toggleMuscleGroup(group)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                selectedMuscleGroups.includes(group)
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
              )}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </button>
          ))}
        </div>
      </div>

      {/* Ejercicios */}
      <div className="space-y-2 px-5 py-3">
        {selectedMuscleGroups.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              {showAll
                ? 'Mostrando todos los ejercicios'
                : `${availableExercises.length} ejercicio${availableExercises.length !== 1 ? 's' : ''} para los grupos seleccionados`}
            </p>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-primary hover:text-primary-dim"
            >
              {showAll ? 'Volver al filtro' : 'Ver todos'}
            </button>
          </div>
        )}

        {fields.length === 0 && !noExercisesForGroups && !showCreateForm && (
          <p className="text-xs text-on-surface-variant">Sin ejercicios todavía.</p>
        )}

        {(noExercisesForGroups || showCreateForm) && (
          <div className="rounded-xl bg-surface-container p-3 space-y-2">
            <p className="text-xs text-on-surface-variant">
              {noExercisesForGroups ? 'No hay ejercicios para estos grupos. Creá uno:' : 'Nuevo ejercicio:'}
            </p>
            <div className="flex gap-2">
              <input
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleInlineCreate())}
                placeholder="Nombre del ejercicio"
                className="flex-1 rounded-xl border border-outline-variant/20 px-3 py-1.5 text-sm bg-surface-container-high outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={newExGroup || selectedMuscleGroups[0] || ''}
                onChange={(e) => setNewExGroup(e.target.value as MuscleGroup)}
                className="rounded-xl border border-outline-variant/20 px-2 py-1.5 text-sm bg-surface-container-high outline-none focus:ring-2 focus:ring-primary/20"
              >
                {(selectedMuscleGroups.length > 0 ? selectedMuscleGroups : ALL_MUSCLE_GROUPS).map((g) => (
                  <option key={g} value={g}>{MUSCLE_GROUP_LABELS[g]}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!newExName.trim() || createExercise.isPending}
                onClick={handleInlineCreate}
                className="rounded-2xl bg-primary-container px-3 py-1.5 text-sm font-medium text-on-primary-container hover:bg-primary-container/80 disabled:opacity-50"
              >
                {createExercise.isPending ? '...' : 'Crear'}
              </button>
              {!noExercisesForGroups && (
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setNewExName(''); }}
                  className="rounded-2xl px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}
        {fields.map((field, exIndex) => (
          <ExerciseRow
            key={field.id}
            register={register}
            errors={errors}
            dayIndex={index}
            exIndex={exIndex}
            onRemove={() => remove(exIndex)}
            availableExercises={availableExercises.length > 0 ? availableExercises : catalogExercises}
            showLabels={exIndex === 0}
          />
        ))}
        {dayErrors?.exercises?.root?.message && (
          <p className="text-xs text-error">{dayErrors.exercises.root.message}</p>
        )}
        <div className="flex items-center gap-4 mt-1">
          <button
            type="button"
            onClick={() => append({ exerciseId: '', targetSets: 3, targetReps: 10 })}
            className="text-xs font-medium text-primary hover:text-primary-dim"
          >
            + Agregar ejercicio
          </button>
          {!showCreateForm && !noExercisesForGroups && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="text-xs font-medium text-primary hover:text-primary-dim"
            >
              + Crear ejercicio nuevo
            </button>
          )}
        </div>
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
