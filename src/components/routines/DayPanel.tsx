'use client';

import { useState } from 'react';
import { useFieldArray, useController, useWatch, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { MuscleGroup } from '@/types/api.types';
import type { DayOfWeek, ExerciseDto } from '@/types/api.types';
import { useCreateExercise } from '@/hooks/useExercises';
import { cn } from '@/lib/cn';
import { DAY_LABELS, DAY_ORDER, MUSCLE_GROUP_LABELS, ALL_MUSCLE_GROUPS } from './constants';
import { RoutineFormValues } from './schema';
import { ExerciseRow } from './ExerciseRow';

// ── DayPanel ──────────────────────────────────────────────────────────────────

interface DayPanelProps {
  control: Control<RoutineFormValues>;
  register: UseFormRegister<RoutineFormValues>;
  errors: FieldErrors<RoutineFormValues>;
  index: number;
  onRemove: () => void;
  usedDays: DayOfWeek[];
  catalogExercises: ExerciseDto[];
}

export function DayPanel({ control, register, errors, index, onRemove, usedDays, catalogExercises }: DayPanelProps) {
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
